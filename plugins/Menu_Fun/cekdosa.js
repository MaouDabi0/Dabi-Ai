const { cekDosa } = require('../../toolkit/function.js');

module.exports = {
  name: 'Cek Dosa',
  command: ['cekdosa', 'cek dosa'],
  tags: 'Fun Menu',
  desc: 'Mengecek 10 dosa besar user',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      const targetId = target(message, senderId);
      const mentionTarget = targetId;
      const tagJid = `${targetId}@s.whatsapp.net`;

      const dosaUnik = [...cekDosa].sort(() => Math.random() - 0.5).slice(0, 10);

      let teks = `Top 10 dosa besar @${mentionTarget}\n`;
      dosaUnik.forEach((dosa, i) => {
        teks += `${i + 1}. ${dosa}\n`;
      });

      await conn.sendMessage(chatId, {
        text: teks.trim(),
        mentions: [tagJid]
      }, { quoted: message });

    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: message,
      });
    }
  }
}