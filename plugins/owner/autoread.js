import fs from 'fs'
import path from 'path'

export default {
  name: 'autoread',
  command: ['autoread', 'ad'],
  tags: 'Owner Menu',
  desc: 'Setting autoread gc/private',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    args
  }) => {
    const { chatId } = chatInfo,
          configPath = path.resolve('./toolkit/set/config.json')
    let config

    try { config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) } 
    catch { return conn.sendMessage(chatId, { text: 'Gagal membaca konfigurasi bot.' }, { quoted: msg }) }

    !args[0]
      ? conn.sendMessage(chatId, {
          text: `Status Auto Read:\n- Group: ${config.botSetting.autoread.group ? 'Aktif' : 'Nonaktif'}\n- Private: ${config.botSetting.autoread.private ? 'Aktif' : 'Nonaktif'}\n\nGunakan:\n${prefix}autoread group on/off\n${prefix}autoread private on/off`
        }, { quoted: msg })
      : (() => {
          const type = args[0].toLowerCase(),
                state = args[1]?.toLowerCase()
          !['group', 'private'].includes(type) || !['on', 'off'].includes(state)
            ? conn.sendMessage(chatId, { text: `Gunakan ${prefix}autoread group on/off atau ${prefix}autoread private on/off` }, { quoted: msg })
            : (() => {
                config.botSetting.autoread[type] = state === 'on'
                try {
                  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
                  global.readGroup = config.botSetting.autoread.group
                  global.readPrivate = config.botSetting.autoread.private
                  conn.sendMessage(chatId, { text: `Auto Read untuk ${type} telah ${state === 'on' ? 'diaktifkan' : 'dinonaktifkan'}!` }, { quoted: msg })
                } catch {
                  conn.sendMessage(chatId, { text: 'Gagal menyimpan konfigurasi.' }, { quoted: msg })
                }
              })()
        })()
  }
}