import fetch from 'node-fetch'

export default {
  name: 'tebakheroml',
  command: ['tebakheroml', 'tebakml'],
  tags: 'Game Menu',
  desc: 'Tebak hero ML',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId, senderId } = chatInfo
    try {
      const api = `${delineApi}/game/tebakheroml`,
            res = await fetch(api),
            time = Format.indoTime("Asia/Jakarta", "HH:mm");

      if (!res.ok) return conn.sendMessage(chatId, { text: `Gagal memanggil API (status ${res.status})` }, { quoted: msg })

      const json = await res.json(),
            data = json.result,
            database = global.load(global.p),
            gameData = database.FunctionGame || {},
            sessionKey = `soal${Object.keys(gameData).length + 1}`
            prem = `Tebak Hero ML
Deskripsi: ${data.deskripsi}`

      const chat = await conn.sendMessage(chatId, {
        text: prem,
        contextInfo: {
          externalAdReply: {
            body: 'tebak hero ini',
            thumbnailUrl: data.fullimg,
            mediaType: 1,
            renderLargerThumbnail: !0
          },
          forwardingScore: 1,
          isForwarded: !0,
          forwardedNewsletterMessageInfo: {
            newsletterJid: idCh
          }
        }
      }, { quoted: msg })

      gameData[sessionKey] = {
        noId: senderId,
        soal: `${data.deskripsi}`,
        jawaban: `${data.jawaban}`,
        created: time,
        id: chat.key?.id || null,
        chance: 3,
        status: !0
      }

      database.FunctionGame = gameData
      save(database, global.p)

      return !1
    } catch (e) {
      console.log('error pada tebakheroml', e)
    }
  }
}