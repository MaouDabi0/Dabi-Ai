export default {
  name: 'CekKhodam',
  command: ['cekkodam', 'cekkhodam'],
  tags: 'Fun Menu',
  desc: 'Cek kodam pengguna',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    try {
      const { cekKhodam } = await global.loadFunctions(),
            { chatId, senderId } = chatInfo,
            targetId = target(msg, senderId),
            mentionTarget = targetId,
            cek = cekKhodam[Math.floor(Math.random() * cekKhodam.length)],
            delay = ms => new Promise(r => setTimeout(r, ms)),
            teksAwal = `Bentar tak terawang dulu...`,
            teksAkhir = `_Pengecekan Khodam untuk @${mentionTarget} telah selesai!_\n\nHasil terawangan menunjukkan bahwa Khodam yang mendampingi @${mentionTarget} adalah *${cek}*`,
            { key } = await conn.sendMessage(chatId, { text: teksAwal, mentions: [`${targetId}@s.whatsapp.net`] }, { quoted: msg })

      await delay(3e3),
      await conn.sendMessage(chatId, { 
        edit: key, 
        text: teksAkhir, 
        mentions: [`${targetId}@s.whatsapp.net`] 
      })
    } catch (err) {
      console.error('Error cekKhodam:', err),
      conn.sendMessage(chatInfo.chatId, { text: `Error cekKhodam: ${err.message || err}` }, { quoted: msg })
    }
  }
}