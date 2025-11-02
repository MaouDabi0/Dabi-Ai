export default {
  name: 'Tanya jawab',
  command: ['apakah','Apakah','Bukan kah','Bukankah','Benarkah','Benar kah','bukan kah','bukankah','benarkah','benar kah'],
  tags: 'Fun Menu',
  desc: 'Bertanya kepada bot',
  prefix: !1,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { ask } = await global.loadFunctions(),
            { chatId, senderId, isGroup } = chatInfo,
            tanya = ask[Math.floor(Math.random() * ask.length)]

      await conn.sendMessage(chatId, { text: tanya }, { quoted: msg })
    } catch (error) {
      console.error('Error:', error)
      await conn.sendMessage(msg.key.remoteJid, { text: `Error: ${error.message || error}`, quoted: msg })
    }
  }
}