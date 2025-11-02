import fs from 'fs'
const tokoPath = './toolkit/set/toko.json'

export default {
  name: 'resettoko',
  command: ['resettoko'],
  tags: 'Shop Menu',
  desc: 'Mereset daftar toko.',
  prefix: !0,
  owner: !0,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo
    try {
      return !fs.existsSync(tokoPath)
        ? conn.sendMessage(chatId, { text: 'File toko.json tidak ditemukan.' }, { quoted: msg })
        : (() => {
            const tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf8'))
            tokoData.storeSetting = {}
            fs.writeFileSync(tokoPath, JSON.stringify(tokoData, null, 2))
            conn.sendMessage(chatId, { text: 'Semua toko telah direset!' }, { quoted: msg })
          })()
    } catch (err) {
      console.error('Error di plugin resettoko.js:', err)
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mereset toko.' }, { quoted: msg })
    }
  }
}