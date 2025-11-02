export default {
  name: 'cekcantik',
  command: ['cekcantik'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa cantik seseorang',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo,
          targetId = target(msg, senderId),
          mentionTarget = targetId,
          persentase = Math.floor(Math.random() * 1e2 + 1),
          komentar = persentase <= 25 ? 'Masih biasa aja' :
                      persentase <= 44 ? 'Lumayan lah' :
                      persentase <= 72 ? 'Cantik juga kamu' :
                      persentase <= 88 ? 'Wah cantik banget' :
                      'Calon Miss Universe!',
          teks = `*Seberapa cantik* @${mentionTarget}\n\n*${persentase}%* Cantik\n_${komentar}_`

    await conn.sendMessage(chatId, { text: teks, mentions: [`${targetId}@s.whatsapp.net`] }, { quoted: msg })
  }
}