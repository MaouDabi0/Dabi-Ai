export default {
  name: 'mute',
  command: ['mute'],
  tags: 'Group Menu',
  desc: 'Aktifkan atau nonaktifkan mode mute grup',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo,
            { botAdmin, userAdmin } = isGroup ? await exGrup(conn, chatId, senderId) : {},
            db = getDB(),
            gc = getGc(db, chatId),
            act = args[0]?.toLowerCase()

      return !isGroup ? conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan di grup.' }, { quoted: msg })
           : !userAdmin ? conn.sendMessage(chatId, { text: 'Kamu bukan Admin!' }, { quoted: msg })
           : !botAdmin ? conn.sendMessage(chatId, { text: 'Bot bukan admin!' }, { quoted: msg })
           : !gc ? conn.sendMessage(chatId, { text: `Grup belum terdaftar di database.\nGunakan perintah *${prefix}daftargc* untuk mendaftar.` }, { quoted: msg })
           : act === 'on' ? gc.mute ? conn.sendMessage(chatId, { text: 'Mode mute sudah aktif di grup ini.' }, { quoted: msg })
           : (gc.mute = !0, saveDB(), conn.sendMessage(chatId, { text: 'Mode mute diaktifkan. Hanya admin yang dapat menggunakan bot.' }, { quoted: msg }))
           : act === 'off' ? !gc.mute ? conn.sendMessage(chatId, { text: 'Mode mute tidak aktif di grup ini.' }, { quoted: msg })
           : (gc.mute = !1, saveDB(), conn.sendMessage(chatId, { text: 'Mode mute dinonaktifkan. Semua member dapat menggunakan bot.' }, { quoted: msg }))
           : conn.sendMessage(chatId, { text: `Penggunaan:\n${prefix}${commandText} on → Aktifkan mode mute\n${prefix}${commandText} off → Nonaktifkan mode mute` }, { quoted: msg })
    } catch (err) {
      console.error('Mute Command Error:', err),
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat menjalankan perintah.' }, { quoted: msg })
    }
  }
}