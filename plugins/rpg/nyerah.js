export default {
  name: 'nyerah',
  command: ['nyerah'],
  tags: 'Rpg Menu',
  desc: 'Menghapus semua soal di history milik pengguna',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId, senderId } = chatInfo
    try {
      const user = getUser(senderId)
      if (!user) return conn.sendMessage(chatId, { text: 'Kamu belum terdaftar di database, tidak ada data untuk dihapus.' }, { quoted: msg })

      const db = load(),
            before = Object.keys(db.FunctionGame || {}).length

      db.FunctionGame = Object.fromEntries(Object.entries(db.FunctionGame || {}).filter(([_, v]) => v?.noId !== senderId)),
      save(db)

      const after = Object.keys(db.FunctionGame || {}).length,
            removed = before - after

      await conn.sendMessage(chatId, { text: removed > 0 
        ? `Semua soal milikmu (${removed}) sudah dihapus dari history. Kamu nyerah` 
        : 'Tidak ada soal milikmu di history.' }, { quoted: msg })
    } catch {
      await conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat menghapus data history.' }, { quoted: msg })
    }
  }
}