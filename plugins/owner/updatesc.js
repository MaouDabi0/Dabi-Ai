import fs from 'fs'
import path from 'path'
import https from 'https';

export default {
  name: 'update',
  command: ['update'],
  tags: 'Owner Menu',
  desc: 'Perbarui file dari GitHub.',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo;
    if (args.length < 2) return conn.sendMessage(chatId, { text: 'Format: .update file.js urlGithub' }, { quoted: msg });

    const [targetPath, githubUrl] = args,
          baseDir = path.resolve(dirname, '../'),
          fullPath = path.resolve(baseDir, targetPath);

    if (!fullPath.startsWith(baseDir)) return conn.sendMessage(chatId, { text: 'Akses ditolak.' }, { quoted: msg });
    if (!fs.existsSync(fullPath)) return conn.sendMessage(chatId, { text: 'File tidak ditemukan.' }, { quoted: msg });

    try {
      const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) throw new Error('URL salah');

      const rawUrl = `https://raw.githubusercontent.com/${match[1]}/${match[2]}/main/${targetPath}`,
            resMsg = await conn.sendMessage(chatId, { text: 'Mengunduh file...' }, { quoted: msg }),
            statusMsg = resMsg.key;

      https.get(rawUrl, res => {
        if (res.statusCode !== 200) return conn.sendMessage(chatId, { text: `Gagal download (${res.statusCode})`, edit: statusMsg }, { quoted: msg });

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', async () => {
          try {
            fs.writeFileSync(fullPath, data);

            for (const [delay, text] of [[2e3, `File diperbarui: ${targetPath}`], [2e3, 'Bot restart dalam 3 detik...']]) {
              await new Promise(r => setTimeout(r, delay));
              await conn.sendMessage(chatId, { text, edit: statusMsg }, { quoted: msg });
            }

            setTimeout(() => process.exit(1), 3e3);

          } catch {
            await conn.sendMessage(chatId, { text: 'Gagal simpan file.', edit: statusMsg }, { quoted: msg });
          }
        });
      }).on('error', async () => await conn.sendMessage(chatId, { text: 'Gagal mengunduh file.', edit: statusMsg }, { quoted: msg }));

    } catch {
      return conn.sendMessage(chatId, { text: 'URL GitHub salah.' }, { quoted: msg });
    }
  }
};