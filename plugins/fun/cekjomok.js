export default {
  name: 'cekjomok',
  command: ['cekjomok', 'cekgay'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa jomok seseorang',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId, senderId } = chatInfo,
          targetId = target(msg, senderId),
          tagJid = `${targetId}@s.whatsapp.net`,
          persentase = Math.floor(Math.random() * 1.01e2),
          komentar = persentase <= 25 ? 'Masih aman lu bang' :
                      persentase <= 44 ? 'Agak lain lu bang' :
                      persentase <= 72 ? 'Waduh warga sungut lele' :
                      persentase <= 88 ? 'Fiks jomok' : 'Hati² orang jomok',
          teks = `*Cek seberapa jomok* @${targetId}\n\n*${persentase}%* Jomok\n_${komentar}_`

    await conn.sendMessage(chatId, { text: teks, mentions: [tagJid] }, { quoted: msg })
  }
}