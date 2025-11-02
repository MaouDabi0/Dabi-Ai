import fs from 'fs'

const configPath = './toolkit/set/config.json',
      aiSessionPath = './session/AiSesion.json',
      getConfig = () => JSON.parse(fs.readFileSync(configPath, 'utf8'))

export default {
  name: 'setlogic',
  command: ['setlogic', 'set'],
  tags: 'Ai Menu',
  desc: 'Menyetel/menseting logika AI',
  prefix: !0,
  owner: !0,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo,
          config = getConfig(),
          botName = config.botSetting.botName || 'Bot',
          currentLogic = config.botSetting.logic || 'Belum disetel.'

    if (!args.length) return conn.sendMessage(chatId, {
      text: `⚙️ Gunakan perintah:\n${prefix + commandText} [teks logika]\n\n📌 Contoh:\n${prefix + commandText} Ini adalah logika baru.\n\n*Logika saat ini [ ${botName} ]:*\n${currentLogic}`
    }, { quoted: msg })

    const newLogic = args.join(' ')
    try {
      config.botSetting.logic = newLogic,
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2)),
      fs.existsSync(aiSessionPath) && fs.writeFileSync(aiSessionPath, JSON.stringify({})),
      conn.sendMessage(chatId, { text: `Logika AI berhasil diubah menjadi:\n\n"${newLogic}"` }, { quoted: msg })
    } catch {
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat menyimpan pengaturan!' }, { quoted: msg })
    }
  }
}