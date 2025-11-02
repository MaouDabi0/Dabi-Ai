export default {
  name: 'autoai',
  command: ['autoai', 'ai'],
  tags: 'Ai Menu',
  desc: 'Mengaktifkan atau menonaktifkan ai',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo,
            db = getDB(),
            input = args[0]?.toLowerCase()

      if (!['on','off'].includes(input))
        return conn.sendMessage(chatId, { text: `Gunakan format: ${prefix + commandText} <on/off>` }, { quoted: msg })

      const status = input === 'on',
            target = isGroup ? 'Grup' : 'Private',
            idKey = isGroup ? 'Id' : 'Nomor',
            idVal = isGroup ? chatId : senderId,
            key = Object.keys(db[target]).find(k => db[target][k][idKey] === idVal)

      if (!key)
        return conn.sendMessage(chatId, { text: `${isGroup ? 'Grup' : 'Nomor kamu'} belum terdaftar dalam database.` }, { quoted: msg })

      db[target][key].autoai = status, saveDB(),
      await conn.sendMessage(chatId, { text: `Fitur Auto-AI untuk ${isGroup ? 'grup ini' : 'kamu'} telah *${status ? 'diaktifkan' : 'dinonaktifkan'}*.` }, { quoted: msg })
    } catch (e) {
      console.error('[autoai]', e),
      conn.sendMessage(chatInfo.chatId, { text: 'Terjadi kesalahan saat memproses perintah.' }, { quoted: msg })
    }
  }
}