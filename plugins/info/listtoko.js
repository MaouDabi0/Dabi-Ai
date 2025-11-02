import fs from 'fs'
const tokoPath = './toolkit/set/toko.json'

export default {
  name: 'listtoko',
  command: ['listtoko', 'daftartoko'],
  tags: 'Info Menu',
  desc: 'Menampilkan daftar toko yang terdaftar',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo,
          exists = fs.existsSync,
          read = fs.readFileSync,
          parse = JSON.parse,
          notFound = 'File toko.json tidak ditemukan.',
          noStore = 'Belum ada toko yang terdaftar.',
          invalid = 'Nomor toko tidak valid!'

    if (!exists(tokoPath)) return conn.sendMessage(chatId, { text: notFound }, { quoted: msg })

    const data = parse(read(tokoPath)),
          tokoList = Object.keys(data.storeSetting || {})

    if (!tokoList.length) return conn.sendMessage(chatId, { text: noStore }, { quoted: msg })

    if (args[0]) {
      const idx = parseInt(args[0]) - 1e0
      return (isNaN(idx) || !tokoList[idx])
        ? conn.sendMessage(chatId, { text: invalid }, { quoted: msg })
        : conn.sendMessage(chatId, { text: `${tokoList[idx]} adalah toko nomor ${args[0]}.` }, { quoted: msg })
    }

    const daftar = tokoList.map((toko, i) => `${i + 1e0}. ${toko}`).join('\n'),
          teks = `Daftar toko terdaftar:\n${daftar}`

    conn.sendMessage(chatId, { text: teks }, { quoted: msg })
  }
}