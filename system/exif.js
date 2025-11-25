import fs from 'fs'
import os from 'os'
import path from 'path'
import { randomBytes } from 'crypto'
import ffmpeg from 'fluent-ffmpeg'
import webp from 'node-webpmux'
import { exec } from 'child_process'
import axios from 'axios'
import { downloadContentFromMessage } from 'baileys'
import { fileTypeFromBuffer } from 'file-type'

const tmpPath = ext => path.join(os.tmpdir(), `${randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`),
      saveTemp = (data, ext) => {
        const filePath = tmpPath(ext)
        fs.writeFileSync(filePath, data)
        return filePath
      },
      readAndDelete = filePath => {
        const data = fs.readFileSync(filePath)
        fs.unlinkSync(filePath)
        return data
      }

export async function mediaMessage(msg, filename, attachExtension = !0) {
  try {
    const mediaMsg = msg.message?.imageMessage
                  || msg.message?.videoMessage
                  || msg.message?.stickerMessage
                  || msg.message?.documentMessage
                  || msg.message?.audioMessage
    if (!mediaMsg?.mimetype) throw new Error('Media tidak valid atau tidak ditemukan.')

    const mime = mediaMsg.mimetype,
          type = mime.split('/')[0],
          stream = await downloadContentFromMessage(mediaMsg, type)
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
    if (!buffer.length) throw new Error('Buffer kosong, media mungkin belum terunduh.')

    const fileTypeResult = await fileTypeFromBuffer(buffer)
    if (!fileTypeResult) throw new Error('Tidak bisa mendeteksi tipe file.')

    const trueFileName = attachExtension ? `${filename}.${fileTypeResult.ext}` : filename
    fs.writeFileSync(trueFileName, buffer)
    return trueFileName
  } catch (err) { throw new Error(`Gagal mengambil media: ${err.message}`) }
}

export const imageToWebp = media => new Promise((resolve, reject) => {
  const input = saveTemp(media, 'jpg'),
        output = tmpPath('webp')
  ffmpeg(input)
    .on('error', reject)
    .on('end', () => resolve(readAndDelete(output)))
    .addOutputOptions([
      '-vcodec', 'libwebp',
      "-vf scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15," +
      "pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse"
    ])
    .toFormat('webp')
    .save(output)
})

export const videoToWebp = media => new Promise((resolve, reject) => {
  const input = saveTemp(media, 'mp4'),
        output = tmpPath('webp')
  ffmpeg(input)
    .on('error', reject)
    .on('end', () => resolve(readAndDelete(output)))
    .addOutputOptions([
      '-vcodec', 'libwebp',
      "-vf scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15," +
      "pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
      '-loop', '0', '-ss', '00:00:00', '-t', '00:00:05',
      '-preset', 'default', '-an', '-vsync', '0'
    ])
    .toFormat('webp')
    .save(output)
})

async function writeExif(media, metadata, isVideo = !1, converted = !1) {
  const webpData = converted ? media : await (isVideo ? videoToWebp(media) : imageToWebp(media)),
        input = saveTemp(webpData, 'webp'),
        output = tmpPath('webp')
  if (metadata.packname || metadata.author) {
    const img = new webp.Image(),
          json = {
            'sticker-pack-id': 'https://github.com/MaouDabi0',
            'sticker-pack-name': metadata.packname,
            'sticker-pack-publisher': metadata.author,
            'emojis': metadata.categories || ['']
          },
          exifAttr = Buffer.from([0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00]),
          jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8'),
          exif = Buffer.concat([exifAttr, jsonBuff])
    exif.writeUIntLE(jsonBuff.length, 14, 4)
    await img.load(input)
    fs.unlinkSync(input)
    img.exif = exif
    await img.save(output)
    return output
  }
}

export const writeExifImg = (media, metadata, converted) => writeExif(media, metadata, !1, converted),
             writeExifVid = (media, metadata, converted) => writeExif(media, metadata, !0, converted)

export async function generateQuotly(text, name, color = '') {
  try {
    const url = `${global.zellApi}/tools/qc?text=${encodeURIComponent(text)}&name=${encodeURIComponent(name)}&color=${encodeURIComponent(color)}`,
          { data } = await axios.get(url, { headers: { Accept: 'application/json' }, timeout: 3e4 })
    if (!data?.status || !data?.result?.image) throw new Error(data?.message || 'Gagal menghasilkan gambar.')
    return Buffer.from(data.result.image, 'base64')
  } catch (err) { throw new Error(`Gagal membuat kutipan:\n${err.message}`) }
}

export const convertToWebp = buffer => new Promise((resolve, reject) => {
  const input = tmpPath('png'),
        output = tmpPath('webp')
  fs.writeFileSync(input, buffer)
  exec(`ffmpeg -i "${input}" -vf "scale=512:-1:flags=lanczos" -c:v libwebp -lossless 1 -qscale 100 "${output}"`, err => {
    fs.unlinkSync(input)
    if (err) { fs.existsSync(output) && fs.unlinkSync(output); return reject(err) }
    try {
      const result = fs.readFileSync(output)
      fs.unlinkSync(output)
      resolve(result)
    } catch (e) { reject(e) }
  })
})

export const sendImageAsSticker = async (conn, chatId, webpBuffer, msg) => {
  try {
    await conn.sendMessage(chatId, { sticker: webpBuffer, mimetype: 'image/webp', packname: 'Dabi Chan', author: 'Quoted Sticker' }, { quoted: msg })
  } catch (err) {
    console.error('Error sending sticker:', err)
    throw err
  }
}