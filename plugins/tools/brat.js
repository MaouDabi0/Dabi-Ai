import axios from "axios";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { writeExifImg } from "../../toolkit/exif.js";

export default {
  name: "bratsticker",
  command: ["brat", "bart", "bratgenerator"],
  tags: "Tools Menu",
  desc: "Membuat sticker brat dari teks",
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args,
    commandText,
    prefix
  }) => {
    const { chatId, pushName } = chatInfo;
    if (!args.length) return conn.sendMessage(chatId, { text: `Contoh penggunaan: ${prefix}${commandText} halo aku dabi` }, { quoted: msg });

    const text = args.join(" "),
          apiUrl = `https://aqul-brat.hf.space/api/brat?text=${encodeURIComponent(text)}`,
          temp = path.resolve(dirname, "../temp"),
          input = path.join(temp, "brat_input.png"),
          output = path.join(temp, "brat_output.webp");

    try {
      const { data } = await axios.get(apiUrl, { responseType: "arraybuffer" });
      if (!data) return conn.sendMessage(chatId, { text: "Gagal mengambil gambar brat!" }, { quoted: msg });

      fs.writeFileSync(input, data);
      const cmd = `ffmpeg -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease" -c:v libwebp -lossless 1 "${output}"`;

      exec(cmd, async err => {
        if (err) return console.error("FFmpeg error:", err) || conn.sendMessage(chatId, { text: "Gagal mengkonversi ke sticker." }, { quoted: msg });

        try {
          const finalPath = await writeExifImg(fs.readFileSync(output), { packname: "Brat Sticker", author: `Ⓒ${pushName}` });
          await conn.sendMessage(chatId, { sticker: fs.readFileSync(finalPath) }, { quoted: msg });
          [input, output, finalPath].forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
        } catch (e) {
          console.error("Exif error:", e);
          conn.sendMessage(chatId, { text: "Gagal menambahkan metadata sticker." }, { quoted: msg });
        }
      });

    } catch (e) {
      console.error("Brat plugin error:", e);
      conn.sendMessage(chatId, { text: "Terjadi kesalahan saat memproses permintaan. Mungkin server brat sedang sibuk atau teks tidak valid." }, { quoted: msg });
    }
  }
};