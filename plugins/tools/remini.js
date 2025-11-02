import remini from '../../toolkit/scrape/remini.js'
import { downloadMediaMessage } from '@whiskeysockets/baileys'

export default {
  name: 'remini',
  command: ['remini', 'hd'],
  tags: 'Tools Menu',
  desc: 'Upscale kualitas gambar (scale 2-4)',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo,
          quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage,
          imageSource = quotedMsg?.imageMessage || msg.message?.imageMessage

    if (!imageSource)
      return conn.sendMessage(chatId, { 
        text: `Kirim atau balas gambar dengan caption *${prefix}${commandText} [scale]*\nContoh:\n${prefix}${commandText} 4\nNilai scale bisa 2, 3, atau 4.` 
      }, { quoted: msg })

    let media
    try {
      if (quotedMsg || msg.message)
        media = await downloadMediaMessage({ message: quotedMsg || msg.message }, 'buffer', {}),
        !media ? (() => { throw new Error('Media tidak terunduh!') })() : null
    } catch (e) {
      return conn.sendMessage(chatId, { text: `Gagal mengunduh media! ${e.message}` }, { quoted: msg })
    }

    await conn.sendMessage(chatId, { react: { text: '🕒', key: msg.key } })

    const scale = parseInt(args[0]) || 4
    if (![2, 3, 4].includes(scale))
      return conn.sendMessage(chatId, { text: 'Nilai scale harus 2, 3, atau 4!' }, { quoted: msg })

    try {
      const result = await remini(media, scale)
      return !result
        ? conn.sendMessage(chatId, { text: 'Gagal memproses gambar.' }, { quoted: msg })
        : await conn.sendMessage(chatId, { image: result, caption: `Gambar berhasil di-upscale!\nSkala: *${scale}x*` }, { quoted: msg })
    } catch (e) {
      console.error('Error plugin remini:', e),
      conn.sendMessage(chatId, { text: `Gagal memproses gambar! ${e.message}` }, { quoted: msg })
    }
  }
}