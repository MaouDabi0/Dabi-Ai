export default {
  name: 'SiapaAku',
  command: ['siapakahaku'],
  tags: 'Game Menu',
  desc: 'Game Siapakah Aku? Coba tebak siapa aku dari petunjuk!',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    commandText
  }) => {
    const { chatId, senderId } = chatInfo,
          { siapaAkuSoal } = await global.loadFunctions()

    try {
      const data = global.load(global.pPath),
            gameData = data.FunctionGame || {},
            random = siapaAkuSoal[Math.floor(Math.random() * siapaAkuSoal.length)],
            sent = await conn.sendMessage(chatId, { text: `Siapakah Aku?\n\n${random.soal}` }, { quoted: msg }),
            sessionKey = `soal${Object.keys(gameData).length + 1}`

      gameData[sessionKey] = {
        noId: senderId,
        type: commandText,
        soal: random.soal,
        jawaban: random.jawaban.toLowerCase(),
        created: Date.now(),
        id: sent.key.id,
        chance: 3,
        status: !0
      }

      data.FunctionGame = gameData
      global.save(data, global.pPath)
    } catch (e) {
      await conn.sendMessage(chatId, { text: 'Gagal mengirim soal Siapakah Aku?' }, { quoted: msg })
      console.error('[SiapakahAku Error]', e)
    }
  }
}