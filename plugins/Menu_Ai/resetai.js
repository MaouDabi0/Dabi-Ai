const fs = require('fs');
const path = require('path');
const sessionPath = path.join(__dirname, '../../session/AiSesion.json');

module.exports = {
  name: 'resetai',
  command: ['resetaichat', 'resetai'],
  tags: 'Ai Menu',
  desc: 'Mereset sesi AI',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    args,
    prefix,
    commandText
  }) => {
    try {
      const { senderId, chatId } = chatInfo;
      const session = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));

      const filterSystemOnly = (arr) => {
        return arr.filter(item => item.role === 'system' && item.content.trim() !== '');
      };

      if (commandText === 'resetai' && args[0] === 'all') {
        for (let key in session) {
          session[key] = filterSystemOnly(session[key]);
        }
        fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
        return conn.sendMessage(chatId, {
          text: `Sesi AI semua pengguna berhasil direset.`
        }, { quoted: message });
      }

      if (commandText === 'resetaichat') {
        if (!session[senderId]) {
          return conn.sendMessage(chatId, {
            text: 'Tidak ada sesi AI yang ditemukan untuk kamu.'
          }, { quoted: message });
        }

        session[senderId] = filterSystemOnly(session[senderId]);
        fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
        return conn.sendMessage(chatId, {
          text: 'Sesi AI kamu berhasil direset.'
        }, { quoted: message });
      }

      return conn.sendMessage(chatId, {
        text: `Gunakan format:\n• ${prefix}resetaichat\n• ${prefix}resetai all`
      }, { quoted: message });

    } catch (err) {
      console.error(err);
      conn.sendMessage(chatInfo.chatId, {
        text: 'Terjadi kesalahan saat mereset sesi AI.'
      }, { quoted: message });
    }
  }
};