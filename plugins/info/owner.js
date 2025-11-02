export default {
  name: 'owner',
  command: ['owner', 'contact', 'admin'],
  tags: 'Info Menu',
  desc: 'Mengirim kontak owner bot',
  prefix: !0,
  owner: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    try {
      const { chatId } = chatInfo,
            owner = global.ownerName || 'Owner',
            bot = global.botName || 'Bot',
            ownerNumbers = Array.isArray(global.contact) ? global.contact : [global.contact]

      if (!ownerNumbers || !ownerNumbers.length) return conn.sendMessage(chatId, { text: 'Kontak owner tidak tersedia saat ini.' }, { quoted: msg })

      const contactsArray = ownerNumbers.map((num, i) => ({ vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${owner} ${i + 1}\nTEL;type=CELL;waid=${num}:${num}\nEND:VCARD` })),
        displayName = ownerNumbers.length > 1 ? `${owner} dan ${ownerNumbers.length - 1} kontak lainnya` : owner

      await conn.sendMessage(chatId, { contacts: { displayName, contacts: contactsArray } }, { quoted: msg })
      await conn.sendMessage(chatId, { text: `Ini adalah kontak owner *${bot}*` }, { quoted: msg })
    } catch (e) { console.error('Terjadi kesalahan di plugin owner:', e) }
  }
}