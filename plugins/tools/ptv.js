import { downloadMediaMessage } from '@whiskeysockets/baileys'

export default {
  name: 'Personal Talk Vidio',
  command: ['ptv', 'pvt'],
  tags: 'Tools Menu',
  desc: 'Generate Ptv studio',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo,
          quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage,
          vid = quoted?.videoMessage || msg.message?.videoMessage

    if (!vid) return conn.sendMessage(chatId, { text: 'Balas atau kirim video dengan caption *.ptv* atau *.pvt*' }, { quoted: msg })

    try {
      const buffer = await downloadMediaMessage({ message: quoted || msg.message }, 'buffer', {}, { logger: conn.logger, reuploadRequest: conn.updateMediaMessage })
      if (!buffer) throw new Error('Gagal mengunduh video')

      await conn.sendMessage(chatId, { video: buffer, mimetype: 'video/mp4', ptv: !0 })
    } catch (err) {
      console.error('pvt.js:', err),
      await conn.sendMessage(chatId, { text: `Terjadi kesalahan:\n${err.message}` }, { quoted: msg })
    }
  }
}