export default {
  name: 'Family-100',
  command: ['family', 'family100'],
  tags: 'Game Menu',
  desc: 'Family-100 gameplay',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId, senderId } = chatInfo,
          { soalFamily } = await global.loadFunctions()

    try {
      const session = global.load(global.pPath)
      session.FunctionGame ??= {}
      const randomSoal = soalFamily[Math.floor(Math.random() * soalFamily.length)],
            sent = await conn.sendMessage(chatId, { text: `Family 100\n\n${randomSoal.soal}` }, { quoted: msg }),
            soalId = sent.key.id,
            sessionKey = `soal${Object.keys(session.FunctionGame).length + 1}`

      session.FunctionGame[sessionKey] = {
        noId: senderId,
        soal: randomSoal.soal,
        jawaban: randomSoal.jawaban,
        created: Date.now(),
        id: soalId,
        chance: 3
      }

      global.save(session, global.pPath)
    } catch {
      await conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat menjalankan game.' }, { quoted: msg })
    }
  }
}