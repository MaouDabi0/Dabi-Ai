import fetch from 'node-fetch'

export default {
  name: 'reset-ai-bell',
  command: ['resetbell', 'resetai'],
  tags: 'Ai Menu',
  desc: 'Mereset sesi AI Bell untuk user',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId, senderId } = chatInfo,
          targetId = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            || msg.message?.extendedTextMessage?.contextInfo?.participant
            || senderId;

    try {
      const res = await fetch(`${termaiWeb}/api/chat/logic-bell/reset?id=${targetId}&key=${termaiKey}`),
            json = await res.json(),
            text = json.msg || 'Gagal mereset AI Bell';
      await conn.sendMessage(chatId, { text }, { quoted: msg });
    } catch (e) {
      await conn.sendMessage(chatId, { text: `Terjadi kesalahan: ${e.message}` }, { quoted: msg });
    }
  }
}