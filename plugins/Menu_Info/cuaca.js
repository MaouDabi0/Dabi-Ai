const fetch = require('node-fetch');

module.exports = {
  name: 'cuaca',
  command: ['cuaca', 'cekcuaca'],
  tags: 'Tools Menu',
  desc: 'Cek cuaca berdasarkan nama kota',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId } = chatInfo;
      const kota = args.join(' ') || 'jakarta';
      const url = `https://api.ureshii.my.id/api/internet/cuaca?kota=${encodeURIComponent(kota)}`;
      const res = await fetch(url);
      const json = await res.json();

      if (!json.status || !json.data) {
        return await conn.sendMessage(chatId, { text: `Gagal mendapatkan data cuaca untuk kota: ${kota}` }, { quoted: message });
      }

      const data = json.data;
      const teks = `*Cuaca Hari Ini di ${data.lokasi}, ${data.negara}*\n\n` +
                   `🌤️ *Cuaca:* ${data.cuaca}\n` +
                   `🌡️ *Suhu Saat Ini:* ${data.suhu_saat_ini}°C\n` +
                   `🔥 *Suhu Tertinggi:* ${data.suhu_tertinggi}°C\n` +
                   `❄️ *Suhu Terendah:* ${data.suhu_terendah}°C\n` +
                   `💧 *Kelembapan:* ${data.kelembapan}%\n` +
                   `🌬️ *Kecepatan Angin:* ${data.angin} m/s\n\n` +
                   `Semoga harimu menyenangkan! Jangan lupa bawa payung kalau cuacanya mendung ya! ☂️`;

      await conn.sendMessage(chatId, { text: teks }, { quoted: message });

    } catch (err) {
      console.error(err);
      await conn.sendMessage(chatInfo.chatId, { text: 'Terjadi kesalahan saat mengambil data cuaca.' }, { quoted: message });
    }
  }
};