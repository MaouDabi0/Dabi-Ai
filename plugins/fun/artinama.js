import fetch from 'node-fetch'

export default {
  name: 'artinama',
  command: ['artinama', 'nama'],
  tags: 'Fun Menu',
  desc: 'melihat arti nama orang',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    args,
    chatInfo,
    commandText,
    prefix
  }) => {
    const { chatId, pushName } = chatInfo
    try {
      const name = args.join(' ')
      if (!name) return conn.sendMessage(chatId, { text: `Masukkan nama!\nContoh: ${prefix}${commandText} ${pushName}` }, { quoted: msg })

      const url = `https://api.ureshii.my.id/api/primbon/arti-nama?nama=${encodeURIComponent(name)}`,
            res = await fetch(url),
            data = await res.json()

      if (!data?.info?.status) return conn.sendMessage(chatId, { text: 'Gagal mendapatkan respon API.' }, { quoted: msg })

      const user = data.nama,
            arti = data.arti,
            txt = `*Nama:* ${user}\n*Arti Nama:* ${arti}`

      await conn.sendMessage(chatId, { text: txt }, { quoted: msg })
    } catch (e) {
      console.error('error pada artinama:', e)
      await conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat memproses permintaan.' }, { quoted: msg })
    }
  }
}