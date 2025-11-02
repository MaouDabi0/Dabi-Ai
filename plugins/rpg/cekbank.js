export default {
  name: 'Cek Bank',
  command: ['cekbank', 'bankcek'],
  tags: 'Rpg Menu',
  desc: 'Menampilkan isi saldo bank',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo,
          { bank } = loadBank(),
          saldo = bank.saldo || 0,
          tax = bank.tax || null

    let teks = `BANK BOT ${botName}\n`
        teks += `${garis}\n`
        teks += `Akun: Bank Pusat\n`
        teks += `Saldo: Rp ${saldo.toLocaleString('id-ID')}\n`
        teks += `Pajak: ${tax}\n`
        teks += `${garis}`

    try {
      await conn.sendMessage(chatId, { text: teks }, { quoted: msg })
    } catch {
      await conn.sendMessage(chatId, { text: 'Gagal menampilkan saldo bank.' }, { quoted: msg })
    }
  }
}