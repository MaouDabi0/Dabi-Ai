export default {
  name: 'cekpinter',
  command: ['cekpinter', 'cekpintar', 'cekkepintaran'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa pinter orang',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    try {
      const { chatId, senderId } = chatInfo,
            targetId = target(msg, senderId),
            mentionTarget = targetId,
            persentase = Math.floor(Math.random() * 101),
            komentar = persentase <= 25 ? 'Gak tolol² amat lah'
                      : persentase <= 44 ? 'Masih mending'
                      : persentase <= 72 ? 'Pinter juga lu'
                      : persentase <= 88 ? 'Tumben pinter'
                      : 'Orang c*na sih ini!',
            teks = `*Seberapa pintar* @${mentionTarget}\n\n*${persentase}%* pintar\n_${komentar}_`

      await conn.sendMessage(chatId, { text: teks, mentions: [`${targetId}@s.whatsapp.net`] }, { quoted: msg })
    } catch (err) {
      console.error('Error:', err),
      conn.sendMessage(msg.key.remoteJid, { text: `Error: ${err.message || err}` }, { quoted: msg })
    }
  }
}