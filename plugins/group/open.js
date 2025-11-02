export default {
  name: 'open',
  command: ['open', 'buka', 'bukagrup'],
  tags: 'Group Menu',
  desc: 'Menjadwalkan pembukaan chat grup',
  prefix: !0,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo
    if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan dalam grup.' }, { quoted: msg })

    try {
      const { botAdmin, userAdmin } = await exGrup(conn, chatId, senderId),
            groupData = getGc(getDB(), chatId)

      if (!userAdmin || !botAdmin || !groupData) {
        const text = !userAdmin ? 'Kamu bukan Admin.' 
                    : !botAdmin ? 'Bot bukan admin.' 
                    : 'Grup belum terdaftar di database.\nGunakan perintah *.daftargc* untuk mendaftar.'
        return conn.sendMessage(chatId, { text }, { quoted: msg })
      }

      groupData.gbFilter ??= {},
      groupData.gbFilter.open ??= {}

      if (args[0]) {
        const duration = Format.parseDur(args[0])
        if (!duration) return conn.sendMessage(chatId, { text: 'Format waktu tidak valid. Gunakan contoh: 1h, 30m, 1d.' }, { quoted: msg })
        groupData.gbFilter.open = { active: !0, until: Date.now() + duration }, saveDB()
        return conn.sendMessage(chatId, { text: `Grup akan dibuka otomatis dalam ${args[0]}.` }, { quoted: msg })
      }

      groupData.gbFilter.open = { active: !1 }, saveDB()
      await conn.groupSettingUpdate(chatId, 'not_announcement')

    } catch (err) {
      console.error('Open Group Error:', err)
      return conn.sendMessage(chatId, { text: 'Gagal memproses permintaan.' }, { quoted: msg })
    }
  }
}