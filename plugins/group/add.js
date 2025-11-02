export default {
  name: 'add',
  command: ['add', 'invite', 'tambahkan'],
  tags: 'Group Menu',
  desc: 'Menambahkan anggota ke grup',
  prefix: !0,
  owner: !0,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo,
          mentionTarget = target(msg, senderId)

    if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan dalam grup!' })

    const { botAdmin, userAdmin } = await exGrup(conn, chatId, senderId)
    if (!userAdmin || !botAdmin) {
      return conn.sendMessage(chatId, { text: !userAdmin ? 'kamu bukan admin' : 'bot bukan admin' }, { quoted: msg })
    }

    const q = msg.message?.extendedTextMessage?.contextInfo,
          quotedMsg = q?.quotedMessage,
          quotedSender = q?.participant
    let targetUser = quotedSender

    !targetUser && args[1]
      ? (() => {
          const number = args[1].replace(/[^0-9]/g, '')
          return number.length < 8e0
            ? conn.sendMessage(chatId, { text: 'Nomor tidak valid!' }, { quoted: msg })
            : targetUser = `${number}@s.whatsapp.net`
        })()
      : null

    if (!targetUser) return conn.sendMessage(chatId, { text: `Gunakan perintah ini dengan format:\n• Reply pesan target\n• ${prefix + commandText} 628xxxxxxxxx` }, { quoted: msg })

    const groupMetadata = await conn.groupMetadata(chatId),
          alreadyInGroup = groupMetadata.participants.some(p => p.id === targetUser)
    if (alreadyInGroup) return conn.sendMessage(chatId, { text: 'Target sudah berada dalam grup.' }, { quoted: msg })

    try {
      await conn.groupParticipantsUpdate(chatId, [targetUser], 'add'),
      await conn.sendMessage(chatId, { text: `Berhasil menambahkan @${mentionTarget}`, mentions: [targetUser] }, { quoted: msg })
    } catch {
      await conn.sendMessage(chatId, { text: 'Gagal menambahkan anggota. Pastikan nomor aktif dan bot adalah admin!' }, { quoted: msg })
    }
  }
}