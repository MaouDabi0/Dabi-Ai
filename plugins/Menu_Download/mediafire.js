const { meFire } = require('../../toolkit/scrape/mediafire.js');

module.exports = {
  name: 'MediaFire',
  command: ['md', 'mediafire'],
  tags: 'Download Menu',
  desc: 'Download file mediafire',
  prefix: true,
  isPremium: false,
  owner: false,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      if (!(await isPrem(module.exports, conn, message))) return;
      if (!(await isOwner(module.exports, conn, message))) return;

      if (!args[0]) {
        return conn.sendMessage(chatId, { 
          text: `Contoh penggunaan:\n${prefix + commandText} https://www.mediafire.com/file/xxxxx` 
        }, { quoted: message });
      }

      const mediafireUrl = args[0];
      const data = await meFire(mediafireUrl);

      const caption = `*MediaFire Downloader*\n*Nama:* ${data.name}\n*Ukuran:* ${data.size}\n*MIME:* ${data.mime}\nSedang mengirim file...`;

      await conn.sendMessage(chatId, { text: caption }, { quoted: message });

      await conn.sendMessage(chatId, {
        document: { url: data.url },
        fileName: data.name,
        mimetype: data.mime
      }, { quoted: message });

    } catch (error) {
      console.error(error);
      conn.sendMessage(message.key.remoteJid, { text: 'Terjadi kesalahan saat memproses permintaan. Coba lagi nanti!' }, { quoted: message });
    }
  }
}