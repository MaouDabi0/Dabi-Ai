import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

export default {
  name: 'savefile',
  command: ['savefile', 'sf'],
  tags: 'Owner Menu',
  desc: 'Menulis ulang file.',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo,
          quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation,
          baseDir = path.resolve('./'),
          filePath = args.length ? path.resolve(baseDir, args.join(' ')) : '',
          inBase = filePath.startsWith(baseDir);
    let statusMsg;

    if (!args.length || !quoted || !inBase)
      return conn.sendMessage(chatId, { text: 
        !args.length
          ? 'Masukkan path file!'
          : !quoted
            ? 'Kutip pesan berisi teks!'
            : 'Akses file di luar BaseBot tidak diizinkan!'
      }, { quoted: msg });

    try {
      const status = await conn.sendMessage(chatId, { text: 'Menyimpan file...' }, { quoted: msg });
      statusMsg = status.key,
      fs.writeFileSync(filePath, quoted, 'utf8');

      const fileUrl = pathToFileURL(filePath).href,
            updated = await import(`${fileUrl}?update=${Date.now()}`);

      updated.default?.name && global.plugins && (global.plugins[updated.default.name] = updated.default);

      const savedText = `File berhasil disimpan\nPath: ${filePath.replace(baseDir + '/', '')}`;
      await conn.sendMessage(chatId, { text: savedText, edit: statusMsg }, { quoted: msg });
    } catch (e) {
      console.error(e);
      const errText = { text: 'Terjadi kesalahan saat menyimpan file' };
      statusMsg
        ? await conn.sendMessage(chatId, { ...errText, edit: statusMsg })
        : await conn.sendMessage(chatId, { ...errText, quoted: msg });
    }
  }
};