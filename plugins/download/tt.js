import getTiktokVideo from '../../toolkit/scrape/tiktok.js'

export default {
  name: 'tiktok',
  command: ['tiktok', 'tt'],
  tags: 'Download Menu',
  desc: 'Download video dari TikTok tanpa watermark',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo
    if (!args[0]) return conn.sendMessage(chatId, { text: `Example:\n${prefix + commandText} https://vt.tiktok.com/7494086723190721798/` }, { quoted: msg })
    if (!args[0].includes('tiktok.com')) return conn.sendMessage(chatId, { text: `Link tidak valid` }, { quoted: msg })

    await conn.sendMessage(chatId, { react: { text: '⌛', key: msg.key } })
    try {
      const result = await getTiktokVideo(args[0]),
            text = `TIKTOK DOWNLOAD\n\n${head}\n${side} ${btn} *Title* : ${result.title}\n${side} ${btn} *User* : ${result.author.nickname} (@${result.author.unique_id})\n${side} ${btn} *Durasi* : ${result.duration}s\n${side} ${btn} *Likes* : ${result.digg_count.toLocaleString()}\n${side} ${btn} *Views* : ${result.play_count.toLocaleString()}\n${side} ${btn} *Shares* : ${result.share_count.toLocaleString()}\n${side} ${btn} *Comments* : ${result.comment_count.toLocaleString()}\n${side} ${btn} *Download* : Tanpa Watermark\n${foot}${garis}`

      await conn.sendMessage(chatId, { video: { url: 'https://tikwm.com' + result.play }, caption: text }, { quoted: msg, ephemeralExpiration: msg.expiration })
    } catch (err) {
      console.error(err)
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat memproses video' }, { quoted: msg })
    }
  }
}