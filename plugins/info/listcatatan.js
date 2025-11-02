import fs from 'fs'
import path from 'path'

const catatanPath = path.join(dirname, './db/catatan.json')

export default {
  name: 'catatan',
  command: ['listcatatan', 'catatanlist', 'liat'],
  tags: 'Info Menu',
  desc: 'Menampilkan daftar atau isi catatan',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo
    if (!fs.existsSync(catatanPath)) return conn.sendMessage(chatId, { text: 'Belum ada catatan.' }, { quoted: msg })

    try {
      const catatan = JSON.parse(fs.readFileSync(catatanPath))
      if (['listcatatan', 'catatanlist'].includes(commandText)) {
        const list = Object.keys(catatan).map((n, i) => `${i + 1}. ${n}`).join('\n')
        return conn.sendMessage(chatId, { text: `Daftar semua catatan:\n\n${list}` }, { quoted: msg })
      }

      if (commandText === 'liat') {
        const nama = args[0]
        if (!nama || !catatan[nama]) {
          const txt = !nama
            ? 'Masukkan nama catatan.\nContoh: .liat catatan1'
            : `Catatan *${nama}* tidak ditemukan.`
          return conn.sendMessage(chatId, { text: txt }, { quoted: msg })
        }
        const isi = Object.values(catatan[nama]).map((v, i) => `${i + 1}. ${v}`).join('\n')
        return conn.sendMessage(chatId, { text: `Isi catatan *${nama}*:\n\n${isi}` }, { quoted: msg })
      }
    } catch (e) {
      return conn.sendMessage(chatId, { text: `Error: ${e.message || e}` }, { quoted: msg })
    }
  }
}