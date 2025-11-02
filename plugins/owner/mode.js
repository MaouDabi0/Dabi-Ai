import fs from 'fs'
import path from 'path'

const configPath = path.join(dirname, './set/config.json')

export default {
  name: 'mode',
  command: ['mode'],
  tags: 'Owner Menu',
  desc: 'Ubah mode bot menjadi group/private/off',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    args,
    prefix,
    commandText
  }) => {
    const { chatId } = chatInfo,
          mode = args[0]?.toLowerCase(),
          validModes = ['group', 'private', 'off'],
          send = txt => conn.sendMessage(chatId, { text: txt }, { quoted: msg }),
          currMode = global.setting?.botSetting?.Mode || 'unknown'

    if (!validModes.includes(mode))
      return send(`Mode tidak valid!\n\nContoh:\n${prefix}${commandText} group\n${prefix}${commandText} private\n${prefix}${commandText} off\n\nMode saat ini: ${currMode}`)

    try {
      const config = JSON.parse(fs.readFileSync(configPath))
      config.botSetting = { ...config.botSetting, Mode: mode }
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
      if (global.setting?.botSetting) global.setting.botSetting.Mode = mode
      send(`Mode bot diubah menjadi ${mode}.`)
    } catch (err) {
      send(`Gagal mengubah mode bot: ${err.message}`)
    }
  }
}