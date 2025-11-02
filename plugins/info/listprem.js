import fs from 'fs'
import path from 'path'

export default {
  name: 'listisPrem',
  command: ['listprem', 'listisPremium'],
  tags: 'Info Menu',
  desc: 'Menampilkan daftar pengguna isPremium.',
  prefix: !0,
  owner: !0,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo,
          dbPath = path.join(dirname, './db/database.json')

    if (!fs.existsSync(dbPath))
      return conn.sendMessage(chatId, { text: 'Database tidak ditemukan.' }, { quoted: msg })

    try {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8')),
            data = db?.Private

      if (!data || typeof data !== 'object')
        return conn.sendMessage(chatId, { text: 'Data Private tidak valid.' }, { quoted: msg })

      const list = Object.values(data)
        .filter(v => v.isPremium?.isPrem)
        .map(v => ({
          name: v.Nama || '-',
          num: v.Nomor,
          time: v.isPremium.time
        }))

      if (!list.length)
        return conn.sendMessage(chatId, { text: 'Tidak ada pengguna premium.' }, { quoted: msg })

      let teks = `${head}${Obrack} Daftar Pengguna Premium${Cbrack}\n`
      list.forEach((u, i) => {
        let sisa = u.time, waktu = 'Expired'
        if (sisa > 0) {
          const d = Math.floor(sisa / 8.64e7),
                h = Math.floor((sisa %= 8.64e7) / 3.6e6),
                m = Math.floor((sisa %= 3.6e6) / 6e4)
          waktu = `${d}h ${h}j ${m}m`
        }
        teks += `${side}${btn} ${i + 1}. wa.me/${u.num.replace('@s.whatsapp.net', '')} (${waktu})\n`
      })
      teks += `${side}${btn} Total: ${list.length}\n${foot}${garis}`

      return conn.sendMessage(chatId, { text: teks }, { quoted: msg })
    } catch {
      return conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat menampilkan data.' }, { quoted: msg })
    }
  }
}