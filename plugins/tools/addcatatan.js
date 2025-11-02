import fs from "fs";
import path from "path";

const catatanPath = path.join(dirname, "./db/catatan.json");

export default {
  name: "addcatat",
  command: ["addcatat", "addcatatan"],
  tags: "Tools Menu",
  desc: "Tambah nama catatan",
  prefix: !0,
  owner: !0,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    args
  }) => {
    const { chatId } = chatInfo;

    try {
      if (!fs.existsSync(catatanPath)) fs.writeFileSync(catatanPath, "{}");

      const catatan = JSON.parse(fs.readFileSync(catatanPath)),
            nama = args[0];

      if (!nama || catatan[nama]) 
        return conn.sendMessage(chatId, { 
          text: !nama 
            ? `Contoh: ${prefix}addcatat NamaCatatan` 
            : `Catatan *${nama}* sudah ada.` 
        }, { quoted: msg });

      catatan[nama] = {};
      fs.writeFileSync(catatanPath, JSON.stringify(catatan, null, 2));
      return conn.sendMessage(chatId, { text: `Berhasil membuat catatan *${nama}*.` }, { quoted: msg });

    } catch (err) {
      console.error("Error addcatat:", err);
      return conn.sendMessage(chatId, { text: `Error: ${err.message}` }, { quoted: msg });
    }
  }
};