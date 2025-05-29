module.exports = {
  name: 'afk',
  command: ['afk'],
  tags: 'Info Menu',
  desc: 'Menandai kamu sedang AFK.',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    args 
  }) => {
    try {
      const { senderId, pushName, chatId, isGroup } = chatInfo;
      intDB();
      const db = readDB();

      const userKey = Object.keys(db.Private).find(key => db.Private[key].Nomor === senderId);
      if (!isGroup)
        return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan dalam grup!" }, { quoted: message });
      if (!userKey) {
        return conn.sendMessage(chatId, { 
          text: '❌ Kamu belum terdaftar! Ketik .daftar untuk mendaftar.' 
        }, { quoted: message });
      }

      const alasan = args.join(' ') || 'Tidak ada alasan';
      db.Private[userKey].afk = {
        afkTime: Math.floor(Date.now() / 1000),
        reason: alasan
      };

      saveDB(db);

      return conn.sendMessage(chatId, {
        text: `🔕 *AFK Aktif*\n${pushName} sekarang sedang AFK\n📌 Alasan: ${alasan}`
      }, { quoted: message });

    } catch (err) {
      console.error('AFK Error:', err);
      conn.sendMessage(chatId, { 
        text: '⚠️ Terjadi kesalahan saat mengatur AFK.' 
      }, { quoted: message });
    }
  }
};