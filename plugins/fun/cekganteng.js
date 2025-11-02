export default {
  name: 'cekganteng',
  command: ['cekganteng'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa ganteng seseorang',
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
    const { chatId, senderId } = chatInfo,
          targetId = target(msg, senderId),
          persentase = Math.floor(Math.random() * 1.01e2),
          komentar = persentase <= 25 ? 'Masih biasa aja'
                    : persentase <= 44 ? 'Lumayan lah'
                    : persentase <= 72 ? 'Ganteng juga kamu'
                    : persentase <= 88 ? 'Wah ganteng banget'
                    : 'Calon Oppa Korea!',
          teks = `*Seberapa ganteng* @${targetId}\n\n*${persentase}%* Ganteng\n_${komentar}_`

    await conn.sendMessage(chatId, { text: teks, mentions: [`${targetId}@s.whatsapp.net`] }, { quoted: msg })
  }
}