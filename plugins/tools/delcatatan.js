import fs from 'fs'
import path from 'path'
const catatanPath = path.join(dirname, './db/catatan.json')

export default {
  name: 'delcatat',
  command: ['delcatat'],
  tags: 'Tools Menu',
  desc: 'Hapus nama catatan',
  prefix: !0,
  owner: !0,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    args
  }) => {
    const { chatId } = chatInfo
    try {
      !fs.existsSync(catatanPath) && fs.writeFileSync(catatanPath, '{}')
      const catatan = JSON.parse(fs.readFileSync(catatanPath)),
            nama = args[0]
      if (!nama || !catatan[nama]) 
        return !nama
          ? conn.sendMessage(chatId, { text: `Contoh: ${prefix}delcatat NamaCatatan` }, { quoted: msg })
          : conn.sendMessage(chatId, { text: `Catatan *${nama}* tidak ditemukan.` }, { quoted: msg })
      delete catatan[nama]
      fs.writeFileSync(catatanPath, JSON.stringify(catatan, null, 2))
      conn.sendMessage(chatId, { text: `Berhasil menghapus catatan *${nama}*.` }, { quoted: msg })
    } catch (err) {
      console.error('Error:', err),
      conn.sendMessage(chatId, { text: `Error: ${err}` }, { quoted: msg })
    }
  }
}