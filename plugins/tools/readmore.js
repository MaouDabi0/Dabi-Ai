export default {
  name: 'readmore',
  command: ['rd', 'readmore'],
  tags: 'Tools Menu',
  desc: 'Membuat teks read more.',
  prefix: !0,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId } = chatInfo,
            fullText = args.join(' ')

      if (!fullText.includes('|'))
        return conn.sendMessage(chatId, { text: `Format salah!\nGunakan: *${prefix}${commandText} text1 | text2*\nContoh: *${prefix}${commandText} halo | semuanya*` }, { quoted: msg })

      const [text1, text2] = fullText.split('|').map(v => v.trim()),
            more = String.fromCharCode(8206),
            readmore = more.repeat(4e3 + 1),
            result = `${text1} ${readmore} ${text2}`

      await conn.sendMessage(chatId, { text: result }, { quoted: msg })
    } catch (e) {
      console.error('Error in readmore command:', e),
      await conn.sendMessage(msg.key.remoteJid, { text: 'Terjadi kesalahan saat memproses perintah.' }, { quoted: msg })
    }
  }
}