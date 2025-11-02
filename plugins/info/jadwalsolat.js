import getJadwal from '../../toolkit/scrape/jadwalsolat.js'

export default {
  name: 'jadwalsolat',
  command: ['jadwalsolat', 'solat'],
  tags: 'Info Menu',
  desc: 'Aktifkan atau matikan jadwal solat di grup',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId, isGroup } = chatInfo,
          db = getDB(),
          g = getGc(db, chatId)

    try {
      if (!isGroup) return conn.sendMessage(chatId, { text: 'Fitur hanya untuk grup.' }, { quoted: msg })
      if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) 
        return conn.sendMessage(chatId, { text: 'Gunakan:\n.jadwalsolat on [kota]\n.jadwalsolat off' }, { quoted: msg })
      if (!g) return conn.sendMessage(chatId, { text: 'Grup belum terdaftar di database.' }, { quoted: msg })

      const modeOn = args[0].toLowerCase() === 'on'
      if (modeOn) {
        const kota = args[1] || 'Jakarta',
              jadwal = await getJadwal(kota)
        if (!jadwal) return conn.sendMessage(chatId, { text: 'Gagal mengambil jadwal solat dari API.' }, { quoted: msg })
        g.jadwalSolat = !0, saveDB()

        const teks = `${head}${Obrack} Jadwal Hari ini ${Cbrack}\n${side}\n${side} ${btn} *Lokasi:* ${jadwal.lokasi}\n${side} ${btn} *Tanggal:* ${jadwal.tanggal}\n${side} ${btn} *Subuh:* ${jadwal.waktu.Fajr}\n${side} ${btn} *Dzuhur:* ${jadwal.waktu.Dhuhr}\n${side} ${btn} *Ashar:* ${jadwal.waktu.Asr}\n${side} ${btn} *Maghrib:* ${jadwal.waktu.Maghrib}\n${side} ${btn} *Isya:* ${jadwal.waktu.Isha}\n${side}\n${foot}${garis}`
        return conn.sendMessage(chatId, { text: `Jadwal solat diaktifkan.\n\n${teks}` }, { quoted: msg })
      } 
      g.jadwalSolat = !1, saveDB()
      return conn.sendMessage(chatId, { text: 'Jadwal solat dinonaktifkan untuk grup ini.' }, { quoted: msg })
    } catch (e) {
      console.error('Error plugin jadwalsolat:', e)
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat memproses perintah.' }, { quoted: msg })
    }
  }
}