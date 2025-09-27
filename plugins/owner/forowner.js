import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const configPath = path.join(__dirname, '../../toolkit/set/config.json')

let config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

const saveConfig = (cfg) => {
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2))
  config = cfg
  global.setting = cfg
}

export default {
  name: 'forowner',
  command: ['forowner', 'forners'],
  tags: 'Owner Menu',
  desc: 'Atur sambutan untuk Owner',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo
    const cmd = `${prefix}${commandText}`
    const input = args[0]

    switch (input) {
      case 'on':
      case 'off':
        config.ownerSetting.forOwner = input === 'on'
        saveConfig(config)
        return conn.sendMessage(chatId, { text: `Sambutan Owner ${input === 'on' ? 'diaktifkan' : 'dimatikan'}.` }, { quoted: msg })

      case 'set': {
        const teks = textMessage.slice((cmd + ' set').length).trim()
        if (!teks) return conn.sendMessage(chatId, { text: `Gunakan: ${cmd} set <teks>` }, { quoted: msg })
        config.msg.rejectMsg.forOwnerText = teks
        saveConfig(config)
        return conn.sendMessage(chatId, { text: `Teks sambutan disimpan:\n\n${teks}` }, { quoted: msg })
      }

      case 'reset':
        config.msg.rejectMsg.forOwnerText = ''
        saveConfig(config)
        return conn.sendMessage(chatId, { text: 'Teks sambutan dikosongkan.' }, { quoted: msg })

      default:
        return conn.sendMessage(chatId, {
          text: [
            `Penggunaan:`,
            `${cmd} on     → Aktifkan`,
            `${cmd} off    → Nonaktifkan`,
            `${cmd} set <teks> → Atur teks`,
            `${cmd} reset  → Kosongkan teks`,
          ].join('\n'),
        }, { quoted: msg })
    }
  },
}