import { songAiStream } from '../../toolkit/scrape/songai.js';

export default {
  name: 'Song AI',
  command: ['songai'],
  tags: 'Tools Menu',
  desc: 'Buat lagu dengan AI berdasarkan prompt',
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, { chatInfo, textMessage }) => {
    const { chatId } = chatInfo;
    const text = (textMessage || '').trim();

    if (!text) {
      return conn.sendMessage(chatId, {
        text: `Example: ${msg.prefix}songai tema lagu tentang badak dan ikan`
      }, { quoted: msg });
    }

    try {
      const loadingMsg = await conn.sendMessage(chatId, {
        text: 'Sedang membuat lagu, tunggu sebentar...'
      }, { quoted: msg });

      const stream = await songAiStream(text);

      stream.on('data', async (chunk) => {
        try {
          const eventString = chunk.toString();
          const eventData = eventString.match(/data: (.+)/);
          if (eventData && eventData[1]) {
            const data = JSON.parse(eventData[1]);
            switch (data.status) {
              case 'queueing':
                console.log('Queueing:', data.msg);
                break;
              case 'generating':
                console.log('Generating:', data.msg);
                break;
              case 'failed':
                stream.destroy();
                return conn.sendMessage(chatId, { text: `Gagal: ${data.msg}` }, { quoted: msg });
              case 'success':
                stream.destroy();
                const result = data.result;
                await conn.sendMessage(chatId, { delete: loadingMsg.key });
                await conn.sendMessage(chatId, { text: `Lyrics:\n${result.lyrics}` }, { quoted: msg });
                await conn.sendMessage(chatId, {
                  audio: { url: result.audioUrl },
                  mimetype: 'audio/mpeg',
                  fileName: `${text.replace(/[^\w\s]/gi, '')}.mp3`,
                  ptt: false
                }, { quoted: msg });
                break;
              default:
                console.log('Unknown status:', data);
            }
          }
        } catch (e) {
          console.error('Error processing chunk:', e.message);
          stream.destroy();
          return conn.sendMessage(chatId, { text: 'Error parsing stream response.' }, { quoted: msg });
        }
      });

      stream.on('error', (err) => {
        console.error('Stream error:', err.message);
        return conn.sendMessage(chatId, { text: 'Stream error, coba lagi nanti.' }, { quoted: msg });
      });
    } catch (error) {
      console.error('[SongAI Error]', error.message);
      return conn.sendMessage(chatId, { text: 'Terjadi kesalahan. Coba lagi nanti.' }, { quoted: msg });
    }
  }
};