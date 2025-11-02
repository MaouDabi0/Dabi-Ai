export default {
  name: 'out',
  command: ['keluar', 'out'],
  tags: 'Group Menu',
  desc: 'Mengeluarkan bot dari group',
  prefix: !0,
  owner: !1,
  premium: !0,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo
    let targetGroup = chatId

    if (args.length > 0) {
      const groups = await conn.groupFetchAllParticipating(),
            groupList = Object.values(groups)
      if (!groupList.length) return conn.sendMessage(chatId, { text: 'Bot tidak tergabung dalam grup mana pun.' }, { quoted: msg })

      const input = args[0]
      let selectedGroup = null
      if (/^\d+$/.test(input)) {
        const index = parseInt(input, 10) - 1
        selectedGroup = index >= 0 && index < groupList.length ? groupList[index].id : null
      } else selectedGroup = input.endsWith('@g.us') ? groupList.find(g => g.id === input)?.id : null

      if (!selectedGroup) return conn.sendMessage(chatId, { text: 'Grup tidak ditemukan. Gunakan nomor dari perintah *listgc* atau ID grup yang valid.' }, { quoted: msg })
      targetGroup = selectedGroup
    }

    if (!targetGroup.endsWith('@g.us')) return conn.sendMessage(chatId, { text: 'ID grup tidak valid!' }, { quoted: msg })

    try {
      await conn.sendMessage(targetGroup, { text: 'Bot akan keluar dari grup ini...' }),
      await conn.groupLeave(targetGroup)
    } catch (e) {
      console.error(e),
      conn.sendMessage(chatId, { text: 'Gagal keluar dari grup. Coba lagi nanti.' }, { quoted: msg })
    }
  }
}