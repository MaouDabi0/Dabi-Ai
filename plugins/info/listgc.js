export default {
  name: 'listgroup',
  command: ['listgc', 'listgroup'],
  tags: 'Info Menu',
  desc: 'Melihat semua grup yang bot masuki',
  prefix: !0,
  owner: !1,
  premium: !0,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo
    try {
      const groups = await conn.groupFetchAllParticipating(),
            groupList = Object.values(groups)

      return !groupList.length
        ? conn.sendMessage(chatId, { text: 'Bot tidak tergabung dalam grup mana pun.' }, { quoted: msg })
        : (() => {
            const response = groupList.map((g, i) => 
              `${i + 1e0}. ${g.subject}\n   ID: ${g.id}\n   Member: ${g.size}`
            ).join('\n\n')
            conn.sendMessage(chatId, { text: `Daftar Grup yang Bot Ikuti:\n\n${response}` }, { quoted: msg })
          })()
    } catch (err) {
      console.error(err)
      conn.sendMessage(chatId, { text: 'Gagal mengambil daftar grup. Coba lagi nanti.' }, { quoted: msg })
    }
  }
}