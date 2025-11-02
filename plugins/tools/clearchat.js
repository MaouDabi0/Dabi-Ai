export default {
  name: 'clearchat',
  command: ['clearchat', 'cc'],
  tags: 'Tools Menu',
  desc: 'Bersihkan semua riwayat chat',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo
    try {
      console.log(`Attempting to clear chat for chatId: ${chatId}`)
      await conn.chatModify({ clear: { jid: chatId, fromMe: !0 } }, chatId)
      console.log(`Successfully cleared chat for chatId: ${chatId}`)
      conn.sendMessage(chatId, { text: `Semua riwayat chat berhasil dibersihkan` }, { quoted: msg })
    } catch (err) {
      if (err || !chatId) return console.error('Error during clear chat operation:', err),
      conn.sendMessage(chatId, { text: 'Gagal membersihkan riwayat chat, periksa izin bot' }, { quoted: msg })
    }
  }
}