export default {
  name: 'Add Item',
  command: ['additem'],
  tags: 'Shop Menu',
  desc: 'Tambah item ke mini toko dengan potongan pajak (mini toko rpg menu)',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId, senderId } = chatInfo,
          isNumber = x => !isNaN(x) && Number.isFinite(parseFloat(x)),
          [storeName, itemName, hargaStr] = args,
          harga = parseInt(hargaStr),
          userData = Object.values(getDB().Private).find(v => v.Nomor === senderId),
          tokoData = loadStore(),
          bankData = loadBank(),
          toko = tokoData.shops[storeName],
          taxRate = parseInt((bankData.bank?.tax || '1e1').replace('%', '')),
          pajak = Math.floor(harga * taxRate / 1e2)

    if (
      args.length < 3 || 
      !isNumber(harga) || harga <= 0 || 
      !userData || 
      !toko || toko.id !== userData.noId || 
      (userData.money?.amount || 0) < pajak
    )
      return conn.sendMessage(
        chatId,
        { text: 
          args.length < 3 ? 'Contoh: .additem <nama toko> <item> <harga>' :
          (!isNumber(harga) || harga <= 0) ? 'Harga tidak valid.' :
          !userData ? 'Kamu belum terdaftar.' :
          (!toko ? 'Toko tidak ditemukan.' : toko.id !== userData.noId ? 'Kamu bukan pemilik toko ini.' :
          (userData.money?.amount || 0) < pajak ? `Uang kamu kurang untuk bayar pajak sebesar ${pajak}` : '')
        },
        { quoted: msg }
      )

    userData.money.amount -= pajak,
    bankData.bank.saldo = (bankData.bank.saldo || 0) + pajak,
    toko.items = toko.items || {},
    toko.items[itemName] = harga,
    saveStore(tokoData),
    saveBank(bankData),
    saveDB()

    return conn.sendMessage(chatId, { text: `Item "${itemName}" telah ditambahkan ke "${storeName}" seharga ${harga}. Pajak ${pajak} telah disetor.` }, { quoted: msg })
  }
}