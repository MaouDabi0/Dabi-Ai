import fs from 'fs'
import path from 'path'
const catatanPath = path.join(dirname, './db/catatan.json')

export default {
  name: 'editcatat',
  command: ['catat'],
  tags: 'Tools Menu',
  desc: 'Menambahkan isi ke dalam nama catatan',
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
      const catatan = fs.existsSync(catatanPath) ? JSON.parse(fs.readFileSync(catatanPath)) : {},
            nama = args.shift(),
            isiCatatan = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                         msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                         args.join(' ') || null

      if (!nama || !catatan[nama]) 
        return !nama
          ? conn.sendMessage(chatId, { text: `Contoh: ${prefix}catat NamaCatatan TeksCatatan` }, { quoted: msg })
          : conn.sendMessage(chatId, { text: `Catatan *${nama}* tidak ditemukan.` }, { quoted: msg })

      if (!isiCatatan) 
        return conn.sendMessage(chatId, { text: 'Teks catatan tidak boleh kosong.' }, { quoted: msg })
      catatan[nama][`catatan${Object.keys(catatan[nama]).length + 1}`] = isiCatatan
      fs.writeFileSync(catatanPath, JSON.stringify(catatan, null, 2))
      conn.sendMessage(chatId, { text: `Berhasil menambahkan isi ke *${nama}*.` }, { quoted: msg })
    } catch (err) {
      console.error('Error:', err),
      conn.sendMessage(chatId, { text: `Error: ${err}` }, { quoted: msg })
    }
  }
}