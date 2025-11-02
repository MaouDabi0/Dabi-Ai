import fs from 'fs'
import path from 'path'

export default {
  name: 'autotyping',
  command: ['autotyping', 'at'],
  tags: 'Owner Menu',
  desc: 'Mengatur autotyping bot',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo,
          configPath = path.resolve('./toolkit/set/config.json')
    let config

    try { config = JSON.parse(fs.readFileSync(configPath)) } 
    catch { return conn.sendMessage(chatId, { text: 'Gagal membaca konfigurasi bot.' }, { quoted: msg }) }

    !args[0]
      ? conn.sendMessage(chatId, { text: `Status Auto Typing: ${config.botSetting.autoTyping ? 'Aktif' : 'Nonaktif'}\n\nGunakan:\n${prefix}${commandText} on/off` }, { quoted: msg })
      : (() => {
          const state = args[0].toLowerCase()
          !['on', 'off'].includes(state)
            ? conn.sendMessage(chatId, { text: 'Gunakan on atau off' }, { quoted: msg })
            : (() => {
                config.botSetting.autoTyping = state === 'on'
                try { fs.writeFileSync(configPath, JSON.stringify(config, null, 2)) } 
                catch { return conn.sendMessage(chatId, { text: 'Gagal menyimpan konfigurasi.' }, { quoted: msg }) }
                global.autoTyping = config.botSetting.autoTyping
                conn.sendMessage(chatId, { text: `Auto Typing telah ${state === 'on' ? 'diaktifkan' : 'dinonaktifkan'}.` }, { quoted: msg })
              })()
        })()
  }
}