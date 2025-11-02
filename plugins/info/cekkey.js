import fetch from 'node-fetch'

export default {
  name: 'cekkey',
  command: ['cekkey'],
  tags: 'Info Menu',
  desc: 'Cek status API key TermAi',
  prefix: !0,
  owner: !0,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo
    try {
      const res = await fetch(`${termaiWeb}/api/tools/key-checker?key=${termaiKey}`),
            json = await res.json()
      if (!json.status) return conn.sendMessage(chatId, { text: 'Gagal mengambil data API key.' }, { quoted: msg })
      const d = json.data,
            formatTime = ({ days, hours, minutes, seconds }) => [days && `${days} hari`, hours && `${hours} jam`, minutes && `${minutes} menit`, seconds && `${seconds} detik`].filter(Boolean).join(', ')

      let teks = `${head}${Obrack} *Info API Key* ${Cbrack}\n` +
                 `${side} ${btn} *Plan:* ${d.plan}\n` +
                 `${side} ${btn} *Limit:* ${d.limit}\n` +
                 `${side} ${btn} *Usage:* ${d.usage}\n` +
                 `${side} ${btn} *Total Hit:* ${d.totalHit}\n` +
                 `${side} ${btn} *Remaining:* ${d.remaining}\n` +
                 `${side} ${btn} *Reset:* ${d.reset}\n` +
                 `${side} ${btn} *Reset Dalam:* ${formatTime(d.resetEvery.format)}\n` +
                 `${side} ${btn} *Expired:* ${d.expired}\n` +
                 `${side} ${btn} *Expired?:* ${d.isExpired ? 'Ya' : 'Tidak'}\n` +
                 `${foot}${garis}\n\n` +
                 `${head} *Fitur & Pemakaian:*\n`
      for (const [fitur, detail] of Object.entries(d.features)) {
        if (typeof detail !== 'object') continue
        teks += `${side} ${btn} ${fitur}:\n` +
                `${side} ${btn} *Max:* ${detail.max ?? '-'}\n` +
                `${side} ${btn} *Use:* ${detail.use ?? '-'}\n` +
                `${side} ${btn} *Hit:* ${detail.hit ?? '-'}\n` +
                (detail.lastReset ? `${side} ${btn} *Last Reset:* ${new Date(detail.lastReset).toLocaleString('id-ID')}\n` : '') +
                `${side} ${garis}\n`
      }
      teks += `${side} Api Dari ${termaiWeb}\n${foot}${garis}\n`

      await conn.sendMessage(chatId, { text: teks.trim() }, { quoted: msg })
    } catch (err) {
      console.error('CekKey Error:', err),
      await conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mengecek API key.' }, { quoted: msg })
    }
  }
}