const isNumber = x => !isNaN(x) && Number.isFinite(parseFloat(x));

export default {
  name: 'Add Item',
  command: ['additem'],
  tags: 'Shop Menu',
  desc: 'Tambah item ke mini toko dengan potongan pajak ( mini toko rpg menu )',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId, senderId } = chatInfo;

    if (args.length < 3)
      return conn.sendMessage(chatId, { text: 'Contoh: .additem <nama toko> <item> <harga>' }, { quoted: msg });

    const [storeName, itemName, hargaStr] = args,
          harga = parseInt(hargaStr);

    if (!isNumber(harga) || harga <= 0)
      return conn.sendMessage(chatId, { text: 'Harga tidak valid.' }, { quoted: msg });

    const userData = Object.values(getDB().Private).find(v => v.Nomor === senderId);
    if (!userData)
      return conn.sendMessage(chatId, { text: 'Kamu belum terdaftar.' }, { quoted: msg });

    const tokoData = loadStore(),
          bankData = loadBank(),
          toko = tokoData.shops[storeName];

    if (!toko)
      return conn.sendMessage(chatId, { text: 'Toko tidak ditemukan.' }, { quoted: msg });

    if (toko.id !== userData.noId)
      return conn.sendMessage(chatId, { text: 'Kamu bukan pemilik toko ini.' }, { quoted: msg });

    const taxRate = parseInt((bankData.bank?.tax || '10').replace('%', '')),
          pajak = Math.floor(harga * taxRate / 100);

    if ((userData.money?.amount || 0) < pajak)
      return conn.sendMessage(chatId, { text: `Uang kamu kurang untuk bayar pajak sebesar ${pajak}` }, { quoted: msg });

    userData.money.amount -= pajak;
    bankData.bank.saldo = (bankData.bank.saldo || 0) + pajak;

    toko.items = toko.items || {};
    toko.items[itemName] = harga;

    saveStore(tokoData);
    saveBank(bankData);
    saveDB();

    return conn.sendMessage(
      chatId,
      { text: `Item "${itemName}" telah ditambahkan ke "${storeName}" seharga ${harga}. Pajak ${pajak} telah disetor.` },
      { quoted: msg }
    );
  }
};