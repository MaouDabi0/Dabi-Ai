export default {
  name: 'owner',
  command: ['owner', 'contact', 'admin'],
  tags: 'Info Menu',
  desc: 'Mengirim kontak owner bot',
  prefix: true,
  owner: false,

  run: async (conn, msg, { chatInfo }) => {
    try {
      const { chatId } = chatInfo;
      const owner = global.ownerName || 'Owner';
      const ownerNumbers = Array.isArray(global.contact) ? global.contact : [global.contact];
      const bot = global.botName || 'Bot';

      if (!ownerNumbers || ownerNumbers.length === 0) {
        return conn.sendMessage(chatId, { text: 'Kontak owner tidak tersedia saat ini.' }, { quoted: msg });
      }

      const contactsArray = ownerNumbers.map((num, i) => ({
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${owner} ${i + 1}\nTEL;type=CELL;waid=${num}:${num}\nEND:VCARD`
      }));

      const displayName =
        ownerNumbers.length > 1
          ? `${owner} dan ${ownerNumbers.length - 1} kontak lainnya`
          : owner;

      await conn.sendMessage(
        chatId,
        {
          contacts: {
            displayName,
            contacts: contactsArray
          }
        },
        { quoted: msg }
      );

      await conn.sendMessage(
        chatId,
        { text: `Ini adalah kontak owner *${bot}*` },
        { quoted: msg }
      );
    } catch (error) {
      console.error('Terjadi kesalahan di plugin owner:', error);
    }
  }
};