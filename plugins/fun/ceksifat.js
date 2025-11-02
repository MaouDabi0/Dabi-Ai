export default {
  name: 'ceksifat',
  command: ['ceksifat'],
  tags: 'Fun Menu',
  desc: 'Menebak sifat seseorang',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    try {
      const { sifatlist } = await global.loadFunctions(),
            { chatId, senderId } = chatInfo,
            targetId = target(msg, senderId),
            mentionTarget = targetId,
            sifat = sifatlist[Math.floor(Math.random() * sifatlist.length)],
            teks = `Nama: @${mentionTarget}\nSifat: ${sifat}`

      await conn.sendMessage(chatId, { text: teks, mentions: [`${targetId}@s.whatsapp.net`] }, { quoted: msg })
    } catch (err) {
      console.error('Error:', err),
      conn.sendMessage(msg.key.remoteJid, { text: `Error: ${err.message || err}` }, { quoted: msg })
    }
  }
}