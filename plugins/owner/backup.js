import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

export default {
  name: "backup",
  command: ["backup"],
  tags: "Owner Menu",
  desc: "Backup data bot",
  prefix: true,
  owner: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    const botName = global.botName.replace(/\s+/g, "_");
    const vers = global.version.replace(/\s+/g, ".");
    const zipName = `${botName}-${vers}(${time}).zip`;

    const tempFolder = path.join(global.__dirname, "../../temp");
    if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder, { recursive: true });

    const zipPath = path.join(tempFolder, zipName);

    try {
      const zip = new AdmZip();
      const files = [
        "plugins",
        "toolkit",
        "package.json",
        "index.js",
        "main.js",
        "README.md",
        "LICENSE"
      ];

      for (const item of files) {
        const fullPath = path.join(global.__dirname, "../", item);
        console.log(fullPath)
        if (fs.existsSync(fullPath)) {
          const isDir = fs.lstatSync(fullPath).isDirectory();
          isDir ? zip.addLocalFolder(fullPath, item) : zip.addLocalFile(fullPath);
        }
      }

      zip.writeZip(zipPath);

      await conn.sendMessage(
        chatId,
        {
          document: fs.readFileSync(zipPath),
          mimetype: "application/zip",
          fileName: zipName,
          caption: `Backup berhasil dibuat.\nNama file: ${zipName}`
        },
        msg && msg.key ? { quoted: msg } : {}
      );

      setTimeout(() => {
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
      }, 5000);
    } catch (err) {
      console.error("Backup Error:", err);
      conn.sendMessage(chatId, { text: "Gagal membuat backup." }, { quoted: msg });
    }
  }
};