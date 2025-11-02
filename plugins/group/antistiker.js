export default {
  name: 'antistiker',
  command: ['antistiker'],
  tags: 'Group Menu',
  desc: 'Mengaktifkan atau menonaktifkan fitur anti stiker spam',
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
          gc = getGc(db, chatId)

    if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: msg })
    if (!gc) return conn.sendMessage(chatId, { text: `Grup belum terdaftar di database.\nGunakan *${prefix}daftargc* untuk mendaftar.` }, { quoted: msg })

    const { botAdmin, userAdmin } = await exGrup(conn, chatId, senderId)
    if (!botAdmin || !userAdmin) 
      return conn.sendMessage(chatId, { text: !userAdmin ? 'Kamu bukan Admin!' : 'Bot bukan admin!' }, { quoted: msg })

    const input = args[0]?.toLowerCase(),
          valid = ['on', 'off'].includes(input)

    if (!valid) return conn.sendMessage(chatId, { text: `Penggunaan:\n${prefix}${commandText} <on/off>` }, { quoted: msg })

    gc.gbFilter ??= {}, gc.gbFilter.stiker ??= {}, gc.gbFilter.stiker.antistiker = input === 'on', saveDB()

    return conn.sendMessage(chatId, { text: `Fitur antistiker berhasil di-${input === 'on' ? 'aktifkan' : 'nonaktifkan'}.` }, { quoted: msg })
  }
}