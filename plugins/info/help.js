import fs from 'fs'
import path from 'path'

export default {
  name: 'help',
  command: ['help', 'info'],
  tags: 'Info Menu',
  desc: 'Lihat info plugin',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo

    if (!args.length)
      return conn.sendMessage(chatId, { text: `Contoh:\n${prefix}${commandText} menu` }, { quoted: msg })

    const baseDir = path.join(dirname, '../plugins'),
          folders = fs.readdirSync(baseDir).filter(f => fs.lstatSync(path.join(baseDir, f)).isDirectory())

    let plugin = null,
        filename = ''

    for (const folder of folders) {
      const files = fs.readdirSync(path.join(baseDir, folder)).filter(f => f.endsWith('.js'))
      for (const file of files) {
        if (path.parse(file).name.toLowerCase() === args[0].toLowerCase()) {
          plugin = (await import(path.join(baseDir, folder, file))).default
          filename = file
          break
        }
      }
      if (plugin) break
    }

    if (!plugin)
      return conn.sendMessage(chatId, { text: `Plugin *${args[0]}* tidak ditemukan.` }, { quoted: msg })

    const { name, command, desc, owner = !1, prefix: usesPrefix = !1, premium = !1 } = plugin,
          cmdList = Array.isArray(command) ? command.map(c => `${prefix}${c}`).join(', ') : '-',
          text = `Plugin Info
• File: ${filename}
• Nama: ${name || '-'}
• Cmd: ${cmdList}
• Deskripsi: ${desc || '-'}
• Owner: ${owner}
• Prefix: ${usesPrefix}
• Premium: ${premium}`

    conn.sendMessage(chatId, { text }, { quoted: msg })
  }
}