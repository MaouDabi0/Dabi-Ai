export default {
  name: 'Create Store',
  command: ['ctoko'],
  tags: 'Shop Menu',
  desc: 'Create a store and save to toko.json',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId, senderId } = chatInfo,
          storeName = args.join(' ').trim(),
          db = getDB(),
          user = Object.values(db.Private).find(u => u.Nomor === senderId),
          storeData = loadStore(),
          sameStore = Object.entries(storeData.shops).find(([name, data]) => 
            name.toLowerCase() === storeName.toLowerCase() && data.owner === senderId)

    !args[0]
      ? conn.sendMessage(chatId, { text: `Masukkan nama toko.\nContoh:\n.ctoko AyumiStore` }, { quoted: msg })
      : !user
      ? conn.sendMessage(chatId, { text: 'Kamu belum terdaftar di database.' }, { quoted: msg })
      : sameStore
      ? conn.sendMessage(chatId, { text: `Kamu sudah memiliki toko bernama *${storeName}*. Gunakan nama lain.` }, { quoted: msg })
      : (storeData.shops[storeName] = { id: user.noId, owner: senderId, items: {}, balanceId: 0 * 1e0 },
         saveStore(storeData),
         await conn.sendMessage(chatId, { 
           text: `Toko *${storeName}* berhasil dibuat!\nID: ${user.noId}\nPemilik: @${senderId.replace(/@s\.whatsapp\.net$/, '')}`, 
           mentions: [senderId] 
         }, { quoted: msg }))
  }
}