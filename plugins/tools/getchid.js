export default {
  name: 'getchid',
  command: ['getchid', 'getchannelid', 'getsaluranid', 'getidsaluran'],
  tags: 'Tools Menu',
  desc: 'Ambil ID Saluran',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    store
  }) => {
    const { chatId } = chatInfo,
          quoted = msg?.message?.extendedTextMessage?.contextInfo

    if (!quoted?.stanzaId)
      return conn.sendMessage(chatId, { text: 'Balas pesan yang diteruskan dari saluran untuk mengambil ID-nya.' }, { quoted: msg })

    try {
      const quotedMsg = await store.loadMessage(chatId, quoted.stanzaId)
      if (!quotedMsg)
        return conn.sendMessage(chatId, { text: 'Gagal mengambil pesan. Pastikan pesan yang dibalas baru saja diterima.' }, { quoted: msg })

      const info = quotedMsg?.message?.[quotedMsg.message?.extendedTextMessage ? 'extendedTextMessage' : 'conversation']?.contextInfo?.forwardedNewsletterMessageInfo

      if (!info?.newsletterJid)
        return conn.sendMessage(chatId, { text: 'Tidak ditemukan informasi saluran. Pastikan pesan benar-benar berasal dari saluran (channel).' }, { quoted: msg })

      const teks = `ID Saluran & Pesan:\nID Saluran: ${info.newsletterJid}\nID Pesan: ${info.serverMessageId}`
      await conn.sendMessage(chatId, { text: teks }, { quoted: msg })
    } catch (err) {
      console.error('[GetCHID]', err),
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mengambil ID saluran.\n' + err.message }, { quoted: msg })
    }
  }
}