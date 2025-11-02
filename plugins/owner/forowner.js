import fs from 'fs'
import path from 'path'

const configPath = path.join(dirname, './set/config.json'),
      saveConfig = cfg => (fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2)), config = cfg, global.setting = cfg)
let config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

export default {
  name: 'forowner',
  command: ['forowner', 'forners'],
  tags: 'Owner Menu',
  desc: 'Atur sambutan untuk Owner',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo,
          cmd = `${prefix}${commandText}`,
          input = args[0],
          send = txt => conn.sendMessage(chatId, { text: txt }, { quoted: msg })

    switch (input) {
      case 'on': case 'off':
        config.ownerSetting.forOwner = input === 'on'
        saveConfig(config)
        return send(`Sambutan Owner ${input === 'on' ? 'diaktifkan' : 'dimatikan'}.`)

      case 'set': {
        const teks = textMessage.slice((cmd + ' set').length).trim()
        if (!teks) return send(`Gunakan: ${cmd} set <teks>`)
        config.msg.rejectMsg.forOwnerText = teks
        saveConfig(config)
        return send(`Teks sambutan disimpan:\n\n${teks}`)
      }

      case 'reset':
        config.msg.rejectMsg.forOwnerText = ''
        saveConfig(config)
        return send('Teks sambutan dikosongkan.')

      default:
        return send([
          `Penggunaan:`,
          `${cmd} on     → Aktifkan`,
          `${cmd} off    → Nonaktifkan`,
          `${cmd} set <teks> → Atur teks`,
          `${cmd} reset  → Kosongkan teks`,
        ].join('\n'))
    }
  }
}