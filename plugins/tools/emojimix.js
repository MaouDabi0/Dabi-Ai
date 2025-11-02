import fetch from 'node-fetch'
import { convertToWebp, sendImageAsSticker } from '../../toolkit/exif.js'

export default {
  name: 'emojimix',
  command: ['emojimix', 'mix'],
  tags: 'Tools Menu',
  desc: 'Gabungkan dua emoji dan kirim sebagai stiker',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args,
    prefix,
    commandText
  }) => {
    const { chatId } = chatInfo

    if (args.length < 2)
      return conn.sendMessage(chatId, { text: `Contoh penggunaan:\n${prefix}${commandText} 😭 😂` }, { quoted: msg })

    try {
      const emoji1 = args[0],
            emoji2 = args[1],
            url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyC-P6_qz3FzCoXGLk6tgitZo4jEJ5mLzD8&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`,
            res = await fetch(url),
            data = await res.json(),
            results = data?.results || []

      if (!results.length)
        return conn.sendMessage(chatId, { text: 'Kombinasi emoji tidak didukung.' }, { quoted: msg })

      for (const i of results) {
        const imgUrl = i?.url || i?.media_formats?.png_transparent?.url
        if (!imgUrl) continue

        const imgBuffer = await (await fetch(imgUrl)).arrayBuffer(),
              webpBuffer = await convertToWebp(Buffer.from(imgBuffer))

        await sendImageAsSticker(conn, chatId, webpBuffer, msg)
      }
    } catch (err) {
      console.error('Error emojimix:', err),
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat membuat emoji mix.' }, { quoted: msg })
    }
  }
}