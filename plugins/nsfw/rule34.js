import axios from 'axios'
import cheerio from 'cheerio'

export default {
  name: 'rule34',
  command: ['rule34', 'rule'],
  tags: 'Nsfw Menu',
  desc: 'Cari gambar random dari rule34 berdasarkan tag',
  prefix: !0,
  owner: !1,
  premium: !0,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    args
  }) => {
    const { chatId } = chatInfo,
          q = args.join(' ')

    if (!q) return conn.sendMessage(chatId, { text: `Contoh: ${prefix}rule34 neko` }, { quoted: msg })

    try {
      const { data } = await axios.get(`https://rule34.xxx/index.php?page=post&s=list&tags=${encodeURIComponent(q)}`, { headers: { 'User-Agent': 'Mozilla/5.0' } }),
            $ = cheerio.load(data),
            posts = $('#post-list .thumb')

      return !posts.length
        ? conn.sendMessage(chatId, { text: 'Tidak ditemukan gambar dengan tag itu' }, { quoted: msg })
        : (await (async () => {
            const thumb = posts.eq(Math.floor(Math.random() * posts.length)),
                  page = 'https://rule34.xxx' + thumb.find('a').attr('href'),
                  det = await axios.get(page, { headers: { 'User-Agent': 'Mozilla/5.0' } }),
                  $$ = cheerio.load(det.data),
                  image = $$('img#image').attr('src')

            return !image
              ? conn.sendMessage(chatId, { text: 'Gagal mengambil gambar' }, { quoted: msg })
              : conn.sendMessage(chatId, { image: { url: image }, caption: `Tag: ${q}\nLink: ${page}` }, { quoted: msg })
          })())
    } catch (e) {
      conn.sendMessage(chatId, { text: `Error: ${e.message}` }, { quoted: msg })
    }
  }
}