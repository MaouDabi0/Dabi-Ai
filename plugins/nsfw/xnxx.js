import path from 'path'
import fs from 'fs'
import fsp from 'fs/promises'
import axios from 'axios'
import { fetchXnxx, searchXnxx } from '../../toolkit/scrape/xnxx.js'

const TMP = path.resolve('./temp')
fs.existsSync(TMP) ? 0 : console.log('Folder temp tidak ada')

export default {
  name: 'xnxxdl',
  command: ['xnxxdl', 'xnxx'],
  tags: 'Nsfw Menu',
  desc: 'Cari & download video dari xnxx',
  prefix: !0,
  owner: !1,
  premium: !0,

  run: async (conn, msg, {
    chatInfo,
    args,
    commandText,
    prefix
  }) => {
    const { chatId } = chatInfo
    if (!args[0]) return conn.sendMessage(chatId, { text: `Masukkan judul pencarian!\nContoh: ${prefix}${commandText} Japanese Hentai 2` }, { quoted: msg })

    let file
    try {
      let limit = 2,
          lastArg = args[args.length - 1]
      !isNaN(lastArg) ? (limit = Math.min(parseInt(lastArg), 5), args.pop()) : 0

      const query = args.join(' '),
            results = await searchXnxx(query, limit)
      await conn.sendMessage(chatId, { react: { text: '⏳', key: msg.key } })

      for (const item of results) {
        const videoData = await fetchXnxx(item.link),
              videoUrl = videoData.download.high || videoData.download.low,
              res = await axios.get(videoUrl, { responseType: 'stream' }),
              writer = fs.createWriteStream(file = path.join(TMP, `xnxx_${Date.now()}.mp4`))

        res.data.pipe(writer)
        await new Promise((resv, rej) => (writer.on('finish', resv), writer.on('error', rej)))

        await conn.sendMessage(chatId, {
          video: { url: file },
          caption: `*${videoData.title}*\nDuration: ${videoData.duration}s\n${videoData.link}`
        }, { quoted: msg })

        await fsp.unlink(file).catch(() => 0)
      }
    } catch (e) {
      conn.sendMessage(chatId, { text: `Error: ${e.message}` }, { quoted: msg })
    }
  }
}