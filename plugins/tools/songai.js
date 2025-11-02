import { songAiStream } from '../../toolkit/scrape/songai.js'

export default {
  name: 'Song AI',
  command: ['songai'],
  tags: 'Tools Menu',
  desc: 'Buat lagu dengan AI berdasarkan prompt',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    textMessage
  }) => {
    const { chatId } = chatInfo,
          text = (textMessage || '').trim()
          
    if (!text)
      return conn.sendMessage(chatId, { text: `Example: ${msg.prefix}songai tema lagu tentang badak dan ikan` }, { quoted: msg })

    try {
      const loadingMsg = await conn.sendMessage(chatId, { text: 'Sedang membuat lagu, tunggu sebentar...' }, { quoted: msg }),
            stream = await songAiStream(text)

      stream.on('data', async chunk => {
        try {
          const eventString = chunk.toString(),
                eventData = eventString.match(/data: (.+)/)
          if (eventData && eventData[1]) {
            const data = JSON.parse(eventData[1])
            data.status === 'queueing' ? console.log('Queueing:', data.msg)
            : data.status === 'generating' ? console.log('Generating:', data.msg)
            : data.status === 'failed' ? (stream.destroy(), conn.sendMessage(chatId, { text: `Gagal: ${data.msg}` }, { quoted: msg }))
            : data.status === 'success'
              ? (stream.destroy(),
                 await conn.sendMessage(chatId, { delete: loadingMsg.key }),
                 await conn.sendMessage(chatId, { text: `Lyrics:\n${data.result.lyrics}` }, { quoted: msg }),
                 await conn.sendMessage(chatId, { audio: { url: data.result.audioUrl }, mimetype: 'audio/mpeg', fileName: `${text.replace(/[^\w\s]/gi, '')}.mp3`, ptt: !1 }, { quoted: msg }))
              : console.log('Unknown status:', data)
          }
        } catch (e) {
          console.error('Error processing chunk:', e.message),
          stream.destroy(),
          conn.sendMessage(chatId, { text: 'Error parsing stream response.' }, { quoted: msg })
        }
      })

      stream.on('error', err => (console.error('Stream error:', err.message), conn.sendMessage(chatId, { text: 'Stream error, coba lagi nanti.' }, { quoted: msg })))
    } catch (error) {
      console.error('[SongAI Error]', error.message),
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan. Coba lagi nanti.' }, { quoted: msg })
    }
  }
}