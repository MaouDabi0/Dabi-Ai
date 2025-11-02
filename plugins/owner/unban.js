import fs from 'fs'

export default {
  name: 'unbanchat',
  command: ['unbanned', 'unban'],
  tags: 'Owner Menu',
  desc: 'Unban user dengan menghapus ban: true di database',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId, senderId } = chatInfo,
          nomorTarget = args[0] ? await normalizeNumber(args[0]) : await normalizeNumber(target(msg, senderId)),
          dbData = getDB()
    let found = !1

    try {
      return !args[0] && !msg.message?.extendedTextMessage?.contextInfo
        ? conn.sendMessage(chatId, { text: 'Reply/tag atau tulis nomor untuk diunbanned' }, { quoted: msg })
        : (() => {
            for (const key in dbData.Private) 
              if (dbData.Private[key].Nomor.replace(/@s\.whatsapp\.net$/i, '') === nomorTarget) {
                dbData.Private[key].ban = !1, found = !0
                break
              }
            return !found
              ? conn.sendMessage(chatId, { text: 'Nomor tidak ditemukan di database' }, { quoted: msg })
              : (saveDB(),
                 conn.sendMessage(chatId, { text: `Berhasil unbanned nomor: +${nomorTarget}` }, { quoted: msg }))
          })()
    } catch(e) {
      console.error(e)
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat memproses unbanned' }, { quoted: msg })
    }
  }
}