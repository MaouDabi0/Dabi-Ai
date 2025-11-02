export default {
  name: 'antilink',
  command: ['antilink'],
  tags: 'Group Menu',
  desc: 'Fitur anti link grup',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo
    if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: msg })

    const { botAdmin, userAdmin } = await exGrup(conn, chatId, senderId),
          groupData = getGc(getDB(), chatId)

    if (!userAdmin || !botAdmin || !groupData) {
      const text = !userAdmin ? 'Kamu bukan Admin.' 
                  : !botAdmin ? 'Bot bukan admin.' 
                  : 'Grup belum terdaftar di database.\nGunakan perintah *.daftargc* untuk mendaftar.'
      return conn.sendMessage(chatId, { text }, { quoted: msg })
    }

    const input = args[0]?.toLowerCase()
    if (!['on', 'off'].includes(input)) 
      return conn.sendMessage(chatId, { text: `Penggunaan:\n${prefix}${commandText} <on/off>` }, { quoted: msg })

    groupData.gbFilter ??= {},
    groupData.gbFilter.link ??= {},
    groupData.gbFilter.link.antilink = input === 'on', saveDB()
    return conn.sendMessage(chatId, { text: `Fitur antilink berhasil di-${input === 'on' ? 'aktifkan' : 'nonaktifkan'}.` }, { quoted: msg })
  }
}