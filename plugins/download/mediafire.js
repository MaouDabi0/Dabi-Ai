import meFire from '../../toolkit/scrape/mediafire.js'

export default {
  name: 'MediaFire',
  command: ['md', 'mediafire'],
  tags: 'Download Menu',
  desc: 'Download file mediafire',
  prefix: !0,
  premium: !0,
  owner: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo

    if (!args[0])
      return conn.sendMessage(chatId, { text: `Contoh:\n${prefix + commandText} https://www.mediafire.com/file/xxxxx` }, { quoted: msg })

    try {
      const { name, size, mime, url } = await meFire(args[0]),
            caption = `*MediaFire Downloader*\n*Nama:* ${name}\n*Ukuran:* ${size}\n*MIME:* ${mime}\nSedang mengirim file...`

      await conn.sendMessage(chatId, { text: caption }, { quoted: msg })
      await conn.sendMessage(chatId, { document: { url }, fileName: name, mimetype: mime }, { quoted: msg })

    } catch (err) {
      console.error('[ERROR mediafire]', err),
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan. Coba lagi nanti!' }, { quoted: msg })
    }
  }
}