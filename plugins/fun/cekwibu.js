export default {
  name: 'cekwibu',
  command: ['cekwibu', 'cek wibu'],
  tags: 'Fun Menu',
  desc: 'Mengecek seberapa wibu orang',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    try {
      const { chatId, senderId } = chatInfo,
            targetId = target(msg, senderId),
            mention = `${targetId}@s.whatsapp.net`,
            pct = Math.floor(Math.random() * 1.01e2),
            komentar = pct <= 25 ? 'Masih aman tapi karbit'
                      : pct <= 44 ? 'Lumayan lah bukan fomo'
                      : pct <= 72 ? 'Kalo ini sih gangguan jiwa'
                      : pct <= 88 ? 'Fiks wibu bau bawang'
                      : 'Aduh udah gila ini mah',
            teks = `Seberapa wibu @${targetId}\n\n*${pct}%* Wibu\n_${komentar}_`;

      await conn.sendMessage(chatId, { text: teks, mentions: [mention] }, { quoted: msg });
    } catch (e) {
      console.error('Error:', e),
      conn.sendMessage(msg.key.remoteJid, { text: `Error: ${e.message || e}`, quoted: msg });
    }
  }
};