export default {
  name: 'Rampok',
  command: ['rampok'],
  tags: 'Rpg Menu',
  desc: 'Merampok saldo pengguna lain',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId } = chatInfo,
          ctx = msg.message?.extendedTextMessage?.contextInfo

    if (!args.length && !ctx) return conn.sendMessage(chatId, { text: `Gunakan format:\n\n${prefix}${commandText} @tag\n${prefix}${commandText} 628xxxx\nBalas pesan lalu ketik ${prefix}${commandText}` }, { quoted: msg })

    try {
      initDB()
      const db = getDB(), dbUser = db.Private
      let target = ctx?.mentionedJid?.[0] || ctx?.participant

      if (!target && args.length) {
        const num = args.find(a => /^\d{8,}$/.test(a))
        num && (target = num.replace(/\D/g, '') + '@s.whatsapp.net')
      }

      if (!target?.endsWith('@s.whatsapp.net')) return conn.sendMessage(chatId, { text: 'Nomor tidak valid atau tidak ditemukan' }, { quoted: msg })
      target = target.toLowerCase().trim()
      if (target === senderId) return conn.sendMessage(chatId, { text: 'Tidak bisa merampok diri sendiri' }, { quoted: msg })

      const pelakuKey = Object.keys(dbUser).find(k => dbUser[k].Nomor === senderId),
            targetKey = Object.keys(dbUser).find(k => dbUser[k].Nomor === target)

      if (!pelakuKey || !targetKey)
        return conn.sendMessage(chatId, { text: !pelakuKey ? 'Kamu belum terdaftar di database' : 'Target belum terdaftar di database' }, { quoted: msg })

      const pelaku = dbUser[pelakuKey], korban = dbUser[targetKey]
      if (pelaku.jail) return conn.sendMessage(chatId, { text: 'Kamu sedang di penjara dan tidak bisa merampok.' }, { quoted: msg })

      const game = load(),
            now = Date.now()
      !game.historyGame[senderId] && (game.historyGame[senderId] = {})
      const hist = game.historyGame[senderId]

      hist.rampokCount ??= 0
      hist.rampokReset ??= now
      if (now - hist.rampokReset >= 3e4 * 60) hist.rampokCount = 0, hist.rampokReset = now
      if (hist.rampokCount >= 10) {
        const menit = Math.ceil((3e4 * 60 - (now - hist.rampokReset)) / 6e4)
        return conn.sendMessage(chatId, { text: `Limit rampok kamu sudah habis. Tunggu ${menit} menit lagi untuk reset.` }, { quoted: msg })
      }

      pelaku.money = pelaku.money || { amount: 0 }
      korban.money = korban.money || { amount: 0 }
      if (korban.money.amount <= 0) return conn.sendMessage(chatId, { text: 'Target tidak punya uang untuk dirampok' }, { quoted: msg })

      hist.rampokCount++, save(game)

      const success = Math.random() < .5,
            maxRampok = Math.min(korban.money.amount, 1e4),
            hasil = Math.floor(Math.random() * maxRampok) + 1e3

      if (success) {
        korban.money.amount -= hasil, pelaku.money.amount += hasil, saveDB(db)
        return conn.sendMessage(chatId, { text: `Berhasil merampok Rp${hasil.toLocaleString('id-ID')} dari target\nSisa limit rampok: ${10 - hist.rampokCount}` }, { quoted: msg })
      }

      if (Math.random() < .3) {
        pelaku.jail = !0, saveDB(db)
        return conn.sendMessage(chatId, { text: 'Rampok gagal. Kamu tertangkap dan masuk penjara!' }, { quoted: msg })
      }

      saveDB(db)
      conn.sendMessage(chatId, { text: `Rampok gagal. Target berhasil kabur\nSisa limit rampok: ${10 - hist.rampokCount}` }, { quoted: msg })
    } catch (err) {
      console.error('Error rampok.js:', err),
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat merampok' }, { quoted: msg })
    }
  }
}