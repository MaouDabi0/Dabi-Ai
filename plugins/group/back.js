import { proto } from '@whiskeysockets/baileys'

export default {
  name: 'back',
  command: ['bck', 'back'],
  tags: 'Group Menu',
  desc: 'Join grup dari link invite atau kirim pesan promosi jika sudah bergabung',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId, senderId } = chatInfo
    try {
      const { userAdmin } = await exGrup(conn, chatId, senderId)
      if (!userAdmin) return conn.sendMessage(chatId, { text: 'Kamu bukan Admin!' }, { quoted: msg })

      const ctx = msg?.message?.extendedTextMessage?.contextInfo,
            quoted = ctx?.quotedMessage,
            regex = /(https:\/\/chat\.whatsapp\.com\/[0-9A-Za-z]+)/,
            link = quoted?.extendedTextMessage?.matchedText || quoted?.extendedTextMessage?.text?.match(regex)?.[0]

      if (!link) return conn.sendMessage(chatId, { text: 'Tidak ada link grup valid yang ditemukan di reply.' }, { quoted: msg })

      const inviteCode = link.split('/')[3].split('?')[0],
            res = await conn.groupGetInviteInfo(inviteCode)
      if (!res) return conn.sendMessage(chatId, { text: 'Tidak bisa mengambil info grup dari link.' }, { quoted: msg })

      const jid = res.id,
            groups = Object.keys(conn.groupMetadata ? conn.groupMetadata : {}),
            teks = `Izin min, gabung yuk di grup bot wa aku!\n\nBot aktif 24 jam, bisa untuk bisnis, online, dan hiburan.\n\nBck tadi\n\nKlik link di bawah ini untuk gabung: https://chat.whatsapp.com/HWkHNig33fv1nozmxADq38`

      !groups.includes(jid)
        ? (await conn.groupAcceptInvite(inviteCode),
           await conn.sendMessage(chatId, { text: `Berhasil join ke grup: ${res.subject}` }, { quoted: msg }))
        : null

      await conn.sendMessage(jid, { text: teks }, { quoted: msg }),
      await conn.sendMessage(chatId, { text: 'Pesan promosi terkirim ke grup tersebut.' }, { quoted: msg })
    } catch (e) {
      return conn.sendMessage(chatId, { text: 'Terjadi error saat memproses link grup.' }, { quoted: msg })
    }
  }
}