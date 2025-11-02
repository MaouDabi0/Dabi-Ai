export default {
  name: 'cektolol',
  command: ['cektolol'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa tolol seseorang',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId, senderId } = chatInfo,
          targetId = target(msg, senderId),
          mention = `${targetId}@s.whatsapp.net`,
          pct = Math.floor(Math.random() * 1.01e2),
          komentar = pct <= 25 ? 'Masih pinter kok'
                    : pct <= 44 ? 'Agak bego dikit'
                    : pct <= 72 ? 'Aduh tolol nih'
                    : pct <= 88 ? 'Fix goblok'
                    : 'Hati² idiot tingkat dewa',
          teks = `Cek seberapa tolol @${targetId}\n\n${pct}% Tolol\n_${komentar}_`;

    conn.sendMessage(chatId, { text: teks, mentions: [mention] }, { quoted: msg });
  }
};