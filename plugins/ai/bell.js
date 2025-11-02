export default {
  name: 'bell',
  command: ['bell'],
  tags: 'Ai Menu',
  desc: 'Mengaktifkan atau menonaktifkan fitur bell',
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
            opt = args[0]?.toLowerCase()

      if (!opt || !['on','off'].includes(opt))
        return conn.sendMessage(chatId, { text: `Gunakan format: ${prefix + commandText} <on/off>` }, { quoted: msg })

      const val = opt === 'on'
      if (isGroup) {
        const key = Object.keys(db.Grup).find(k => db.Grup[k].Id === chatId)
        if (!key)
          return conn.sendMessage(chatId, { text: 'Grup ini belum terdaftar dalam database.' }, { quoted: msg })
        db.Grup[key].bell = val, saveDB(),
        await conn.sendMessage(chatId, { text: `Fitur Bell untuk grup ini telah *${val ? 'diaktifkan' : 'dinonaktifkan'}*.` }, { quoted: msg })
      } else {
        const key = Object.keys(db.Private).find(k => db.Private[k].Nomor === senderId)
        if (!key)
          return conn.sendMessage(chatId, { text: 'Nomor kamu belum terdaftar dalam database.' }, { quoted: msg })
        db.Private[key].bell = val, saveDB(),
        await conn.sendMessage(chatId, { text: `Fitur Bell untuk kamu telah *${val ? 'diaktifkan' : 'dinonaktifkan'}*.` }, { quoted: msg })
      }
    } catch (e) {
      console.error('[Bell Plugin]', e),
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat memproses perintah.' }, { quoted: msg })
    }
  }
}