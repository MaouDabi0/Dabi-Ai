import fs from 'fs'
import path from 'path';

export default {
  name: 'getfile',
  command: ['getfile', 'gf'],
  tags: 'Owner Menu',
  desc: 'Menampilkan isi file dalam bentuk teks',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo,
          baseDir = path.resolve('./'),
          filePath = args.length ? path.resolve(baseDir, args.join(' ')) : '';

    if (!args.length || !filePath.startsWith(baseDir) || !fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory())
      return conn.sendMessage(chatId, { text: 
        !args.length
          ? 'Masukkan path file yang ingin diambil!'
          : !filePath.startsWith(baseDir)
            ? 'Akses file di luar direktori BaseBot tidak diizinkan!'
            : !fs.existsSync(filePath)
              ? 'File tidak ditemukan!'
              : 'Path adalah direktori, bukan file!'
      }, { quoted: msg });

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8'),
            filePathDisplay = filePath.replace(baseDir + '/', ''),
            maxLength = 4e3;

      await conn.sendMessage(chatId, { text: `Path File: ${filePathDisplay}` }, { quoted: msg });

      for (let i = 0; i < fileContent.length; i += maxLength)
        await conn.sendMessage(chatId, { text: fileContent.slice(i, i + maxLength) }, { quoted: msg });
    } catch (e) {
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat membaca file!' }, { quoted: msg });
    }
  }
};