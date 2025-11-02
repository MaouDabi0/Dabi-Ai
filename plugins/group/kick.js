export default {
  name: 'kick',
  command: ['kick', 'dor', 'tendang', 'keluar'],
  tags: 'Group Menu',
  desc: 'Mengeluarkan anggota dari grup.',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText
  }) => {
    const { chatId, senderId, isGroup } = chatInfo
    if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: msg })

    const { botAdmin, userAdmin, admins } = await exGrup(conn, chatId, senderId),
          ctx = msg.message?.extendedTextMessage?.contextInfo || {},
          target = ctx.mentionedJid?.[0] || ctx.participant

    if (!userAdmin || !botAdmin) 
      return conn.sendMessage(chatId, { text: !userAdmin ? 'Kamu bukan Admin!' : 'Bot bukan admin!' }, { quoted: msg })

    if (!target) return conn.sendMessage(chatId, { text: `Gunakan format:\n${prefix}${commandText} @628xxxx atau reply pesan target.` }, { quoted: msg })
    if (admins.includes(target)) return conn.sendMessage(chatId, { text: 'Tidak bisa mengeluarkan admin grup!' }, { quoted: msg })

    await conn.groupParticipantsUpdate(chatId, [target], 'remove')
      .catch(() => conn.sendMessage(chatId, { text: 'Gagal mengeluarkan anggota. Pastikan bot adalah admin!' }, { quoted: msg }))
  }
}