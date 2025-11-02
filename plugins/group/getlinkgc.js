export default {
  name: 'getlinkgc',
  command: ['getlinkgc', 'getlinkgroup', 'linkgc', 'linkgroup'],
  tags: 'Group Menu',
  desc: 'Dapatkan tautan undangan grup',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo
      if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan dalam grup.' }, { quoted: msg })

      const { botAdmin, userAdmin } = await exGrup(conn, chatId, senderId)
      if (!botAdmin || !userAdmin)
        return conn.sendMessage(chatId, { text: !userAdmin ? 'Kamu bukan admin.' : 'Bot bukan admin.' }, { quoted: msg })

      const code = await conn.groupInviteCode(chatId),
            link = `https://chat.whatsapp.com/${code}`
      conn.sendMessage(chatId, { text: `Tautan undangan grup:\n${link}` }, { quoted: msg })
    } catch (err) {
      console.error(err)
      conn.sendMessage(chatInfo.chatId, { text: 'Gagal mendapatkan tautan grup.' }, { quoted: msg })
    }
  }
}