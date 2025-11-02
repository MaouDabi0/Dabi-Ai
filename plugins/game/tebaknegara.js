export default {
  name: 'tebaknegara',
  command: ['tebaknegara'],
  tags: 'Game Menu',
  desc: 'Game Tebak Negara – Coba tebak nama negara dari petunjuk!',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    commandText
  }) => {
    const chatId = chatInfo.chatId,
          senderId = chatInfo.senderId,
          { tebaknegara } = await global.loadFunctions();

    try {
      const data = global.load(global.pPath),
            gameData = data.FunctionGame || {},
            random = tebaknegara[Math.floor(Math.random() * tebaknegara.length)];

      const sent = await conn.sendMessage(chatId, { text: `*Tebak Negara*\n\n${random.soal}\n\nJawab dengan nama negara yang benar!` }, { quoted: msg });

      gameData[`soal${Object.keys(gameData).length + 1}`] = {
        noId: senderId,
        type: commandText,
        soal: random.soal,
        jawaban: random.jawaban.toLowerCase(),
        created: +Date.now(),
        id: sent.key.id,
        chance: 3,
        status: !0
      };

      data.FunctionGame = gameData;
      global.save(data, global.pPath);

    } catch (e) {
      await conn.sendMessage(chatId, { text: 'Gagal mengirim soal Tebak Negara' }, { quoted: msg });
      console.error('[TebakNegara Error]', e);
    }
  }
};