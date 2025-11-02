import fs from 'fs'
import path from 'path'

export default {
  name: 'usergame',
  command: ['game','userme'],
  tags: 'Rpg Menu',
  desc: 'Menampilkan akun game pengguna',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { senderId, chatId, pushName } = chatInfo,
          gamePath = path.join(dirname, './db/game.json'),
          more = String.fromCharCode(8206),
          readmore = more.repeat(4e3 + 1)
    let thumbPp = 'https://files.catbox.moe/6ylerz.jpg'

    try {
      const data = JSON.parse(fs.readFileSync(gamePath)),
            users = data?.tca?.user || {},
            nama = Object.keys(users).find(k => users[k].id === senderId)
      if (!nama)
        return conn.sendMessage(chatId, { text: 'Kamu belum mempunyai akun game!\nKetik *.create <nama>* untuk membuat akun.' }, { quoted: msg })

      const u = users[nama],
            inv = u.inv || {},
            formatInv = (obj, ind = '') => Object.entries(obj).map(([k, v]) =>
              v && typeof v === 'object' && !Array.isArray(v)
                ? `${ind}• ${k}\n${formatInv(v, ind + '  ')}`
                : `${ind}• ${k} ${v}`).join('\n'),
            invText = Object.keys(inv).length ? formatInv(inv).trim() : '(kosong)'

      initDB()
      const db = getDB(),
            d = getUser(senderId),
            uang = d?.data?.money?.amount || 0

      try { thumbPp = await conn.profilePictureUrl(senderId, 'image') } catch {}

      const teks =
        `${head}${Obrack} Akun Game ${Cbrack}\n` +
        `${side} ${btn} *Nama:* ${nama}\n` +
        `${side} ${btn} *Level:* ${u.lvl || 1}\n${side}\n` +
        `${side} ${btn} *Hasil Maining:* ${u.maining || '0x hasil'}\n` +
        `${side} ${btn} *Uang:* Rp${uang.toLocaleString('id-ID')}\n` +
        `${foot}${garis}\n\n` +
        `Inventory: ${readmore}\n${invText}`

      await conn.sendMessage(chatId, {
        text: teks,
        mentions: [senderId],
        contextInfo: {
          externalAdReply: {
            title: 'Game Profile',
            body: `Akun game milik ${pushName}`,
            thumbnailUrl: thumbPp,
            mediaType: 1,
            renderLargerThumbnail: !0
          },
          mentionedJid: [senderId],
          forwardingScore: 1,
          isForwarded: !0,
          forwardedNewsletterMessageInfo: { newsletterJid: idCh }
        }
      }, { quoted: msg })
    } catch (e) {
      console.error('Error plugin usergame:', e),
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat membaca akun game!' }, { quoted: msg })
    }
  }
}