export default {
  name: 'daftargc',
  command: ['daftargc'],
  tags: 'Info Menu',
  desc: 'Mendaftarkan grup ke database.',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId, isGroup } = chatInfo

    try {
      if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan di dalam grup.' }, { quoted: msg })

      initDB()
      const db = getDB()
      db.Grup ??= {}

      const { subject: groupName } = await conn.groupMetadata(chatId)
      if (getGc(db, chatId)) return conn.sendMessage(chatId, { text: 'Grup ini sudah terdaftar di database.' }, { quoted: msg })

      db.Grup[groupName] = {
        Id: chatId,
        autoai: !1,
        bell: !1,
        mute: !1,
        setWarn: 0,
        gbFilter: {
          Welcome: {
            welcome: !1,
            welcomeText: '',
            content: {
              media: ''
            }
          },
          Left: {
            gcLeft: !1,
            leftText: '',
            content: {
              media: ''
            }
          },
          link: {
            antilink: !1,
            setlink: ''
          },
          stiker: {
            antistiker: !1
          },
          antibot: !1,
          antiTagSw: !1
        },
        antibadword: {
          badword: !1,
          badwordText: ''
        }
      }

      saveDB(),
      conn.sendMessage(chatId, { text: `Grup *${groupName}* berhasil didaftarkan ke dalam database.` }, { quoted: msg })
    } catch (err) {
      console.error('Plugin daftargc.js error:', err),
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mendaftarkan grup.' }, { quoted: msg })
    }
  }
}