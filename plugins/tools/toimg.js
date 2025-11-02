import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { mediaMessage } from '../../toolkit/exif.js'

export default {
  name: 'toimg',
  command: ['toimg'],
  tags: 'Tools Menu',
  desc: 'Mengonversi stiker menjadi gambar',
  prefix: !0,
  owner: !1,
  premium: !0,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo
    try {
      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage,
            sticker = quotedMessage?.stickerMessage || msg.message?.stickerMessage

      if (!sticker || sticker.isAnimated)
        return !sticker
          ? conn.sendMessage(chatId, { text: 'Balas stiker atau kirim stiker dengan caption *toimg* untuk mengonversi!' }, { quoted: msg })
          : conn.sendMessage(chatId, { text: 'Stiker animasi tidak bisa dikonversi menjadi gambar.' }, { quoted: msg })

      const tempDir = path.join(path.resolve(), 'temp')
      fs.existsSync(tempDir) ? 0 : fs.mkdirSync(tempDir, { recursive: !0 })

      const baseName = `${Date.now()}`,
            webpPath = await mediaMessage({ message: quotedMessage || msg.message }, path.join(tempDir, baseName)),
            outputPath = `${webpPath}.png`

      exec(`ffmpeg -i "${webpPath}" "${outputPath}"`, async err => {
        await fs.promises.unlink(webpPath).catch(() => {})
        return err || !fs.existsSync(outputPath)
          ? conn.sendMessage(chatId, { text: `Konversi gagal: ${err?.message || 'Tidak diketahui'}` }, { quoted: msg })
          : (await conn.sendMessage(chatId, { image: await fs.promises.readFile(outputPath), caption: 'Berhasil dikonversi!' }, { quoted: msg }),
             await fs.promises.unlink(outputPath).catch(() => {}))
      })
    } catch (error) {
      console.error('[ERROR] toimg:', error),
      conn.sendMessage(chatId, { text: `Gagal mengonversi: ${error.message}` }, { quoted: msg })
    }
  }
}