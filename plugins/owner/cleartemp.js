import fs from 'fs'
import path from 'path'

export default {
  name: 'cleartemp',
  command: ['cleartemp', 'ctemp'],
  tags: 'Owner Menu',
  desc: 'Membersihkan folder temp',
  prefix: !0,
  owner: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo,
          tempDir = path.resolve('./temp')

    if (!fs.existsSync(tempDir)) return conn.sendMessage(chatId, { text: 'Folder temp tidak ditemukan.' }, { quoted: msg })

    try {
      const files = fs.readdirSync(tempDir)
      return !files.length
        ? conn.sendMessage(chatId, { text: 'Folder temp sudah bersih.' }, { quoted: msg })
        : (files.forEach(f => fs.rmSync(path.join(tempDir, f), { recursive: !0, force: !0 })),
           conn.sendMessage(chatId, { text: 'Semua file dalam folder temp berhasil dihapus.' }, { quoted: msg }))
    } catch {
      conn.sendMessage(chatId, { text: 'Gagal membersihkan folder temp.' }, { quoted: msg })
    }
  }
}