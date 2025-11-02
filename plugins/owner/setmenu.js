import fs from 'fs'
import path from 'path'
import menuModule from '../menu/menu.js'

const { handlers } = menuModule,
      configPath = path.join(dirname, './set/config.json'),
      loadConfig = () => JSON.parse(fs.readFileSync(configPath, 'utf-8'))

export default {
  name: 'setmenu',
  command: ['setmenu'],
  tags: 'Owner Menu',
  desc: 'Ubah tampilan menu bot',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo,
          validModes = Object.keys(handlers),
          mode = args[0]

    if (!mode || !validModes.includes(mode))
      return conn.sendMessage(chatId, { text: `Gunakan: setmenu ${validModes.join(' atau ')}` }, { quoted: msg })

    try {
      const config = loadConfig()
      config.menuSetting.setMenu = parseInt(mode)
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
      await conn.sendMessage(chatId, { text: `Menu berhasil diubah ke mode ${loadConfig().menuSetting.setMenu}` }, { quoted: msg })
    } catch (err) {
      await conn.sendMessage(chatId, { text: `Gagal mengubah menu: ${err.message}` }, { quoted: msg })
    }
  }
}