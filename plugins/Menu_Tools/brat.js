const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

module.exports = {
  name: 'bratsticker',
  command: ['brat', 'bratvid'],
  tags: 'Tools Menu',
  desc: 'Membuat stiker brat',
  prefix: true,

  run: async (conn, message, { chatInfo, textMessage, prefix, commandText, args }) => {
    const { chatId } = chatInfo;
    if (!args.length) {
      return conn.sendMessage(chatId, { text: `Masukkan teks untuk ${commandText === "bratvid" ? "Brat Video" : "Brat Sticker"}!` }, { quoted: message });
    }

    const isVideo = commandText === "bratvid";
    let inputPath;
    let outputPath;
    let framePaths = [];

    try {
      await conn.sendMessage(chatId, { text: `Sedang memproses ${isVideo ? "video" : "stiker"}, mohon tunggu...` }, { quoted: message });

      const tempDir = path.join(__dirname, "../../temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      if (isVideo) {
        const words = args.join(" ").split(/\s+/);
        const phrases = [];
        for (let i = 1; i <= words.length; i++) {
          phrases.push(words.slice(0, i).join(" "));
        }

        for (let i = 0; i < phrases.length; i++) {
          const phrase = phrases[i];
          const response = await axios.get(`https://nirkyy-dev.hf.space/api/v1/brat?text=${encodeURIComponent(phrase)}`, {
            responseType: "arraybuffer",
            headers: {
              "User-Agent": "Mozilla/5.0",
              "Accept": "image/png"
            },
            timeout: 30000
          });
          if (!response.data || response.data.length === 0) {
            throw new Error("Gagal mengambil gambar dari API NirKyy Dev");
          }
          const framePath = path.join(tempDir, `brat_frame_${i}.png`);
          fs.writeFileSync(framePath, response.data);
          framePaths.push(framePath);
        }

        outputPath = path.join(tempDir, `brat_output_${Date.now()}.webp`);
        const ffmpegCmd = `ffmpeg -framerate 1/0.5 -i "${path.join(tempDir, "brat_frame_%d.png")}" -vf "scale=512:512:force_original_aspect_ratio=decrease" -c:v libwebp -loop 0 -lossless 0 -q:v 80 -preset default -an -y "${outputPath}"`;
        //Ubah kecepatan di -framerate 1/0.3 ini berarti 300milidetik 
        await new Promise((resolve, reject) => {
          exec(ffmpegCmd, (error, stdout, stderr) => {
            if (error) {
              reject(new Error(stderr || error.message));
              return;
            }
            resolve();
          });
        });

        if (!fs.existsSync(outputPath)) {
          throw new Error("File output tidak ditemukan setelah konversi");
        }

        const stickerBuffer = fs.readFileSync(outputPath);
        const MAX_SIZE = 500 * 1024;
        if (stickerBuffer.length > MAX_SIZE) {
          throw new Error(`Ukuran sticker terlalu besar (${Math.round(stickerBuffer.length / 1024)}KB). Maksimal: ${MAX_SIZE / 1024}KB`);
        }

        await conn.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: message });
      } else {
        const apiUrl = "https://nirkyy-dev.hf.space/api/v1/brat";
        const queryUrl = `${apiUrl}?text=${encodeURIComponent(args.join(" "))}`;

        inputPath = path.join(tempDir, `brat_input_${Date.now()}.png`);
        outputPath = path.join(tempDir, `brat_output_${Date.now()}.webp`);

        const response = await axios.get(queryUrl, {
          responseType: "arraybuffer",
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "image/png"
          },
          timeout: 30000
        });

        if (!response.data || response.data.length === 0) {
          return conn.sendMessage(chatId, { text: `Gagal mengambil Brat Sticker. Data kosong.` }, { quoted: message });
        }

        fs.writeFileSync(inputPath, response.data);

        const ffmpegCmd = `ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease" -c:v libwebp -lossless 0 -q:v 80 -y "${outputPath}"`;

        await new Promise((resolve, reject) => {
          exec(ffmpegCmd, (error, stdout, stderr) => {
            if (error) {
              reject(new Error(stderr || error.message));
              return;
            }
            resolve();
          });
        });

        if (!fs.existsSync(outputPath)) {
          throw new Error("File output tidak ditemukan setelah konversi");
        }

        const stickerBuffer = fs.readFileSync(outputPath);
        const MAX_SIZE = 100 * 1024;
        if (stickerBuffer.length > MAX_SIZE) {
          throw new Error(`Ukuran sticker terlalu besar (${Math.round(stickerBuffer.length / 1024)}KB). Maksimal: ${MAX_SIZE / 1024}KB`);
        }

        await conn.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: message });
      }
    } catch (error) {
      await conn.sendMessage(chatId, { text: `❌ Gagal membuat sticker:\n${error.message || "Terjadi kesalahan internal"}` }, { quoted: message });
    } finally {
      try {
        if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (outputPath && fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        for (const fp of framePaths) {
          if (fs.existsSync(fp)) fs.unlinkSync(fp);
        }
      } catch (cleanError) {
        console.error("Error membersihkan file sementara:", cleanError);
      }
    }
  }
};
