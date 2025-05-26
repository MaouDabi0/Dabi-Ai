module.exports = {
  name: 'cekjomok',
  command: ['cekjomok', 'cekgay'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa jomok seseorang',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId } = chatInfo;
    let targetId = target(message, senderId);
    const tagJid = `${targetId}@s.whatsapp.net`;
    const persentase = Math.floor(Math.random() * 101);

    let komentar;
    if (persentase <= 25) komentar = 'Masih aman lu bang';
    else if (persentase <= 44) komentar = 'Agak lain lu bang';
    else if (persentase <= 72) komentar = 'Waduh warga sungut lele';
    else if (persentase <= 88) komentar = 'Fiks jomok';
    else komentar = 'Hati² orang jomok';

    const teks = `*Cek seberapa jomok* @${targetId}\n\n*${persentase}%* Jomok\n_${komentar}_`;

    await conn.sendMessage(chatId, {
      text: teks,
      mentions: [tagJid]
    }, { quoted: message });
  }
};