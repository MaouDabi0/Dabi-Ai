import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
  name: 'tourl',
  command: ['tourl'],
  tags: 'Tools Menu',
  desc: 'Mengubah media menjadi URL.',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo,
          quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage,
          main = msg.message,
          media = quoted?.imageMessage || quoted?.videoMessage || main?.imageMessage || main?.videoMessage;

    if (!media) return conn.sendMessage(chatId, { text: 'Kirim atau balas gambar/video dengan caption *.tourl*' }, { quoted: msg });

    try {
      const buffer = await downloadMediaMessage(
              { message: quoted || main }, 'buffer', {}, 
              { logger: conn.logger, reuploadRequest: conn.updateMediaMessage }
            );
      if (!buffer) throw new Error('Media tidak terunduh!');

      const mime = media.mimetype || 'application/octet-stream',
            ext = mime.includes('image') ? 'jpg' : mime.includes('video') ? 'mp4' : 'bin',
            tempDir = path.join(dirname, '../temp/'),
            tempFile = path.join(tempDir, `tourl_${Date.now()}.${ext}`),
            key = 'AIzaBj7z2z3xBjsk',
            url = 'https://c.termai.cc'

      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: !0 });
      await fs.promises.writeFile(tempFile, buffer);

      const form = new FormData();
      form.append('file', fs.createReadStream(tempFile), { filename: `file.${ext}` });

      const { data } = await axios.post(`${url}/api/upload?key=${key}`, form, { headers: form.getHeaders() });
      await fs.promises.unlink(tempFile);

      if (data?.status && data?.path) return conn.sendMessage(chatId, { text: `URL:\n${data.path}` }, { quoted: msg });
      throw new Error('Respons dari server tidak valid');
    } catch (err) {
      console.error('tourl:', err);
      conn.sendMessage(chatId, { text: `Terjadi kesalahan: ${err.message}` }, { quoted: msg });
    }
  }
};
