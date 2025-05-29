const remini = require('../../toolkit/scrape/remini');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'remini',
  command: ['remini'],
  tags: 'Tools Menu',
  desc: 'Meningkatkan kualitas gambar',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const quotedImage = quotedMsg?.imageMessage;
      const directImage = message.message?.imageMessage;

      const imageSource = quotedImage || directImage;

      if (!imageSource) {
        return conn.sendMessage(
          chatId,
          {
            text: `Kirim atau balas gambar dengan caption *${prefix}${commandText} [mode]*\n\nMode tersedia:\n- enhance\n- recolor\n- dehaze`
          },
          { quoted: message }
        );
      }

      let media;
      try {
        media = await downloadMediaMessage(
          { message: quotedImage ? quotedMsg : message.message },
          'buffer',
          {}
        );
        if (!media) throw new Error('Media tidak terunduh!');
      } catch (error) {
        return conn.sendMessage(
          chatId,
          { text: `❌ Gagal mengunduh media! ${error.message}` },
          { quoted: message }
        );
      }

      await conn.sendMessage(chatId, { react: { text: '🕒', key: message.key } });

      const mode = (args[0] || 'enhance').toLowerCase();
      let result;
      try {
        result = await remini(media, mode);
        if (!result) throw new Error('Gagal memproses gambar.');
      } catch (error) {
        return conn.sendMessage(
          chatId,
          { text: `❌ Gagal memproses gambar! ${error.message}` },
          { quoted: message }
        );
      }

      await conn.sendMessage(
        chatId,
        {
          image: result,
          caption: `Berhasil! Mode: *${mode}*`
        },
        { quoted: message }
      );
    } catch (error) {
      conn.sendMessage(
        chatInfo.chatId,
        { text: `❌ Terjadi kesalahan saat memproses gambar, coba lagi! ${error.message}` },
        { quoted: message }
      );
      console.error('❌ Error pada plugin remini:', error);
    }
  }
};