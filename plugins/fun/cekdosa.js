export default {
  name: 'Cek Dosa',
  command: ['cekdosa', 'cek dosa'],
  tags: 'Fun Menu',
  desc: 'Mengecek 10 dosa besar user',
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
      const { cekDosa } = await global.loadFunctions(),
            { chatId, senderId } = chatInfo,
            targetId = target(msg, senderId),
            tagJid = `${targetId}@s.whatsapp.net`,
            dosaUnik = [...cekDosa].sort(() => Math.random() - .5).slice(0, 10)

      let teks = `Top 10 dosa besar @${targetId}\n`
      dosaUnik.forEach((d, i) => teks += `${i + 1}. ${d}\n`)

      await conn.sendMessage(chatId, { text: teks.trim(), mentions: [tagJid] }, { quoted: msg })
    } catch (e) {
      console.error('Error:', e)
      conn.sendMessage(msg.key.remoteJid, { text: `Error: ${e.message || e}` }, { quoted: msg })
    }
  }
}