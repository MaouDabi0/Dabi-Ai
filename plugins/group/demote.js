export default {
  name: 'demote',
  command: ['demote', 'stopadmin', 'demoteadmin'],
  tags: 'Group Menu',
  desc: 'Turunkan admin grup menjadi anggota',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix
  }) => {
    const { chatId, senderId, isGroup } = chatInfo
    if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya untuk grup.' }, { quoted: msg })

    const { botAdmin, userAdmin } = await exGrup(conn, chatId, senderId)
    if (!botAdmin || !userAdmin)
      return conn.sendMessage(chatId, { text: !userAdmin ? 'Kamu bukan admin.' : 'Bot bukan admin.' }, { quoted: msg })

    const targetNum = target(msg, senderId)
    if (!targetNum || targetNum === senderId.replace(/\D/g, ''))
      return conn.sendMessage(chatId, { text: `Harap mention atau reply admin yang ingin diturunkan.\nContoh: ${prefix}demote @user` }, { quoted: msg })

    const fullTargetId = `${targetNum}@s.whatsapp.net`,
          metadata = await getMetadata(chatId, conn)
    if (!metadata) return conn.sendMessage(chatId, { text: 'Gagal mengambil metadata grup.' }, { quoted: msg })

    const isTargetAdmin = metadata.participants.some(p => 
      p.phoneNumber?.replace(/@s\.whatsapp\.net$/, '') === targetNum && (p.admin === 'admin' || p.admin === 'superadmin')
    )
    if (!isTargetAdmin)
      return conn.sendMessage(chatId, { text: `@${targetNum} bukan admin grup.`, mentions: [fullTargetId] }, { quoted: msg })

    try {
      await conn.groupParticipantsUpdate(chatId, [fullTargetId], 'demote'),
      global.groupCache ??= new Map(),
      global.groupCache.delete(chatId),
      await getMetadata(chatId, conn)
    } catch {
      conn.sendMessage(chatId, { text: 'Gagal menurunkan admin. Pastikan bot adalah admin dan ID valid.' }, { quoted: msg })
    }
  }
}