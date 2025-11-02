import fs from 'fs'
const config = '../../toolkit/set/config.json'

export default {
  name: 'delbarang',
  command: ['delbarang', 'deleteitem', 'dropitem'],
  tags: 'Shop Menu',
  desc: 'Menghapus barang dari toko di toko.json',
  prefix: !0,
  owner: !0,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo,
          tokoPath = './toolkit/set/toko.json',
          tokoName = args.shift(),
          itemName = args.join(' ').trim()

    return !tokoName || !itemName
      ? conn.sendMessage(chatId, { text: 'Masukkan nama toko dan barang yang ingin dihapus!' }, { quoted: msg })
      : (() => {
          let tokoData
          try {
            tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'))
          } catch {
            return conn.sendMessage(chatId, { text: 'Gagal membaca file toko.json' }, { quoted: msg })
          }

          return !tokoData.storeSetting[tokoName]
            ? conn.sendMessage(chatId, { text: `Toko *${tokoName}* tidak ditemukan!` }, { quoted: msg })
            : (() => {
                const items = tokoData.storeSetting[tokoName],
                      itemIndex = items.findIndex(v => v.name.toLowerCase() === itemName.toLowerCase())

                return itemIndex === -1
                  ? conn.sendMessage(chatId, { text: `Barang *${itemName}* tidak ditemukan di toko *${tokoName}*` }, { quoted: msg })
                  : (async () => {
                      items.splice(itemIndex, 1)
                      tokoData.storeSetting[tokoName] = items
                      fs.writeFileSync(tokoPath, JSON.stringify(tokoData, null, 2))
                      await conn.sendMessage(chatId, { text: `Barang *${itemName}* berhasil dihapus dari toko *${tokoName}*` }, { quoted: msg })
                    })()
              })()
        })()
  }
}