import { igdl } from 'ruhend-scraper'

export default {
  name: 'instagram',
  command: ['instagram', 'ig', 'igdl', 'instegrem', 'insta'],
  tags: 'Download Menu',
  desc: 'Mengunduh video atau foto dari Instagram',
  prefix: !0,
  owner: !1,
  premium: !0,

  run: async (conn, msg, {
    chatInfo,
    args,
    prefix,
    commandText
  }) => {
    try {
      const { chatId } = chatInfo,
            url = Array.isArray(args) ? args[0] : args,
            invalidUrl = !args || !url || !url.match(/https?:\/\/(?:www\.)?instagram\.[a-z\.]{2,6}\/[\w\-\.]+(\/[^\s]*)?/i)

      if (invalidUrl)
        return conn.sendMessage(chatId, { text: !args || !url ? `Masukkan URL Instagram! Contoh: *${prefix}${commandText} https://www.instagram.com/p/C1Ck8sENM94/*` : 'URL tidak valid! Pastikan itu adalah tautan Instagram.' }, { quoted: msg })

      await conn.sendMessage(chatId, { text: 'Sedang memproses, mohon tunggu...' }, { quoted: msg })

      const res = await igdl(url),
            media = res.data?.[0]
      if (!media) return conn.sendMessage(chatId, { text: 'Media tidak ditemukan atau URL salah.' }, { quoted: msg })

      const fileName = `${media.title?.replace(/[\/:*?"<>|]/g, '') || 'instagram_1'}.mp4`,
            caption = media.description || 'Video Instagram'

      await conn.sendMessage(chatId, { video: { url: media.url }, mimetype: 'video/mp4', fileName, caption }, { quoted: msg })
    } catch {
      conn.sendMessage(msg.key.remoteJid, { text: 'Terjadi kesalahan saat memproses permintaan. Coba lagi nanti!' }, { quoted: msg })
    }
  }
}