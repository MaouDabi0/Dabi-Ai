const axios = require('axios');

module.exports = {
  name: 'ttsai',
  command: ['ttsai', 'speak'],
  tags: 'Audio',
  desc: 'Mengubah teks menjadi suara menggunakan API ElevenLabs.',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    args
  }) => {
    try {
      const {
        chatId
      } = chatInfo;
      if (!args.length) {
        return conn.sendMessage(chatId, {
          text: '❌ Format salah! Gunakan: `.ttsai <model> | <text>`'
        }, {
          quoted: message
        });
      }

      const input = args.join(" ").split("|");
      if (input.length < 2) {
        return conn.sendMessage(chatId, {
          text: '❌ Format salah! Pastikan ada pemisah `|` antara model dan teks. Contoh: `.ttsai matilda | Halo semua`'
        }, {
          quoted: message
        });
      }

      const model = input[0].trim();
      const text = input.slice(1).join("|").trim();

      if (!model || !text) {
        return conn.sendMessage(chatId, {
          text: '❌ Model atau teks tidak boleh kosong. Contoh: `.ttsai matilda | Halo semua`'
        }, {
          quoted: message
        });
      }

      const validModels = ["matilda", "laura", "jessica", "brian", "alice", "bill"];
      if (!validModels.includes(model.toLowerCase())) {
        return conn.sendMessage(chatId, {
          text: `❌ Model "${model}" tidak valid. Pilihan model yang tersedia: ${validModels.join(", ")}`
        }, {
          quoted: message
        });
      }

      const encodedText = encodeURIComponent(text);
      const url = `https://nirkyy.koyeb.app/api/v1/elevenlabs?text=${encodedText}&model=${model.toLowerCase()}`;

      const response = await axios.get(url, {
        responseType: 'arraybuffer'
      });

      if (!response.data) {
        return conn.sendMessage(chatId, {
          text: '❌ Gagal mendapatkan audio dari API.'
        }, {
          quoted: message
        });
      }

      conn.sendMessage(chatId, {
        audio: response.data,
        mimetype: 'audio/mpeg'
      }, {
        quoted: message
      });

    } catch (error) {
      console.error(error);
      conn.sendMessage(message.key.remoteJid, {
        text: '❌ Terjadi kesalahan saat memproses permintaan TTS.'
      }, {
        quoted: message
      });
    }
  }
};
