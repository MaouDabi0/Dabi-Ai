import play from '../../toolkit/scrape/play.js'

export default {
  name: 'play',
  command: ['play', 'lagu', 'song', 'ply'],
  tags: 'Download Menu',
  desc: 'Mendownload lagu dari YouTube',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo,
          query = args.join(' ')
    
    if (!args[0]) return conn.sendMessage(chatId, { text: `Format salah!\nGunakan: ${prefix + commandText} someone you loved` }, { quoted: msg })

    try {
      await conn.sendMessage(chatId, { react: { text: '🎵', key: msg.key } })
      const result = await play(query),
            caption = `${head}${Obrack} ${result.title} ${Cbrack}
${side} ${btn} Artis: ${result.author}
${side} ${btn} Durasi: ${result.duration}
${side} ${btn} Link: ${result.url}
${foot}${garis}`

      await conn.sendMessage(chatId, {
        text: caption,
        contextInfo: {
          externalAdReply: {
            title: 'Play Music',
            thumbnailUrl: result.image,
            mediaType: 1,
            renderLargerThumbnail: !0
          },
          forwardingScore: 1,
          isForwarded: !0,
          forwardedNewsletterMessageInfo: { newsletterJid: idCh }
        }
      }, { quoted: msg }),
      await conn.sendMessage(chatId, {
        audio: { url: result.audio.url },
        mimetype: 'audio/mpeg',
        fileName: result.audio.filename
      }, { quoted: msg })
    } catch {
      await conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mengambil lagu.' }, { quoted: msg })
    }
  }
}