export default {
  name: 'promote',
  command: ['promote', 'jadiadmin', 'promoteadmin'],
  tags: 'Group Menu',
  desc: 'Promosikan anggota menjadi admin grup',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText
  }) => {
    const { chatId, senderId, isGroup } = chatInfo,
          { botAdmin, userAdmin } = isGroup ? await exGrup(conn, chatId, senderId) : {},
          trgNum = target(msg, senderId),
          fullId = trgNum ? `${trgNum}@s.whatsapp.net` : '',
          meta = isGroup ? await getMetadata(chatId, conn) : null,
          isAdm = meta?.participants?.some(p => p.phoneNumber?.replace(/@s\.whatsapp\.net$/, '') === trgNum && (p.admin === 'admin' || p.admin === 'superadmin'))

    return !isGroup ? conn.sendMessage(chatId, { text: 'Perintah ini hanya untuk grup!' }, { quoted: msg })
         : !userAdmin ? conn.sendMessage(chatId, { text: 'Kamu bukan admin!' }, { quoted: msg })
         : !botAdmin ? conn.sendMessage(chatId, { text: 'Bot bukan admin!' }, { quoted: msg })
         : !trgNum || trgNum === senderId.replace(/\D/g, '') ? conn.sendMessage(chatId, { text: `Harap mention atau reply anggota yang ingin dipromosikan!\nContoh: ${prefix}${commandText} @user` }, { quoted: msg })
         : !meta ? conn.sendMessage(chatId, { text: 'Gagal mengambil metadata grup.' }, { quoted: msg })
         : isAdm ? conn.sendMessage(chatId, { text: `@${trgNum} sudah menjadi admin.`, mentions: [fullId] }, { quoted: msg })
         : (async () => {
             try {
               await conn.groupParticipantsUpdate(chatId, [fullId], 'promote'),
               global.groupCache ??= new Map(),
               global.groupCache.delete(chatId),
               await getMetadata(chatId, conn),
               await conn.sendMessage(chatId, { text: `@${trgNum} sekarang adalah admin.`, mentions: [fullId] }, { quoted: msg })
             } catch {
               conn.sendMessage(chatId, { text: 'Gagal mempromosikan anggota. Pastikan bot adalah admin dan ID valid.' }, { quoted: msg })
             }
           })()
  }
}