export default {
  name: 'intro',
  command: ['intro'],
  tags: 'Group Menu',
  desc: 'Mengirimkan intro grup',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    try {
      const { chatId, isGroup } = chatInfo
      if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya dapat digunakan di grup.' }, { quoted: msg })
      if (!enWelcome(chatId)) return conn.sendMessage(chatId, { text: 'Grup ini tidak terdaftar atau fitur welcome tidak aktif.' }, { quoted: msg })

      const welTxt = getWelTxt(chatId)
      if (!welTxt || welTxt.trim() === '' || welTxt.includes('Selamat datang @user'))
        return conn.sendMessage(chatId, { text: 'Pesan welcome belum diatur.' }, { quoted: msg })

      let thumb
      try { thumb = await conn.profilePictureUrl(chatId, 'image') } 
      catch { thumb = 'https://files.catbox.moe/6ylerz.jpg' }

      await conn.sendMessage(chatId, {
        text: welTxt,
        contextInfo: {
          externalAdReply: {
            title: botFullName,
            body: 'Selamat Datang Member Baru',
            thumbnailUrl: thumb,
            mediaType: 1e0,
            renderLargerThumbnail: !0
          },
          forwardingScore: 1e0,
          isForwarded: !0,
          forwardedNewsletterMessageInfo: { newsletterJid: idCh }
        }
      }, { quoted: msg })
    } catch (err) {
      console.error('Error di plugin intro.js:', err),
      conn.sendMessage(msg.key.remoteJid, { text: 'Terjadi kesalahan saat mengirim pesan intro.' }, { quoted: msg })
    }
  }
}