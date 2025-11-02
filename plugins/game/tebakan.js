export default {
  name: 'Tebakan',
  command: ['tebakan'],
  tags: 'Game Menu',
  desc: 'Tebak-tebakan receh berhadiah tawa!',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    commandText
  }) => {
    const chatId = chatInfo.chatId,
          senderId = chatInfo.senderId,
          { tebakSoal } = await global.loadFunctions();

    try {
      const data = global.load(global.pPath),
            gameData = data.FunctionGame || {},
            random = tebakSoal[Math.floor(Math.random() * tebakSoal.length)];

      const sent = await conn.sendMessage(chatId, { text: `*Tebakan Lucu!*\n\n${random.soal}` }, { quoted: msg });

      gameData[`soal${Object.keys(gameData).length + 1}`] = {
        noId: senderId,
        type: commandText,
        soal: random.soal,
        jawaban: random.jawaban,
        created: Date.now(),
        id: sent.key.id,
        chance: 3,
        status: !0
      };

      data.FunctionGame = gameData;
      global.save(data, global.pPath);

    } catch (e) {
      await conn.sendMessage(chatId, { text: 'Gagal mengirim soal tebakan.' }, { quoted: msg });
      console.error('[Tebakan Error]', e);
    }
  }
};