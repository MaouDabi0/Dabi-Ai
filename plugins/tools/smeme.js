import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { writeExifImg } from '../../toolkit/exif.js'
import { upUguu, genMemeBuf } from '../../toolkit/scrape/smeme.js'
import fs from 'fs'

export default {
  name: 'smeme',
  command: ['smeme', 'stickermeme'],
  tags: 'Tools Menu',
  desc: 'Membuat stiker meme dari gambar dengan teks atas dan bawah.',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, pushName } = chatInfo,
            quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage,
            mediaMsg = quotedMessage || msg.message,
            isImage = (quotedMessage?.imageMessage || quotedMessage?.stickerMessage || (quotedMessage?.documentMessage?.mimetype || '').startsWith('image/')) ||
                      (msg.message?.imageMessage || msg.message?.stickerMessage || (msg.message?.documentMessage?.mimetype || '').startsWith('image/'))

      if (!isImage || !args.length)
        return conn.sendMessage(chatId, { 
          text: !isImage
            ? `Balas gambar/stiker atau kirim gambar dengan caption:\n*${prefix}${commandText} teks_atas teks_bawah*\nContoh: *${prefix}${commandText} halo semuanya*`
            : `Masukkan teks untuk meme!\nFormat:\n*${prefix}${commandText} teks_atas teks_bawah*\nContoh: *${prefix}${commandText} halo semuanya*`
        }, { quoted: msg })

      const mediaBuffer = await downloadMediaMessage({ message: mediaMsg }, 'buffer', {})
      if (!mediaBuffer) throw new Error('Gagal mengunduh media!')

      const [atas, ...bawahArr] = args,
            bawah = bawahArr.join(' ') || '-',
            imageUrl = await upUguu(mediaBuffer, 'smeme.jpg', 'image/jpeg')
      if (!imageUrl) throw new Error('Gagal upload gambar ke hosting!')

      const memeBuffer = await genMemeBuf(imageUrl, atas, bawah)
      if (!Buffer.isBuffer(memeBuffer)) throw new Error('Format gambar meme tidak valid.')

      const stickerPath = await writeExifImg(memeBuffer, { packname: `${footer}`, author: `${pushName}` }),
            stickerBuffer = fs.readFileSync(stickerPath)

      await conn.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg })
    } catch (err) {
      console.error('smeme error:', err)
      conn.sendMessage(chatInfo.chatId, { text: `Gagal membuat meme:\n${err.message}` }, { quoted: msg })
    }
  }
}