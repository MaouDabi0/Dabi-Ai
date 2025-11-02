import generateLink from '../../toolkit/scrape/costumelink.js'

export default {
  name: 'linkcostum',
  command: ['linkcostum'],
  tags: 'Tools Menu',
  desc: 'Membuat shortlink wa.me dengan kode dan sandi custom',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo
    try {
      const res = await generateLink(),
            link = res?.url,
            info = `Shortlink Berhasil Dibuat!\n\n• Link: ${link}\n• Kode: nommmmr\n• Sandi: owner\n• Berlaku: ${5e0} menit`

      if (!res || !link) return conn.sendMessage(chatId, { text: 'Gagal membuat link.' }, { quoted: msg })
      await conn.sendMessage(chatId, { text: info }, { quoted: msg })
    } catch (e) {
      console.error('LinkCostum Error:', e),
      await conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat membuat link.' }, { quoted: msg })
    }
  }
}