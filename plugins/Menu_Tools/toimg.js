const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { mediaMessage } = require("../../toolkit/exif");

module.exports = {
  name: 'toimg',
  command: ['toimg'],
  tags: 'Tools Menu',
  desc: 'Mengonversi stiker menjadi gambar',
  prefix: true,
  isPremium: true,

  run: async (conn, message, { chatInfo }) => {
    const { chatId } = chatInfo;
    if (!(await isPrem(module.exports, conn, message))) return;

    try {
      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const sticker = quotedMessage?.stickerMessage || message.message?.stickerMessage;

      if (!sticker) {
        return conn.sendMessage(chatId, { text: "⚠️ Balas stiker atau kirim stiker dengan caption *toimg* untuk mengonversi!" }, { quoted: message });
      }

      if (sticker.isAnimated) {
        return conn.sendMessage(chatId, { text: "❌ Stiker animasi tidak bisa dikonversi menjadi gambar." }, { quoted: message });
      }

      const tempDir = path.join(__dirname, "../../temp/");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      const baseName = `${Date.now()}`;
      const webpPath = await mediaMessage(
        { message: quotedMessage || message.message },
        path.join(tempDir, baseName)
      );

      const outputPath = `${webpPath}.png`;

      exec(`ffmpeg -i "${webpPath}" "${outputPath}"`, async (err) => {
        fs.unlinkSync(webpPath);
        if (err || !fs.existsSync(outputPath)) {
          return conn.sendMessage(chatId, { text: `❌ Konversi gagal: ${err?.message || 'Tidak diketahui'}` }, { quoted: message });
        }

        const buffer = fs.readFileSync(outputPath);
        await conn.sendMessage(chatId, { image: buffer, caption: "🎉 Berhasil dikonversi!" }, { quoted: message });
        fs.unlinkSync(outputPath);
      });

    } catch (error) {
      console.error("[ERROR] toimg:", error);
      return conn.sendMessage(chatId, { text: `❌ Gagal mengonversi: ${error.message}` }, { quoted: message });
    }
  }
};