export default {
  name: 'ceklesbi',
  command: ['ceklesbi'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa lesbi seseorang',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId } = chatInfo,
            targetId = target(msg, senderId),
            mentionTarget = targetId,
            persentase = Math.floor(Math.random() * 101),
            komentar = persentase <= 25 ? 'Masih aman lu mbak'
                      : persentase <= 44 ? 'Agak lain lu mbak'
                      : persentase <= 72 ? 'Waduh warga pelangi?'
                      : persentase <= 88 ? 'Fiks lesbi'
                      : 'Hati² orang lesbi',
            teks = `*Cek seberapa lesbi* @${mentionTarget}\n\n*${persentase}%* Lesbi\n_${komentar}_`

      await conn.sendMessage(chatId, { text: teks, mentions: [`${targetId}@s.whatsapp.net`] }, { quoted: msg })
    } catch (err) {
      console.error('Error:', err),
      conn.sendMessage(msg.key.remoteJid, { text: `Error: ${err.message || err}` }, { quoted: msg })
    }
  }
}