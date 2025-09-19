import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
  name: 'img2img',
  command: ['i2i', 'img2img'],
  tags: 'Tools Menu',
  desc: 'Ubah gambar dengan prompt menggunakan img2img API',
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo;
    const prompt = args.join(" ");
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const isImage = quoted?.imageMessage || msg.message?.imageMessage;

    if (!isImage) {
      return conn.sendMessage(chatId, { text: 'Balas atau kirim gambar dengan caption i2i' }, { quoted: msg });
    }
    if (!prompt) {
      return conn.sendMessage(chatId, { text: 'Harap tulis prompt!\nContoh: .i2i ubah kulitnya jadi hitam' }, { quoted: msg });
    }

    let media;
    try {
      media = await downloadMediaMessage({ message: quoted || msg.message }, 'buffer');
      if (!media) throw new Error('Media tidak terunduh');
    } catch (e) {
      return conn.sendMessage(chatId, { text: `Gagal mengunduh gambar: ${e.message}` }, { quoted: msg });
    }

    try {
      const res = await fetch(`${termaiWeb}/api/img2img/edit?key=${termaiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, image: media })
      });

      if (!res.ok) throw new Error(`API Error: ${res.statusText} (${res.status})`);

      const arrayBuffer = await res.arrayBuffer();
      const imgBuffer = Buffer.from(arrayBuffer);

      await conn.sendMessage(chatId, { image: imgBuffer, caption: `Hasil edit untuk prompt: ${prompt}` }, { quoted: msg });
    } catch (e) {
      await conn.sendMessage(chatId, { text: `Terjadi kesalahan saat memproses gambar: ${e.message}` }, { quoted: msg });
    }
  }
};