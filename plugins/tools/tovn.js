import { downloadMediaMessage } from '@whiskeysockets/baileys'

export default {
  name: 'tovn',
  command: ['tovn'],
  tags: 'Tools Menu',
  desc: 'Convert video/audio menjadi VN',
  prefix: !0,
  owner: !1,
  premium: !0,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage,
            isAudio = quoted?.audioMessage || msg.message?.audioMessage,
            isVideo = quoted?.videoMessage || msg.message?.videoMessage

      if (!isAudio && !isVideo)
        return conn.sendMessage(chatId, { text: 'Reply atau kirim video/audio dengan caption *.tovn*' }, { quoted: msg })

      try {
        const media = await downloadMediaMessage({ message: quoted || msg.message }, 'buffer')
        if (!media) throw new Error('Media tidak terunduh!')
        await vn(conn, chatId, media, msg)
      } catch (e) {
        return conn.sendMessage(chatId, { text: `Gagal mengunduh media! ${e.message}` }, { quoted: msg })
      }
    } catch (e) {
      console.error('tovn Error:', e)
      conn.sendMessage(chatId, { text: 'Gagal convert ke VN.' }, { quoted: msg })
    }
  }
}