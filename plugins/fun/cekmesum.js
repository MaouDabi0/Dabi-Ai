export default {
  name: 'cek mesum',
  command: ['cekmesum'],
  tags: 'Fun Menu',
  desc: 'Mengecek seberapa mesum orang',
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
            komentar = persentase <= 25 ? 'Masih mending'
                      : persentase <= 44 ? 'Waduh ini sih udah'
                      : persentase <= 72 ? 'Parah sih ini'
                      : persentase <= 88 ? 'Cabul bet'
                      : 'Hati-hati orang cabul',
            teks = `*Seberapa cabul* @${mentionTarget}\n\n*${persentase}%* Cabul\n_${komentar}_`

      await conn.sendMessage(chatId, { text: teks, mentions: [`${targetId}@s.whatsapp.net`] }, { quoted: msg })
    } catch (err) {
      console.error('Error:', err),
      conn.sendMessage(msg.key.remoteJid, { text: `Error: ${err.message || err}` }, { quoted: msg })
    }
  }
}