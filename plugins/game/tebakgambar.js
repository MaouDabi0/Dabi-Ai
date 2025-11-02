import axios from 'axios';

export default {
  name: 'Tebak Gambar',
  command: ['tebakgambar','tebak'],
  tags: 'Game Menu',
  desc: 'Game tebak gambar',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    commandText
  }) => {
    const chatId = chatInfo.chatId,
          senderId = chatInfo.senderId;

    try {
      const data = global.load(global.pPath),
            gameData = global.bersih(data.FunctionGame || {});
      data.FunctionGame = gameData;
      global.save(data, global.pPath);

      if (Object.values(gameData).some(v => v.status && v.chatId === chatId && v.noId === senderId))
        return conn.sendMessage(chatId, { text: 'Kamu masih punya soal tebak gambar yang belum dijawab. Silakan jawab dulu.' }, { quoted: msg });

      const { data: soalList } = await axios.get('https://raw.githubusercontent.com/Zyknn/database/main/tebakgambar.json'),
            soal = soalList[Math.floor(Math.random() * soalList.length)];

      const sent = await conn.sendMessage(chatId, { 
        image: { url: soal.img },
        caption: `Tebak Gambar!\n\n${soal.deskripsi}\n\nBalas dengan jawaban kamu!`
      }, { quoted: msg });

      gameData[`soal${Object.keys(gameData).length + 1}`] = {
        noId: senderId,
        status: !0,
        id: sent.key.id,
        chatId,
        chance: 3,
        data: { soal: soal.deskripsi, tipe: commandText, jawaban: soal.jawaban.toLowerCase() }
      };

      data.FunctionGame = gameData;
      global.save(data, global.pPath);

    } catch (e) {
      console.error('[TEBAK-GAMBAR ERROR]', e);
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat memulai game. Coba lagi nanti.' }, { quoted: msg });
    }
  }
};