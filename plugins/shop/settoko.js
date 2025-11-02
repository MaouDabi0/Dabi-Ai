import fs from 'fs'
import path from 'path'

export default {
  name: 'settoko',
  command: ['settoko'],
  tags: 'Shop Menu',
  desc: 'Mengatur atau menulis barang',
  prefix: !0,
  owner: !0,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo,
          tokoName = args.shift(),
          itemName = args.shift(),
          itemPrice = args.shift(),
          tokoPath = './toolkit/set/toko.json'

    if (!tokoName || !itemName || !itemPrice) 
      return conn.sendMessage(chatId, { text: `Format: ${prefix}settoko <nama_toko> <nama_barang> <harga>` }, { quoted: msg })

    let tokoData
    try { tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8')) } 
    catch (e) { return conn.sendMessage(chatId, { text: 'Gagal membaca file toko' }, { quoted: msg }) }

    !tokoData.storeSetting[tokoName]
      ? conn.sendMessage(chatId, { text: 'Toko tidak ditemukan' }, { quoted: msg })
      : (tokoData.storeSetting[tokoName].push({ name: itemName, price: itemPrice * 1e0 }),
         fs.writeFileSync(tokoPath, JSON.stringify(tokoData, null, 2)),
         await conn.sendMessage(chatId, { text: `Barang "${itemName}" dengan harga ${itemPrice} berhasil ditambahkan ke toko "${tokoName}"` }, { quoted: msg }))
  }
}