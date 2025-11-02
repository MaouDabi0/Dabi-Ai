import fs from 'fs';
import path from 'path';

const sesi = path.join(dirname, '../temp/AiSesion.json')

export default {
  name: 'resetai',
  command: ['resetai', 'resetaichat'],
  tags: 'Ai Menu',
  desc: 'mereset sesi ai',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    args,
    prefix,
    commandText,
    chatInfo
  }) => {
    const { senderId, chatId } = chatInfo
    try {
      const sessi = JSON.parse(fs.readFileSync(sesi, 'utf-8')),
            filterSys = (arr) => {
              return arr.filter(item => item.role === 'system' && item.content.trim() !== '')
            };

      if (
        (commandText === 'resetai' && args[0] === 'all') ||
        commandText === 'resetaichat'
      ) {
        if (commandText === 'resetai' && args[0] === 'all') {
          for (const key in sessi) {
            sessi[key] = filterSys(sessi[key])
          }
          fs.writeFileSync(sesi, JSON.stringify(sessi, null, 2))
          return conn.sendMessage(chatId, { text: 'semua sesi pengguna berhasil di reset' }, { quoted: msg })
        }

        if (!sessi[senderId]) {
          return conn.sendMessage(chatId, { text: 'tidak ada sesi yang ditemukan' }, { quoted: msg })
        }

        sessi[senderId] = filterSys(sessi[senderId])
        fs.writeFileSync(sesi, JSON.stringify(sessi, null, 2))
        return conn.sendMessage(chatId, { text: 'sesi kamu berhasil di reset' }, { quoted: msg })
      }

      return conn.sendMessage(chatId, { text: `gunakan format:\n${btn} ${prefix}resetaichat\n${btn} ${prefix}resetai all` }, { quoted: msg })
    } catch (e) {
      conn.sendMessage(chatId, { text: `error pada reset ai: ${e}`})
    }
  }
}