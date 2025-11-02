import fs from 'fs'
import path from 'path'

const configPath = path.join(dirname, './set/config.json')

export default {
  name: 'listowner',
  command: ['listowner', 'lsow'],
  tags: 'Info Menu',
  desc: 'Melihat daftar owner',
  prefix: !0,
  owner: !0,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo
    let config
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    } catch {
      return conn.sendMessage(chatId, { text: 'Gagal membaca config.json' }, { quoted: msg })
    }

    const owners = config.ownerSetting?.ownerNumber || []
    if (!owners.length) return conn.sendMessage(chatId, { text: 'Tidak ada owner yang terdaftar' }, { quoted: msg })

    let listText = `${head} ${Obrack} *DAFTAR OWNER* ${Cbrack}\n`
    owners.forEach((num, i) => listText += `${body} ${btn} ${i + 1}. ${num}\n`)
    listText += `${foot}${garis}\n`

    conn.sendMessage(chatId, { text: listText }, { quoted: msg })
  }
}