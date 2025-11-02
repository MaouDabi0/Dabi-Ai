export default {
  name: 'antitagsw',
  command: ['antitagsw'],
  tags: 'Group Menu',
  desc: 'Fitur anti tag status WhatsApp (Tag SW)',
  prefix: !0,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;

    if (!isGroup)
      return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: msg });

    const groupData = getGc(getDB(), chatId);
    if (!groupData)
      return conn.sendMessage(chatId, { text: `Grup belum terdaftar di database.\nGunakan *${prefix}daftargc* untuk mendaftar.` }, { quoted: msg });

    const { botAdmin, userAdmin } = await exGrup(conn, chatId, senderId);
    if (!userAdmin || !botAdmin)
      return conn.sendMessage(chatId, { text: !userAdmin ? 'Kamu bukan Admin!' : 'Bot bukan admin!' }, { quoted: msg });

    const input = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(input))
      return conn.sendMessage(chatId, { text: `Penggunaan:\n${prefix}${commandText} <on/off>` }, { quoted: msg });

    groupData.gbFilter ??= {},
    groupData.gbFilter.antiTagSw = input === 'on', saveDB();

    return conn.sendMessage(chatId, { text: `Fitur anti tag SW berhasil di-${input === 'on' ? 'aktifkan' : 'nonaktifkan'}.` }, { quoted: msg });
  }
};