export default {
  name: 'delbank',
  command: ['delbank'],
  tags: 'Owner Menu',
  desc: 'Mengurangi saldo atau tax pada bank',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    args,
    chatInfo
  }) => {
    const { chatId } = chatInfo,
          { bank } = loadBank()
    if (args.length < 2) return conn.sendMessage(chatId, { text: `Format:\n.delbank saldo 500\n.delbank tax 2%` }, { quoted: msg })

    const [type, val] = [args[0].toLowerCase(), args[1]]
    let num

    type === 'saldo'
      ? (
        num = parseInt(val),
        isNaN(num)
          ? conn.sendMessage(chatId, { text: `Jumlah saldo harus berupa angka.` }, { quoted: msg })
          : bank.saldo - num < 0
            ? conn.sendMessage(chatId, { text: `Saldo tidak cukup.` }, { quoted: msg })
            : (bank.saldo -= num, saveBank({ bank }),
              conn.sendMessage(chatId, { text: `Saldo bank berhasil dikurangi ${num}. Saldo sekarang: ${bank.saldo}` }, { quoted: msg }))
      )
      : type === 'tax'
        ? (
          num = parseFloat(val.replace('%', '')),
          isNaN(num)
            ? conn.sendMessage(chatId, { text: `Tax harus berupa angka, misal 2%` }, { quoted: msg })
            : (
              num = parseFloat(bank.tax) - num,
              num < 0
                ? conn.sendMessage(chatId, { text: `Tax tidak bisa kurang dari 0%.` }, { quoted: msg })
                : (bank.tax = `${num}%`, saveBank({ bank }),
                  conn.sendMessage(chatId, { text: `Tax bank berhasil dikurangi ${val.replace('%', '')}%. Tax sekarang: ${bank.tax}` }, { quoted: msg }))
            )
        )
        : conn.sendMessage(chatId, { text: `Tipe tidak valid, gunakan: saldo atau tax.` }, { quoted: msg })
  }
}