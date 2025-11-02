import axios from 'axios'

export default {
  name: 'pindl',
  command: ['pindl', 'pinterestdl'],
  tags: 'Download Menu',
  desc: 'Download media dari link Pinterest',
  prefix: !0,
  owner: !1,
  premium: !0,

  run: async (conn, msg, {
    chatInfo,
    args,
    prefix,
    commandText
  }) => {
    const { chatId } = chatInfo,
          url = args[0]

    if (!url || (!url.includes('pinterest.com') && !url.includes('pin.it')))
      return conn.sendMessage(chatId, { text: `Contoh:\n${prefix + commandText} https://www.pinterest.com/pin/123456789` }, { quoted: msg })

    try {
      const res = await axios.get(`${global.siptzKey}/api/d/pinterest`, { params: { url } }),
            data = res.data?.data,
            mediaUrl = Array.isArray(data) ? data[0]?.url : data?.url

      if (!res.data.status || !mediaUrl)
        return conn.sendMessage(chatId, { text: 'Gagal mengambil media dari Pinterest.' }, { quoted: msg })

      const isVideo = mediaUrl.endsWith('.mp4')
      await conn.sendMessage(chatId, { [isVideo ? 'video' : 'image']: { url: mediaUrl }, caption: `Berhasil mengunduh ${isVideo ? 'video' : 'gambar'} dari Pinterest.` }, { quoted: msg })
    } catch (err) {
      console.error('[ERROR pindl]', err),
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mengambil data dari API.' }, { quoted: msg })
    }
  }
}