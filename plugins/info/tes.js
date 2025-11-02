export default {
  name: 'Tes',
  command: ['tes'],
  tags: 'Info Menu',
  desc: 'cek bot online',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo;
    try {
      conn.sendMessage(chatId, { text: "online" }, { quoted: msg });
    } catch (e) {
      console.log('error:', e);
    }
  }
}