import { isJidGroup } from '@whiskeysockets/baileys';

export default {
  name: 'masuk',
  command: ['masuk', 'gabung'],
  tags: 'Owner Menu',
  desc: 'Bot join grup',
  prefix: !0,
  premium: !0,
  owner: !1,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo,
          qMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage,
          text = args.join(' ') || qMsg?.conversation || qMsg?.extendedTextMessage?.text || '',
          match = text.match(/chat\.whatsapp\.com\/([\w\d]+)/);

    if (!text || !match)
      return conn.sendMessage(chatId, { text: !text ? 'Masukkan atau reply link grup.' : 'Link tidak valid.' }, { quoted: msg });

    try {
      const res = await conn.groupAcceptInvite(match[1]);
      return conn.sendMessage(chatId, { text: isJidGroup(res) ? `Berhasil join grup.\nID: ${res}` : 'Berhasil, menunggu persetujuan admin.' }, { quoted: msg });
    } catch (err) {
      console.error(err);
      const failMsg = err.message.includes('rejected') || err.message.includes('kicked')
        ? 'Gagal join. Bot pernah dikeluarkan.'
        : 'Gagal join. Periksa pengaturan grup.';
      return conn.sendMessage(chatId, { text: failMsg }, { quoted: msg });
    }
  }
};