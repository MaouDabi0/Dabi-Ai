export default {
  name: 'CekKhodam',
  command: ['cekkodam', 'cekkhodam'],
  tags: 'Fun Menu',
  desc: 'Cek kodam pengguna',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { cekKhodam } = await global.loadFunctions();

      const { chatId, senderId } = chatInfo;
      let targetId = target(msg, senderId);
      const mentionTarget = targetId;

      const cek = cekKhodam[Math.floor(Math.random() * cekKhodam.length)];
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

      const teks2 = `Bentar tak terawang dulu...`;
      const teks = `_Pengecekan Khodam untuk @${mentionTarget}⁩ telah berhasil_!\n\nSetelah melalui penelusuran spiritual yang mendalam, diketahui bahwa Khodam yang mendampingi @${mentionTarget} adalah *${cek}*`;

      await conn.sendMessage(chatId, {
        text: teks2,
        mentions: [`${targetId}@s.whatsapp.net`]
      }, { quoted: msg });

      await delay(3000);

      await conn.sendMessage(chatId, {
        text: teks,
        mentions: [`${targetId}@s.whatsapp.net`]
      }, { quoted: msg });
    } catch (error) {
      console.error('Error pada cekKhodam:', error);
      conn.sendMessage(msg.key.remoteJid, {
        text: `Error pada cekKhodam: ${error.message || error}`,
        quoted: msg,
      });
    }
  }
};