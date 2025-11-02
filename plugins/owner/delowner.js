import fs from 'fs'
import path from 'path'
const configPath = path.join(dirname, './set/config.json')

export default {
  name: 'delowner',
  command: ['delowner', 'rmow'],
  tags: 'Owner Menu',
  desc: 'Menghapus nomor owner dari daftar owner',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo
    let config
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    } catch (err) {
      console.error('Gagal membaca config:', err)
      return conn.sendMessage(chatId, { text: 'Gagal membaca config.json' }, { quoted: msg })
    }

    const rawInput = args.join(' ')
    if (!rawInput) return conn.sendMessage(chatId, { text: 'Masukkan nomor owner yang ingin dihapus' }, { quoted: msg })

    const number = await normalizeNumber(rawInput),
          index = config.ownerSetting.ownerNumber.indexOf(number)

    return index === -1
      ? conn.sendMessage(chatId, { text: 'Nomor tidak ditemukan dalam daftar owner' }, { quoted: msg })
      : (config.ownerSetting.ownerNumber.splice(index, 1),
         (() => {
           try {
             const fd = fs.openSync(configPath, 'w')
             fs.writeFileSync(fd, JSON.stringify(config, null, 2), 'utf-8')
             fs.fsyncSync(fd)
             fs.closeSync(fd)
             conn.sendMessage(chatId, { text: `Nomor ${number} telah dihapus dari daftar owner` }, { quoted: msg })
           } catch (err) {
             console.error('Gagal menyimpan config:', err)
             conn.sendMessage(chatId, { text: 'Gagal menyimpan perubahan ke config.json' }, { quoted: msg })
           }
         })()
        )
  }
}