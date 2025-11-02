export default {
  name: 'antibot',
  command: ['antibot'],
  tags: 'Group Menu',
  desc: 'Mengaktifkan atau menonaktifkan filter antibot',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo,
          db = getDB(),
          groupData = getGc(db, chatId)

    if (!isGroup || !groupData) {
      return conn.sendMessage(chatId, { text: !isGroup ? 'Perintah ini hanya bisa digunakan dalam grup!' : `Grup belum terdaftar di database.\nGunakan *${prefix}daftargc* untuk mendaftar.` }, { quoted: msg })
    }

    const { botAdmin, userAdmin } = await exGrup(conn, chatId, senderId)
    if (!userAdmin || !botAdmin) {
      return conn.sendMessage(chatId, { text: !userAdmin ? 'kamu bukan admin' : 'bot bukan admin' }, { quoted: msg })
    }

    const input = args[0]?.toLowerCase()
    if (!['on', 'off'].includes(input)) 
      return conn.sendMessage(chatId, { text: `Penggunaan:\n${prefix}${commandText} <on/off>` }, { quoted: msg })

    groupData.gbFilter ??= {}
    groupData.gbFilter.antibot = input === 'on' ? !0 : !1
    saveDB()

    return conn.sendMessage(chatId, { text: `Fitur antibot berhasil di-${input === 'on' ? 'aktifkan' : 'nonaktifkan'}.` }, { quoted: msg })
  }
}