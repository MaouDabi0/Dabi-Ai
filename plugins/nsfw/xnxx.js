import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
import axios from 'axios';
import { fetchXnxx, searchXnxx } from '../../toolkit/scrape/xnxx.js';

const TMP = path.resolve('./temp');
if (!fs.existsSync(TMP)) console.log('Folder temp tidak ada');

export default {
  name: 'xnxxdl',
  command: ['xnxxdl', 'xnxx'],
  tags: 'Nsfw Menu',
  desc: 'Cari & download video dari xnxx',
  prefix: true,
  owner: false,
  premium: true,

  run: async (conn, msg, {
    chatInfo,
    args,
    commandText,
    prefix
  }) => {
    const { chatId } = chatInfo;
    if (!args[0]) {
      return conn.sendMessage(
        chatId,
        { text: `⚠️ Masukkan judul pencarian!\nContoh: ${prefix}${commandText} Japanese Hentai 2` },
        { quoted: msg }
      );
    }

    let file;
    try {
      let limit = 2;
      const lastArg = args[args.length - 1];
      if (!isNaN(lastArg)) {
        limit = Math.min(parseInt(lastArg), 5);
        args.pop();
      }

      const query = args.join(' ');
      const results = await searchXnxx(query, limit);

      await conn.sendMessage(chatId, { react: { text: "⏳", key: msg.key } });

      for (const item of results) {
        const videoData = await fetchXnxx(item.link);
        const videoUrl = videoData.download.high || videoData.download.low;

        const res = await axios.get(videoUrl, { responseType: 'stream' });
        file = path.join(TMP, `xnxx_${Date.now()}.mp4`);
        const writer = fs.createWriteStream(file);
        res.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        await conn.sendMessage(
          chatId,
          {
            video: { url: file },
            caption: `🎬 *${videoData.title}*\n⏱ Duration: ${videoData.duration}s\n🔗 ${videoData.link}`
          },
          { quoted: msg }
        );

        await fsp.unlink(file).catch(() => {});
      }
    } catch (e) {
      conn.sendMessage(chatId, { text: `Error: ${e.message}` }, { quoted: msg });
    }
  }
};