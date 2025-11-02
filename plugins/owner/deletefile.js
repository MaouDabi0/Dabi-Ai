import fs from 'fs'
import path from 'path'

export default {
  name: 'deletefile',
  command: ['deletefile', 'df'],
  tags: 'Owner Menu',
  desc: 'Menghapus file/folder',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo,
          baseDir = path.resolve('./'),
          filePath = path.resolve(baseDir, args.join(' '))

    if (!args[0] || !filePath.startsWith(baseDir) || !fs.existsSync(filePath)) {
      return conn.sendMessage(chatId, {
        text: !args[0] 
          ? 'Masukkan nama file!' 
          : !filePath.startsWith(baseDir) 
            ? 'Akses file di luar BaseBot tidak diizinkan!' 
            : 'File tidak ditemukan!'
      }, { quoted: msg });
    }

    let statusMsg
    try {
      statusMsg = (await conn.sendMessage(chatId, { text: 'Menghapus file...' }, { quoted: msg })).key
      fs.lstatSync(filePath).isDirectory()
        ? fs.rmSync(filePath, { recursive: !0, force: !0 })
        : fs.unlinkSync(filePath)

      if (filePath.endsWith('.js') && global.plugins) {
        const pluginName = path.basename(filePath, '.js')
        for (const n in global.plugins) {
          const p = global.plugins[n]
          p?.name === pluginName || p?.__filename === filePath ? delete global.plugins[n] : null
        }
      }

      await conn.sendMessage(chatId, { text: `File ${args.join(' ')} berhasil dihapus`, edit: statusMsg }, { quoted: msg })
    } catch (e) {
      console.error(e)
      const errMsg = { text: 'Terjadi kesalahan saat menghapus file' }
      await conn.sendMessage(chatId, statusMsg ? { ...errMsg, edit: statusMsg } : { ...errMsg, quoted: msg })
    }
  }
}