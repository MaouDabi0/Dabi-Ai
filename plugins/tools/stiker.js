import fs from 'fs'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { writeExifImg, writeExifVid } from '../../toolkit/exif.js'

export default {
  name: 'stiker',
  command: ['s', 'stiker', 'sticker'],
  tags: 'Tools Menu',
  desc: 'Membuat sticker',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo,
          quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage,
          isImage = quoted?.imageMessage || msg.message?.imageMessage,
          isVideo = quoted?.videoMessage || msg.message?.videoMessage,
          targetMedia = quoted || msg.message

    if (!isImage && !isVideo)
      return conn.sendMessage(chatId, {
        text: 'Balas gambar/video dengan caption *s*, *stiker*, atau *sticker* atau kirim langsung media dengan caption yang sama!'
      }, { quoted: msg })

    let media
    try {
      media = await downloadMediaMessage({ message: targetMedia }, 'buffer')
      if (!media) throw new Error('Media tidak terunduh!')
    } catch (e) {
      return conn.sendMessage(chatId, { text: `Gagal mengunduh media! ${e.message}` }, { quoted: msg })
    }

    const meta = { packname: footer, author: msg.pushName }

    try {
      const stickerPath = isImage ? await writeExifImg(media, meta) : await writeExifVid(media, meta),
            stickerBuffer = fs.readFileSync(stickerPath)
      if (!stickerPath) throw new Error('Gagal membuat stiker!')
      await conn.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg })
    } catch (e) {
      return conn.sendMessage(chatId, { text: `Gagal membuat stiker! ${e.message}` }, { quoted: msg })
    }
  }
}