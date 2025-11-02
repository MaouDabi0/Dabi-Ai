export default {
  name: 'Sebar Uang',
  command: ['sebaruang', 'ceksebaruang'],
  tags: 'Owner Menu',
  desc: 'Cek total uang tersebar dan saldo bank',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId, senderId } = chatInfo
    try {
      const loading = await conn.sendMessage(chatId, { text: 'Sedang mengkalkulasi penyebaran uang...' }, { quoted: msg }),
            db = (initDB(), getDB().Private || {}),
            bank = loadBank(),
            saldoBank = bank.bank?.saldo || 0

      let totalUang = 0, terkaya = { name: '-', saldo: 0 },
          pengguna = Object.keys(db).length

      for (const id in db) {
        const user = db[id], uang = user?.money?.amount || 0
        totalUang += uang
        uang > terkaya.saldo && (terkaya = { name: user?.Nama || id.replace(/@s\.whatsapp\.net$/, ''), saldo: uang })
      }

      const teks =
`${head} ${Obrack} Penyebaran Uang ${Cbrack}
${side} ${btn} Total Pengguna        : ${pengguna}
${side} ${btn} Total Uang Pengguna   : Rp${Format.toNumber(totalUang)}
${side} ${btn} Saldo Bank            : Rp${Format.toNumber(saldoBank)}
${side} ${btn} Total Uang Bot        : Rp${Format.toNumber(totalUang + saldoBank)}
${side} ${btn} Pengguna Terkaya      : ${terkaya.name}
${side} ${btn} Saldo Terkaya         : Rp${Format.toNumber(terkaya.saldo)}
${foot}${garis}`

      await conn.sendMessage(chatId, {
        text: teks,
        mentions: [senderId],
        contextInfo: {
          externalAdReply: {
            title: 'Distribusi Ekonomi Bot',
            body: `Data milik ${msg.pushName}`,
            thumbnailUrl: thumbnail,
            mediaType: 1,
            renderLargerThumbnail: !0
          },
          mentionedJid: [senderId],
          forwardingScore: 1,
          isForwarded: !0,
          forwardedNewsletterMessageInfo: { newsletterJid: idCh }
        }
      }, { quoted: loading })

    } catch (e) {
      console.error('Error sebaruang.js:', e)
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mengecek penyebaran uang!' }, { quoted: msg })
    }
  }
}