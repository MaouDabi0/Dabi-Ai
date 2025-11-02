import fs from 'fs'
import path from 'path'
import AdmZip from "adm-zip";

const temp = path.join(dirname, '../temp')

export default {
  name: 'Backup',
  command: ['backup'],
  tags: 'Owner Menu',
  desc: 'backup sc',
  prefix: !0,
  owner: !0,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
  }) => {
    try {
      const name = global.botName.replace(/\s+/g, '_'),
            vers = global.version.replace(/\s+/g, '.'),
            time = Format.time(),
            zipName = `${name}-${vers}(${time}).zip`;

      if (!fs.existsSync(temp)) fs.mkdirSync(temp, { recursive: !0 })

      const p = path.join(temp, zipName),
            zip = new AdmZip(),
            file = [
              'plugins',
              'toolkit',
              'LICENSE',
              'README.md',
              'index.js',
              'main.js',
              'package.json'
            ]

      for (const item of file) {
        const full = path.join(dirname, '../', item)
        if (fs.existsSync(full)) {
          const dir = fs.lstatSync(full).isDirectory()
          dir ? zip.addLocalFolder(full, item) : zip.addLocalFile(full)
        }
      }

      zip.writeZip(p)

      conn.sendMessage(chatInfo.chatId, {
        document: fs.readFileSync(p),
          mimetype: "application/zip",
          fileName: zipName,
          caption: `Backup berhasil dibuat.\nNama file: ${zipName}`
      }, msg && msg.key ? { quoted: msg } : {})

      setTimeout(() => {
        if (fs.existsSync(p)) fs.unlinkSync(p)
      }, 5e3)
    } catch (e) {
      console.log('error pada backup', e)
    }
  }
}