export default {
  name: 'ngl',
  command: ['ngl', 'fake-ngl'],
  tags: 'Maker Menu',
  desc: 'Buat pesan fake NGL',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo
    try {
      if (!args?.length)
        return conn.sendMessage(chatId, { text: 'Example: .ngl halo semuanya' }, { quoted: msg })

      const text = args.join(' ').trim(),
            emoji = 'whatsapp',
            backgroundColor = 'light',
            url = `${termaiWeb}/api/maker/ngl?text=${encodeURIComponent(text)}&emojiType=${emoji}&backgroundColor=${backgroundColor}&key=${termaiKey}`

      const res = await conn.sendMessage(chatId, { image: { url }, caption: 'Fake NGL generated', ai: !0 }, { quoted: msg })
      res ? !0 : await conn.sendMessage(chatId, { text: 'Gagal mengirim gambar NGL' }, { quoted: msg })
    } catch (e) {
      console.error('[ERROR-ngl]', e),
      conn.sendMessage(chatId, { text: `Gagal membuat fake NGL: ${e.message}` }, { quoted: msg })
    }
  }
}