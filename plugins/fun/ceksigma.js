export default {
  name: 'ceksigma',
  command: ['ceksigma'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa sigma seseorang',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId, senderId } = chatInfo,
          targetId = target(msg, senderId),
          mentionTarget = targetId,
          persentase = Math.floor(Math.random() * 1e2 + 1)

    let komentar = persentase <= 25 ? 'Masih cupu'
                 : persentase <= 44 ? 'Lumayan alpha'
                 : persentase <= 72 ? 'Wih calon sigma!'
                 : persentase <= 88 ? 'Sigma sejati!'
                 : 'Hati² Alpha Overlord!',
        teks = `Cek seberapa sigma @${mentionTarget}\n\n${persentase}% Sigma\n_${komentar}_`

    await conn.sendMessage(chatId, { text: teks, mentions: [`${targetId}@s.whatsapp.net`] }, { quoted: msg })
  }
}