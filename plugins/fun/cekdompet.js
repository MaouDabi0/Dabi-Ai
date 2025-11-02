export default {
  name: 'cekdompet',
  command: ['cekdompet', 'dompetcek'],
  tags: 'Fun Menu',
  desc: 'Cek dompet orang',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId, senderId } = chatInfo,
          targetId = target(msg, senderId),
          mention = `${targetId}@s.whatsapp.net`

    try {
      initDB()
      const user = getUser(mention)
      if (!user?.data) return conn.sendMessage(chatId, { text: `Pengguna belum terdaftar di database!\n\nKetik *.daftar* untuk mendaftar.`, mentions: [mention] }, { quoted: msg })
      const moneyAmount = user.data?.money?.amount ?? 0,
            formattedMoney = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(moneyAmount),
            teks = `Hasil investigasi dari dompet @${targetId}\n${formattedMoney} ditemukan`

      await conn.sendMessage(chatId, { text: teks, mentions: [mention] }, { quoted: msg })
    } catch (err) {
      console.error('[cekdompet] Error:', err)
      await conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat memeriksa dompet.' }, { quoted: msg })
    }
  }
}