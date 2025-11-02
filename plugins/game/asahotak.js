export default {
  name: 'asahotak',
  command: ['asahotak'],
  tags: 'Game Menu',
  desc: 'Game Asah Otak – Tebak jawaban dari soal!',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    commandText
  }) => {
    const { chatId, senderId } = chatInfo,
          { asahotak } = await global.loadFunctions()

    try {
      const data = global.load(global.pPath),
            gameData = data.FunctionGame || {},
            random = asahotak[Math.floor(Math.random() * asahotak.length)],
            sent = await conn.sendMessage(chatId, { text: `Asah Otak\n\n${random.soal}\n\nJawab dengan benar sebelum kehabisan kesempatan!` }, { quoted: msg }),
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
      await conn.sendMessage(chatId, { text: 'Gagal mengirim soal Asah Otak' }, { quoted: msg })
      console.error('[AsahOtak Error]', e)
    }
  }
}