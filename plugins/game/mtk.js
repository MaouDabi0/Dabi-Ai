export default {
  name: 'MathQuiz',
  command: ['mtk', 'tesmtk'],
  tags: 'Game Menu',
  desc: 'Jawab soal matematika sederhana!',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId, senderId } = chatInfo,
          [num1, num2] = [1, 1].map(() => Math.floor(Math.random() * 1e2) + 1),
          opList = ['+', '-', '*', '÷'],
          op = opList[Math.floor(Math.random() * 4)],
          opsMap = {
            '+': { result: num1 + num2, symbol: '+' },
            '-': { result: num1 - num2, symbol: '-' },
            '*': { result: num1 * num2, symbol: '×' },
            '÷': { result: (num1 / num2).toFixed(2), symbol: '÷' }
          },
          { result, symbol } = opsMap[op],
          question = `${num1} ${symbol} ${num2}`,
          res = await conn.sendMessage(chatId, { text: `Soal MTK: ${question} = ?\n\nBalas pesan ini dengan jawabanmu!` }, { quoted: msg }),
          data = global.load(global.pPath),
          gameData = data.FunctionGame || {},
          sessionKey = `soal${Object.keys(gameData).length + 1}`

    gameData[sessionKey] = {
      noId: senderId,
      soal: question,
      jawaban: result,
      created: Date.now(),
      id: res.key.id,
      chance: 3,
      status: !0
    }

    data.FunctionGame = gameData
    global.save(data, global.pPath)
  }
}