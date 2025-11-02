export default {
  name: 'Bayar Denda',
  command: ['bayar'],
  tags: 'Rpg Menu',
  desc: 'Bayar denda untuk keluar dari penjara',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId, senderId } = chatInfo,
          db = getDB(),
          userKey = Object.keys(db.Private).find(k => db.Private[k].Nomor === senderId),
          user = userKey ? db.Private[userKey] : null,
          bank = loadBank(),
          taxStr = bank.bank.tax || '0%',
          pajak = parseFloat(taxStr.replace('%', '')) / 1e2,
          denda = 5e4,
          total = denda + Math.floor(denda * pajak)

    try {
      return !user
        ? conn.sendMessage(chatId, { text: 'Kamu belum terdaftar di database.' }, { quoted: msg })
        : !user.jail
          ? conn.sendMessage(chatId, { text: 'Kamu tidak sedang dipenjara.' }, { quoted: msg })
          : user.money.amount < total
            ? conn.sendMessage(chatId, { text: `Saldo kamu tidak cukup.\nDenda + pajak (${taxStr}): ${total}\nSaldo kamu: ${user.money.amount}` }, { quoted: msg })
            : (() => {
                user.money.amount -= total
                user.jail = !1
                saveDB()
                bank.bank.saldo += total
                saveBank(bank)
                conn.sendMessage(chatId, { text: `Denda berhasil dibayar.\nTotal: ${total} (pajak ${taxStr})\nSaldo masuk bank: ${total}\nSisa saldo: ${user.money.amount}\nStatus penjara: Nonaktif` }, { quoted: msg })
              })()
    } catch {
      await conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat membayar denda.' }, { quoted: msg })
    }
  }
}