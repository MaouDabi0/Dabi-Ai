import { danbooru } from '../../toolkit/scrape/danbooru.js'

export default {
  name: 'donbooru',
  command: ['donbooru', 'db'],
  tags: 'Nsfw Menu',
  desc: 'Cari gambar dari Danbooru',
  prefix: !0,
  owner: !1,
  premium: !0,

  run: async (conn, msg, {
    args,
    chatInfo
  }) => {
    const { chatId } = chatInfo,
          query = args.join(' ')

    return !args.length
      ? conn.sendMessage(chatId, { text: 'Masukkan query! Contoh: *.donbooru rem*' }, { quoted: msg })
      : (async () => {
          try {
            const result = await danbooru(query, '18+')
            await conn.sendMessage(chatId, {
              image: { url: result.full_file_url },
              caption: `Hasil Danbooru
Tags: ${result.tags || '-'}
Source: ${result.source || '-'}
ID: ${result.id}`
            }, { quoted: msg })
          } catch (err) {
            await conn.sendMessage(chatId, { text: `Error: ${err.message}` }, { quoted: msg })
          }
        })()
  }
}