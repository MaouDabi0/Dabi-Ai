export default {
  name: 'antibadword',
  command: ['badword', 'antibadword'],
  tags: 'Group Menu',
  desc: 'Mengatur fitur anti badword dalam grup',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo,
          send = t => conn.sendMessage(chatId, { text: t }, { quoted: msg }),
          db = getDB(),
          gc = getGc(db, chatId),
          { botAdmin, userAdmin } = await exGrup(conn, chatId, senderId)

    if (!isGroup || !gc || !userAdmin || !botAdmin)
      return send(!isGroup ? 'Perintah ini hanya untuk grup!' :
              !gc ? `Grup belum terdaftar.\nGunakan ${prefix}daftargc.` :
              !userAdmin ? 'Kamu bukan admin.' :
              'Bot bukan admin.')

    const input = args[0]?.toLowerCase() || '',
          antibw = gc.antibadword ??= { badword: !1, badwordText: '' }

    if (!input) return send(`Penggunaan:\n${prefix + commandText} <on/off>\n${prefix + commandText} set <kata>\n${prefix + commandText} reset`)

    input === 'on' || input === 'off' ? (
      antibw.badword = input === 'on' ? !0 : !1,
      saveDB(),
      send(`Fitur antibadword ${input === 'on' ? 'diaktifkan' : 'dinonaktifkan'}.`)
    ) : input === 'set' ? (() => {
      const word = args.slice(1e0).join(' ').toLowerCase(),
            words = antibw.badwordText.split(',').map(w => w.trim()).filter(Boolean)
      return !word ? send('Masukkan kata yang ingin ditambahkan.') :
             words.includes(word) ? send(`Kata "${word}" sudah ada.`) :
             (words.push(word), antibw.badwordText = words.join(', '), saveDB(), send(`Kata "${word}" ditambahkan.`))
    })() : input === 'reset' ? (
      antibw.badwordText = '', saveDB(), send('Daftar badword direset.')
    ) : send(`Perintah tidak dikenal.\nGunakan:\n${prefix + commandText} <on/off>\n${prefix + commandText} set <kata>\n${prefix + commandText} reset`)
  }
}