export default {
  name: 'afk',
  command: ['afk'],
  tags: 'Info Menu',
  desc: 'Menandai kamu sedang AFK.',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { senderId, pushName, chatId, isGroup } = chatInfo
    try {
      initDB()
      const db = getDB(), userKey = getUser(senderId)
      if (!isGroup || !userKey)
        return conn.sendMessage(chatId, { 
          text: !isGroup 
            ? 'Perintah ini hanya bisa digunakan dalam grup.' 
            : 'Kamu belum terdaftar! Ketik .menu untuk mendaftar otomatis.' 
        }, { quoted: msg })

      const alasan = args.join(' ') || 'Tidak ada alasan', now = Date.now()
      db.Private[userKey.key].afk = { afkTime: now, reason: alasan }
      saveDB(db)
      return conn.sendMessage(chatId, { text: `AFK Aktif\n${pushName} sekarang sedang AFK\nAlasan: ${alasan}` }, { quoted: msg })
    } catch (err) {
      console.error('AFK Error:', err),
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mengatur AFK.' }, { quoted: msg })
    }
  }
}