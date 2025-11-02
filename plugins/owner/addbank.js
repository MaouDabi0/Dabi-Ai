export default {
  name: 'addbank',
  command: ['addbank'],
  tags: 'Owner Menu',
  desc: 'Menambahkan saldo atau tax pada bank',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    args,
    chatInfo
  }) => {
    const { chatId } = chatInfo
    try {
      if (args.length < 2)
        return conn.sendMessage(chatId, { text: 'Format:\n.addbank saldo 700\n.addbank tax 2%' }, { quoted: msg })

      const [type, val] = [args[0].toLowerCase(), args[1]],
            { bank } = loadBank()
      let num

      type === 'saldo'
        ? (
            num = parseInt(val),
            isNaN(num)
              ? conn.sendMessage(chatId, { text: 'Jumlah saldo harus berupa angka.' }, { quoted: msg })
              : (bank.saldo += num, saveBank({ bank }),
                 conn.sendMessage(chatId, { text: `Saldo bank berhasil ditambahkan ${num}. Saldo sekarang: ${bank.saldo}` }, { quoted: msg }))
          )
        : type === 'tax'
          ? (
              num = parseFloat(val.replace('%', '')),
              isNaN(num)
                ? conn.sendMessage(chatId, { text: 'Tax harus berupa angka, misal 2%' }, { quoted: msg })
                : (bank.tax = `${parseFloat(bank.tax) + num}%`, saveBank({ bank }),
                   conn.sendMessage(chatId, { text: `Tax bank berhasil ditambahkan ${num}%. Tax sekarang: ${bank.tax}` }, { quoted: msg }))
            )
          : conn.sendMessage(chatId, { text: 'Tipe tidak valid, gunakan: saldo atau tax.' }, { quoted: msg })
    } catch (e) {
      console.error(e)
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan.' }, { quoted: msg })
    }
  }
}