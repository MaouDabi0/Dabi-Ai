import fs from 'fs'
import path from 'path'

const configPath = path.join(dirname, './set/config.json')

export default {
  name: 'addowner',
  command: ['addowner', 'adow'],
  tags: 'Owner Menu',
  desc: 'Menambah owner bot',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo,
          rawInput = args.join(' '),
          send = txt => conn.sendMessage(chatId, { text: txt }, { quoted: msg })
    let config

    try { config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) }
    catch (err) { console.error('Gagal membaca config:', err); return send('Gagal membaca config.json') }

    if (!rawInput) return send('Masukkan nomor yang akan dijadikan owner')

    const number = await normalizeNumber(rawInput)
    if (config.ownerSetting.ownerNumber.includes(number)) return send('Nomor sudah terdaftar')

    config.ownerSetting.ownerNumber.push(number)
    try { 
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
      send(`Nomor ${number} sudah ditambahkan sebagai owner`) 
    } catch (err) { 
      console.error('Gagal menyimpan config:', err)
      send('Gagal menyimpan perubahan ke config.json') 
    }
  }
}