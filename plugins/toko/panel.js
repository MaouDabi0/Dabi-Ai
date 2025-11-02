import fs from 'fs'

export default {
  name: 'panel',
  command: ['panel'],
  tags: 'Toko Menu',
  desc: 'Menampilkan toko panel',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo,
          tokoPath = './toolkit/set/toko.json'
    let tokoData
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'))
    } catch {
      return conn.sendMessage(chatId, { text: 'Gagal membaca file toko.json' }, { quoted: msg })
    }

    const items = tokoData.storeSetting['panel']
    return !items?.length
      ? conn.sendMessage(chatId, { text: 'Toko ini belum memiliki barang.' }, { quoted: msg })
      : conn.sendMessage(chatId, {
          text: `Daftar barang di toko panel:\n\n${items
            .sort((a,b)=>a.name.localeCompare(b.name))
            .map((v,i)=>`${i+1}. ${v.name}: ${v.price}`)
            .join('\n')}`
        }, { quoted: msg })
  }
}