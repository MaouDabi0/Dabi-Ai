export default {
  name: 'Cek kekuatan',
  command: ['cekkekuatan', 'cekkuat'],
  tags: 'Fun Menu',
  desc: 'Mengecek seberapa kuat orang',
  prefix: !0,
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
      const { cekkekuatan } = await global.loadFunctions(),
            { chatId, senderId, isGroup } = chatInfo,
            targetId = target(msg, senderId),
            mentionTarget = targetId,
            cek = cekkekuatan[Math.floor(Math.random() * cekkekuatan.length)],
            teks = `Nama: @${mentionTarget}\nKekuatan: ${cek}`

      await conn.sendMessage(chatId, { text: teks, mentions: [`${targetId}@s.whatsapp.net`] }, { quoted: msg })
    } catch (err) {
      console.error('error pada cekkekuatan:', err),
      conn.sendMessage(msg.key.remoteJid, { text: `Error: ${err.message || err}` }, { quoted: msg })
    }
  }
}