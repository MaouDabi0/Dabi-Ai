export default function fun(ev) {
  ev.on({
    name: 'cekcantik',
    cmd: ['cekcantik'],
    tags: 'Fun Menu',
    desc: 'cek seberapa cantik orang',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              user = quoted?.participant || quoted?.mentionedJid?.[0] || m.key?.participant || chat.id,
              target = user.replace(/@s\.whatsapp\.net$/, ''),
              persen = Math.floor(Math.random() * 101)

        let txt = persen <= 17 ? 'gak jelek² amat' :
                  persen <= 34 ? 'mayan lah' :
                  persen <= 51 ? 'cantik juga' :
                  persen <= 67 ? 'hmm menarik sih' :
                  persen <= 84 ? 'cantik sih ini' :
                  persen <= 93 ? 'bidadari cuy' : 'cantik banget',
            teks = `@${target} ${persen}%\n${txt}`

        await xp.sendMessage(chat.id, { text: teks, mentions: [user] }, { quoted: m })
      } catch (e) {
        err('error pada cekcantik', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'cekganteng',
    cmd: ['cekganteng'],
    tags: 'Fun Menu',
    desc: 'cek seberapa ganteng orang',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              user = quoted?.participant || quoted?.mentionedJid?.[0] || m.key?.participant || chat.id,
              target = user.replace(/@s\.whatsapp\.net$/, ''),
              persen = Math.floor(Math.random() * 101)

        let txt = persen <= 17 ? 'gak jelek² amat' :
                  persen <= 34 ? 'mayan lah' :
                  persen <= 51 ? 'ganteng juga' :
                  persen <= 67 ? 'hmm menarik sih' :
                  persen <= 84 ? 'ganteng sih ini' :
                  persen <= 93 ? 'thomas cuy' : 'ganteng banget',
            teks = `@${target} ${persen}%\n${txt}`

        await xp.sendMessage(chat.id, { text: teks, mentions: [user] }, { quoted: m })
      } catch (e) {
        err('error pada cekganteng', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'cekjomok',
    cmd: ['cekgay', 'cekjomok'],
    tags: 'Fun Menu',
    desc: 'cek seberapa jomok orang',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              user = quoted?.participant || quoted?.mentionedJid?.[0] || m.key?.participant || chat.id,
              target = user.replace(/@s\.whatsapp\.net$/, ''),
              persen = Math.floor(Math.random() * 101)

        let txt = persen <= 17 ? 'masih aman bang' :
                  persen <= 34 ? 'agak agak sih' :
                  persen <= 51 ? 'agak lain sih' :
                  persen <= 67 ? 'gay banget lho ya' :
                  persen <= 84 ? 'gangguan jiwa' :
                  persen <= 93 ? 'fiks gay' : 'orang jomok',
            teks = `@${target} ${persen}% ${txt}`

        await xp.sendMessage(chat.id, { text: teks, mentions: [user] }, { quoted: m })

      } catch (e) {
        err('error pada cekjomok', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'ceksifat',
    cmd: ['ceksifat'],
    tags: 'Fun Menu',
    desc: 'cek sifat orang secara random',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              user = quoted?.participant || quoted?.mentionedJid?.[0] || m.key?.participant || chat.id,
              { sifatList } = await global.func(),
              target = user.replace(/@s\.whatsapp\.net$/, '')

        const sifat = sifatList[Math.floor(Math.random() * sifatList.length)]

        let teks = `@${target}\nSifat kamu: *${sifat}*`

        await xp.sendMessage(chat.id, { text: teks, mentions: [user] }, { quoted: m })
      } catch (e) {
        err('error pada ceksifat', e)
        call(xp, e, m)
      }
    }
  })
}