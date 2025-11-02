import fetch from 'node-fetch'

export default {
  name: 'cuaca',
  command: ['cuaca', 'cekcuaca'],
  tags: 'Tools Menu',
  desc: 'Cek cuaca berdasarkan nama kota',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    try {
      const { chatId } = chatInfo,
            kota = args.join(' ')

      if (!kota) {
        return conn.sendMessage(chatId, { text: 'masukan nama kota' }, { quoted: msg })
      }

      const url = `https://api.ureshii.my.id/api/internet/info-cuaca?kota=${encodeURIComponent(kota)}`,
            res = await fetch(url),
            d = await res.json()

      if (!d.kota || !d.cuaca) return conn.sendMessage(chatId, { text: `Gagal mendapatkan data cuaca untuk kota: ${kota}` }, { quoted: msg })

      let text = `*Cuaca Hari Ini di\n\n`
          text += `${head} ${Obrack}${d.kota}, ${d.negara}${Cbrack}*\n${body}\n`
          text += `${body} 🌤️ *Cuaca:* ${d.cuaca}\n`
          text += `${body}💧 *Kelembapan:* ${d.kelembapan}%\n`
          text += `${body} 🌬️ *Kecepatan Angin:* ${d.angin_kpj} m/s\n`
          text += `${body} 🌡️ *Suhu Saat Ini:* ${d.suhu_c}°C\n`
          text += `${body} 🔥 *Suhu Tertinggi:* ${d.suhu_tertinggi_c}°C\n`
          text += `${body}❄️ *Suhu Terendah:* ${d.suhu_terendah_c}°C\n${body}\n`
          text += `${foot}${garis}\n\n`
          text += `Semoga harimu menyenangkan! Jangan lupa bawa payung kalau cuacanya mendung ya! ☂️`

      await conn.sendMessage(chatId, { text }, { quoted: msg })
    } catch (e) {
      conn.sendMessage(chatInfo.chatId, { text: 'Terjadi kesalahan saat mengambil data cuaca.' }, { quoted: msg })
    }
  }
}