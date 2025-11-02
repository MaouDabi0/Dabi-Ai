export default {
  name: 'setdesc',
  command: ['setdesc', 'setdeskripsi'],
  tags: 'Group Menu',
  desc: 'Mengatur deskripsi grup',
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
          { botAdmin, userAdmin } = isGroup ? await exGrup(conn, chatId, senderId) : {},
          desc = args.join(' ')

    return !isGroup ? conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: msg })
         : !userAdmin ? conn.sendMessage(chatId, { text: 'Kamu bukan Admin!' }, { quoted: msg })
         : !botAdmin ? conn.sendMessage(chatId, { text: 'Bot bukan admin!' }, { quoted: msg })
         : !desc ? conn.sendMessage(chatId, { text: `Harap masukkan deskripsi grup!\nContoh: ${prefix}${commandText} Grup santai tanpa spam` }, { quoted: msg })
         : (async () => {
             try {
               await conn.groupUpdateDescription(chatId, desc),
               conn.sendMessage(chatId, { text: `Deskripsi grup berhasil diperbarui menjadi:\n${desc}` }, { quoted: msg })
             } catch (err) {
               console.error(err),
               conn.sendMessage(chatId, { text: 'Gagal memperbarui deskripsi grup.' }, { quoted: msg })
             }
           })()
  }
}