import gpt4 from '../../toolkit/scrape/gpt4.js'

export default {
  name: 'gpt4o',
  command: ['aay', 'gpt4o', 'gpt4'],
  tags: 'Ai Menu',
  desc: 'Tanya ke GPT-4o menggunakan ChatGPT4o.one',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    textMessage
  }) => {
    try {
      const { chatId } = chatInfo,
            quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage,
            quotedText = quoted?.conversation 
              || quoted?.extendedTextMessage?.text 
              || quoted?.imageMessage?.caption 
              || null,
            query = quotedText || textMessage;

      if (!query) return conn.sendMessage(chatId, { text: 'Apa yang ingin kamu tanyakan?' }, { quoted: msg });

      const response = await gpt4(query);
      if (!response) return conn.sendMessage(chatId, { text: 'Gagal mendapatkan respon.' }, { quoted: msg });

      conn.sendMessage(chatId, { text: response }, { quoted: msg });
    } catch {
      conn.sendMessage(chatInfo.chatId, { text: 'Terjadi kesalahan saat memproses permintaan.' }, { quoted: msg });
    }
  }
}