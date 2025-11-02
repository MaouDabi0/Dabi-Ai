import fs from 'fs'

export default {
  name: 'banchat',
  command: ['banned', 'ban'],
  tags: 'Owner Menu',
  desc: 'Ban user dengan menambahkan ban: true di database',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId, senderId } = chatInfo
    try {
      if (!args[0] && !msg.message?.extendedTextMessage?.contextInfo)
        return conn.sendMessage(chatId, { text: 'Reply/tag atau tulis nomor untuk dibanned' }, { quoted: msg })

      const nomorTarget = args[0] ? await normalizeNumber(args[0]) : await normalizeNumber(target(msg, senderId)),
            dbData = getDB()
      let found = !1

      for (const key in dbData.Private) 
        if (dbData.Private[key].Nomor.replace(/@s\.whatsapp\.net$/i, '') === nomorTarget) { dbData.Private[key].ban = !0, found = !0; break }

      !found
        ? conn.sendMessage(chatId, { text: 'Nomor tidak ditemukan di database' }, { quoted: msg })
        : (saveDB(), conn.sendMessage(chatId, { text: `Berhasil banned nomor: +${nomorTarget}` }, { quoted: msg }))
    } catch (e) {
      console.error(e)
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat memproses banned' }, { quoted: msg })
    }
  }
}