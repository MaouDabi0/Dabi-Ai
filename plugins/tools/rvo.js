import fs from 'fs';
import path from 'path';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
  name: 'rvo',
  command: ['rvo', 'readviewonce'],
  tags: 'Tools Menu',
  desc: 'Mengekstrak media sekali lihat.',
  prefix: !0,
  premium: !0,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo,
          quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted) return conn.sendMessage(chatId, { text: 'Balas ke media (View Once atau biasa) yang mau diambil.' }, { quoted: msg });

    const viewOnce = quoted.viewOnceMessageV2Extension?.message ||
                     quoted.viewOnceMessageV2?.message ||
                     quoted.viewOnceMessage?.message ||
                     quoted,
          mediaTypes = ['image', 'video', 'audio'],
          mediaType = mediaTypes.find(t => viewOnce?.[`${t}Message`]),
          mediaMsg = viewOnce?.[`${mediaType}Message`];

    if (!mediaType || !mediaMsg?.mediaKey) return conn.sendMessage(chatId, { text: 'Media tidak didukung atau sudah dibuka.' }, { quoted: msg });

    let buffer;
    try {
      buffer = await downloadMediaMessage(
        { message: { [`${mediaType}Message`]: mediaMsg } },
        'buffer', {}, 
        { logger: conn.logger, reuploadRequest: conn.updateMediaMessage }
      );
      if (!buffer) throw new Error('Gagal mengunduh media.');
    } catch (e) {
      return conn.sendMessage(chatId, { text: `${e.message}` }, { quoted: msg });
    }

    const ext = mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'mp3',
          filename = path.join(dirname, '../temp', `${Date.now()}.${ext}`);

    fs.mkdirSync(path.dirname(filename), { recursive: !0 });
    fs.writeFileSync(filename, buffer);

    await conn.sendMessage(chatId, { [mediaType]: { url: filename }, caption: mediaMsg.caption ? `*Pesan:* ${mediaMsg.caption}` : 'Media berhasil diambil.' }, { quoted: msg });
  }
};