import fs from 'fs/promises'
import { existsSync, writeFileSync } from 'fs'
import '../../toolkit/setting.js'

const tokoPath = './toolkit/set/toko.json',
      dbPath = './toolkit/db/datatoko.json'

export default {
  name: 'Buy',
  command: ['beli', 'buy'],
  tags: 'Shop Menu',
  desc: 'Membeli barang dari toko',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId } = chatInfo,
          pay = global.ownerStore

    !existsSync(dbPath) && writeFileSync(dbPath, JSON.stringify({ pendingOrders: [] }, null, 2))
    const dbData = JSON.parse(await fs.readFile(dbPath, 'utf-8'))
    dbData.pendingOrders ||= []

    return args.length < 2
      ? conn.sendMessage(chatId, { text: `Gunakan format *${prefix}${commandText} <Toko> <Barang>*` }, { quoted: msg })
      : (async () => {
          const tokoName = args[0],
                barangName = args.slice(1).join(' '),
                tokoData = JSON.parse(await fs.readFile(tokoPath, 'utf-8')),
                toko = tokoData.storeSetting?.[tokoName]

          return !toko
            ? conn.sendMessage(chatId, { text: `Toko "${tokoName}" tidak ditemukan.` }, { quoted: msg })
            : (() => {
                const barang = toko.find(i => i.name.toLowerCase() === barangName.toLowerCase())
                return !barang
                  ? conn.sendMessage(chatId, { text: `Barang "${barangName}" tidak ditemukan di toko "${tokoName}".` }, { quoted: msg })
                  : (async () => {
                      const bayar = `Metode Pembayaran:\n- Dana: ${pay.dana}\n- GoPay: ${pay.gopay}\n- OVO: ${pay.ovo}`,
                            caption = `Pembelian Pending\n\nUser: @${senderId.split('@')[0]}\nToko: ${tokoName}\nBarang: ${barang.name}\nHarga: Rp${barang.price.toLocaleString()}\n\n${bayar}\n\nOwner reply "done" untuk konfirmasi.`,
                            sent = await conn.sendMessage(chatId, { image: { url: 'https://files.catbox.moe/4cuj4g.jpeg' }, caption, mentions: [senderId] }, { quoted: msg })

                      dbData.pendingOrders.push({ userId: senderId, idChat: sent.key.id, toko: tokoName, barang: barang.name, harga: barang.price })
                      await fs.writeFile(dbPath, JSON.stringify(dbData, null, 2))
                    })()
              })()
        })()
  }
}