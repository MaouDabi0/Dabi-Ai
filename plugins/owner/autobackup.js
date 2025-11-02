import fs from "fs"
import path from "path"

export default {
  name: "autobackup",
  command: ["autobackup"],
  tags: "Owner Menu",
  desc: "Aktifkan atau matikan auto backup",
  prefix: !0,
  owner: !0,

  run: async (conn, msg = {}, {
    args,
    chatInfo
  } = {}) => {
    const configPath = path.join(dirname, "./set/config.json"),
          chatId = chatInfo?.chatId || msg.key?.remoteJid
    if (!args?.length) return

    const enabled = args[0].toLowerCase() === "on"

    try {
      const config = fs.existsSync(configPath) 
        ? JSON.parse(fs.readFileSync(configPath, "utf8")) 
        : {}
      config.botSetting = { ...(config.botSetting || {}), autoBackup: enabled }
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
      global.botSetting = { ...(global.botSetting || {}), autoBackup: enabled }
      global.autoBackup = enabled

      if (chatId) await conn.sendMessage(chatId, { text: `Auto Backup ${enabled ? "diaktifkan" : "dimatikan"}.` }, { quoted: msg })
    } catch (err) {
      console.log('error pada autobackup', err)
    }
  }
}