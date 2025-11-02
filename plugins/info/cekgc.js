export default {
  name: 'Info Grup',
  command: ['cekgc', 'cekidgc'],
  tags: 'Info Menu',
  desc: 'Cek data grup di database',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId, isGroup } = chatInfo
    try {
      if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya untuk grup.' }, { quoted: msg })

      const db = getDB(),
            data = getGc(db, chatId)
      if (!data) return conn.sendMessage(chatId, { text: 'Grup ini belum terdaftar.' }, { quoted: msg })

      const { gbFilter = {}, antibadword = {} } = data,
            close = gbFilter.close || {},
            open = gbFilter.open || {},
            toTime = t => {
              if (!t) return '-'
              const s = t - Date.now()
              return s <= 0 ? 'Waktu Habis' : Format.toTime(s)
            }

      let teks = `${head} ${Obrack} *Info Grup* ${Cbrack}\n`;
        teks += `${side} ${btn} ID: ${data.Id}\n`;
        teks += `${side} ${btn} Auto AI: ${data.autoai ? 'Aktif' : 'Tidak'}\n`;
        teks += `${side} ${btn} Mute: ${data.mute ? 'Aktif' : 'Tidak'}\n`;
        teks += `${side} ${btn} Bell: ${data.bell ? 'Aktif' : 'Tidak'}\n`;
        teks += `${side} ${btn} Peringatan: ${data.setWarn || 0}\n`;

        teks += `${foot}${garis}\n`;
        teks += `${head} ${Obrack} *Pengaturan Grup* ${Cbrack}\n`;
        teks += `${side} ${btn} Welcome: ${gbFilter.Welcome?.welcome ? 'Aktif' : 'Tidak'}\n`;
        teks += `${side} ${btn} Left: ${gbFilter.Left?.gcLeft ? 'Aktif' : 'Tidak'}\n`;
        teks += `${side} ${btn} Anti Link: ${gbFilter.link?.antilink ? 'Aktif' : 'Tidak'}\n`;
        teks += `${side} ${btn} Anti Stiker: ${gbFilter.stiker?.antistiker ? 'Aktif' : 'Tidak'}\n`;
        teks += `${side} ${btn} Anti Bot: ${gbFilter.antibot ? 'Aktif' : 'Tidak'}\n`;
        teks += `${side} ${btn} Anti Tag Sw: ${gbFilter.antiTagSw ? 'Aktif' : 'Tidak'}\n`;
        teks += `${side} ${btn} Jadwal Solat: ${data.jadwalSolat ? 'Aktif' : 'Tidak'}\n`;
        teks += `${side} ${btn} Close Time: ${close.active ? 'Aktif' : 'Tidak'} (${toTime(close.until)})\n`
        teks += `${side} ${btn} Open Time: ${open.active ? 'Aktif' : 'Tidak'} (${toTime(open.until)})\n`;

        teks += `${foot}${garis}\n`;
        teks += `${head} ${Obrack} *Filter Kasar* ${Cbrack}\n`;
        teks += `${side} ${btn} Status: ${antibadword.badword ? 'Aktif' : 'Tidak'}\n`;
        teks += `${side} ${btn} Respon: ${antibadword.badwordText || '-'}\n`;
        teks += `${foot}${garis}`;

      const metadata = await getMetadata(chatId, conn),
            groupName = metadata?.subject || 'Info Grup'

      await conn.sendMessage(chatId, {
        text: teks,
        contextInfo: {
          externalAdReply: {
            title: groupName,
            body: `Ini Adalah Status ${groupName}`,
            thumbnailUrl: thumbnail,
            mediaType: 1,
            renderLargerThumbnail: !0
          },
          forwardingScore: 1,
          isForwarded: !0,
          forwardedNewsletterMessageInfo: { newsletterJid: idCh }
        }
      }, { quoted: msg })
    } catch {
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mengambil data grup.' }, { quoted: msg })
    }
  }
}