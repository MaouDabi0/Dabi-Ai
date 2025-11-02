export default {
  name: 'close',
  command: ['close', 'tutup'],
  tags: 'Group Menu',
  desc: 'Menutup chat group WhatsApp',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo
    if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: msg })

    try {
      const { botAdmin, userAdmin } = await exGrup(conn, chatId, senderId),
            groupData = getGc(getDB(), chatId)
      if (!userAdmin || !botAdmin || !groupData)
        return conn.sendMessage(chatId, { text: !userAdmin ? 'Kamu bukan Admin!' : !botAdmin ? 'Bot bukan admin!' : 'Grup belum terdaftar di database.\nGunakan *daftargc* untuk mendaftar.' }, { quoted: msg })

      groupData.gbFilter ??= {}, groupData.gbFilter.close ??= {}
      if (args[0]) {
        const dur = Format.parseDur(args[0])
        if (!dur)
          return conn.sendMessage(chatId, { text: 'Format waktu tidak valid.\nGunakan contoh: 1h, 30m, 1d, dsb.' }, { quoted: msg })
        groupData.gbFilter.close = { active: !0, until: Date.now() + dur }, saveDB()
        return conn.sendMessage(chatId, { text: `Grup akan ditutup otomatis dalam *${args[0]}*.` }, { quoted: msg })
      }

      await conn.groupSettingUpdate(chatId, 'announcement'),
      await conn.sendMessage(chatId, { text: 'Grup berhasil ditutup.' }, { quoted: msg })
    } catch (e) {
      console.error('Close Group Error:', e),
      await conn.sendMessage(chatId, { text: 'Gagal memproses perintah. Coba lagi nanti.' }, { quoted: msg })
    }
  }
}