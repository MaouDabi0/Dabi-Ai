import axios from 'axios'

export default {
  name: 'ssweb',
  command: ['ssweb', 'ss'],
  tags: 'Download Menu',
  desc: 'Ambil screenshot dari website',
  prefix: !0,
  owner: !1,
  premium: !0,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo,
          url = args[0]
    let type = 2

    if (args[1]) 
      /^--type=\d$/.test(args[1]) ? type = args[1].split('=')[1] : /^\d+$/.test(args[1]) && (type = args[1])

    if (!url || !/^https?:\/\//i.test(url))
      return conn.sendMessage(chatId, { text: `Contoh:\n${prefix + commandText} https://example.com 2\natau\n${prefix + commandText} https://example.com --type=2` }, { quoted: msg })

    try {
      const apiUrl = `${global.HamzWeb}/tools/ssweb?apikey=${global.HamzKey}&url=${encodeURIComponent(url)}&type=${type}`,
            res = await axios.get(apiUrl, { responseType: 'arraybuffer' })

      if (!res.headers['content-type']?.startsWith('image/'))
        throw new Error('API tidak mengembalikan gambar.')

      await conn.sendMessage(chatId, { image: Buffer.from(res.data), caption: `Screenshot dari: ${url}\nMode type: ${type}` }, { quoted: msg })
    } catch (e) {
      await conn.sendMessage(chatId, { text: `Terjadi kesalahan:\n${e.message || 'Tidak dapat mengambil screenshot.'}` }, { quoted: msg })
    }
  }
}