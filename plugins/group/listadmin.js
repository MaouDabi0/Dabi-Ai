export default {
  name: 'listadmin',
  command: ['listadmin', 'listadmins'],
  tags: 'Group Menu',
  desc: 'Daftar semua admin grup',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    try {
      const { chatId, isGroup } = chatInfo,
            groupMeta = isGroup ? await conn.groupMetadata(chatId) : null,
            admins = groupMeta ? groupMeta.participants.filter(p => p.admin).map(p => p.id) : []

      return !isGroup ? conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: msg })
           : !admins.length ? conn.sendMessage(chatId, { text: 'Tidak ada admin di grup ini.' }, { quoted: msg })
           : (() => {
                let list = '*Daftar Admin Grup:*\n'
                admins.forEach((id, i) => list += `${i + 1}. @${id.split('@')[0]}\n`)
                conn.sendMessage(chatId, { text: list, mentions: admins }, { quoted: msg })
             })()
    } catch (err) {
      console.error(err),
      conn.sendMessage(chatId, { text: 'Gagal mengambil daftar admin.' }, { quoted: msg })
    }
  }
}