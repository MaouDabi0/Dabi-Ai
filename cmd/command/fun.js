import fetch from 'node-fetch'
import { vn } from '../interactive.js'
import { groupCache } from '../../system/function.js'

export default function fun(ev) {
  ev.on({
    name: 'elevenlabs',
    cmd: ['elevenlabs'],
    tags: 'Fun Menu',
    desc: 'text to speech elevenlabs',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        const vnList = [
          'prabowo',
          'yanzgpt',
          'bella',
          'megawati',
          'echilling',
          'adam',
          'thomas_shelby',
          'michi_jkt48',
          'nokotan',
          'jokowi',
          'boboiboy',
          'keqing',
          'anya',
          'yanami_anna',
          'MasKhanID',
          'Myka',
          'raiden',
          'CelzoID',
          'dabi'
        ],
              vnTxt = vnList.map(v => `- ${v}`).join('\n')

        if (args.length < 2) {
          return xp.sendMessage(chat.id, { text: `contoh penggunaan:\n.elevenlabs <voice> <text>\ndaftar voice:\n${vnTxt}` }, { quoted: m })
        }

        const [vnRaw, ...txtPart] = args,
              vnLow = vnRaw.toLowerCase(),
              txtLn = txtPart.join(' '),
              pitch = 0,
              speed = 0.9,
              url = await fetch(`${termaiWeb}/api/text2speech/elevenlabs?text=${encodeURIComponent(txtLn)}&voice=${vnLow}&pitch=${pitch}&speed=${speed}&key=${termaiKey}`)

        if (!vnList.includes(vnLow)) {
          return xp.sendMessage(chat.id, { text: `voice tidak valid\nlist voice:\n${vnTxt}`})
        }

        if (!url.ok) throw new Error(`HTTP ${url.status}`)

        const audio = Buffer.from(await url.arrayBuffer())
        await vn(xp, chat.id, audio, m)
      } catch (e) {
        err('error pada elevenlabs', e)
        call(xp, e, m)
      }
    }
  })

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
    name: 'cekdompet',
    cmd: ['cekdompet'],
    tags: 'Fun Menu',
    desc: 'mengecek dompet orang',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              target = quoted?.participant || quoted?.mentionedJid?.[0],
              user = target || m.key?.participant,
              getUser = Object.values(db().key).find(u => u.jid === user)


        if (!getUser) {
          return xp.sendMessage(chat.id, { text: 'pengguna belum terdaftar di database' }, { quoted: m })
        }

        const moneyDb = getUser?.money ?? 0,
              mention = user.replace(/@s\.whatsapp\.net$/, ''),
              fmtMoney = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR'}).format(moneyDb),
              txt = `Hasil investigasi dari dompet @${mention}\n${fmtMoney} ditemukan`

        await xp.sendMessage(chat.id, { text: txt, mentions: [user] }, { quoted: m })
      } catch (e) {
        err('error pada cekdompet', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'cekdosa',
    cmd: ['cekdosa'],
    tags: 'Fun Menu',
    desc: 'mengecek 10 dosa besar orang',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              target = quoted?.participant || quoted?.mentionedJid?.[0] || m.key.participant,
              { cekDosa } = await global.func(),
              listDosa = [...cekDosa].sort(() => Math.random() - .5).slice(0, 10),
              user = target.replace(/@s\.whatsapp\.net$/, '')

        let teks = `Top 10 dosa besar @${user}\n`
        listDosa.forEach((d, i) => teks += `${i + 1}. ${d}\n`)

        await xp.sendMessage(chat.id, { text: teks.trim(), mentions: [target] }, { quoted: m })
      } catch (e) {
        err('error pada cekdosa', e)
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
    name: 'cekiq',
    cmd: ['cekiq'],
    tags: 'Fun Menu',
    desc: 'mengecek iq orang',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              user = quoted?.participant || quoted?.mentionedJid?.[0] || m.key?.participant || chat.id,
              target = user.replace(/@s\.whatsapp\.net$/, ''),
              rand = Math.floor(Math.random() * 3.4e1) + 7.4e1,
              persen = rand <= 81 ? 81 : rand <= 87 ? 87 : rand <= 94 ? 94 : rand <= 100 ? 100 : 107,
              txt = persen === 81 ? 'IQ rendah tapi masih normal' :
                    persen === 87 ? 'IQ lumayan, masih bisa mikir' :
                    persen === 94 ? 'IQ standar manusia cerdas' :
                    persen === 100 ? 'IQ di atas rata-rata' :
                                     'IQ jenius tingkat dewa',
              teks = `@${target} IQ kamu *${persen}*\n${txt}`

        await xp.sendMessage(chat.id, { text: teks, mentions: [user] }, { quoted: m })
      } catch (e) {
        err('error pada cekiq', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'cekjodoh',
    cmd: ['cekjodoh'],
    tags: 'Fun Menu',
    desc: 'cek kecocokan jodoh orang',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        if (!chat.group) return xp.sendMessage(chat.id, { text: 'fitur ini hanya bisa digunakan di grup' }, { quoted: m })

        const quoted = m.message?.extendedTextMessage?.contextInfo,
              tags = quoted?.mentionedJid || [],
              reply = quoted?.participant,
              user = m.key?.participant,
              metadata = groupCache.get(chat.id) || await xp.groupMetadata(chat.id)

        if (!metadata) throw new Error('gagal mengambil metadata')

        const target = metadata.participants.map(v => v.id).filter(id => id !== xp.user.id)

        const mention = tags.length >= 2 ? tags
                      : tags.length === 1 ? [tags[0]]
                      : reply ? [reply]
                      : []

        const persen = (Math.floor(Math.random() * 1e2) + 1),
              randomPick = (list, exclude = []) => {
                const f = list.filter(id => !exclude.includes(id)),
                      i = Math.floor(Math.random() * f.length)
                return f[i]
              },
              cnd = persen <= 17 ? 'gak cocok² amat'
                  : persen <= 34 ? 'lumayan cocok'
                  : persen <= 51 ? 'jodoh\nbilangnya enggak aslinya salting'
                  : persen <= 67 ? 'cocok banget tinggal jadian aja'
                  : persen <= 84 ? 'udah jadian\nini sih udah sering gandengan tangan'
                  : persen <= 93 ? 'udah lamaran\nfiks besok nikah diem²'
                  : 'udah nikah tinggal ngueu aja'

        const tgr1 = mention.length >= 1 ? mention[0] : randomPick(target),
              tgr2 = mention.length >= 2 ? mention[1] : randomPick(target, [tgr1])

        const name1 = tgr1.split('@')[0],
              name2 = tgr2.split('@')[0],
              teks = `@${name1} ❤️ @${name2} ${persen}% ${cnd}`

        await xp.sendMessage(chat.id, { text: teks, mentions: [tgr1, tgr2] }, { quoted: m })
      } catch (e) {
        err('error pada cekjodoh', e)
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
    name: 'ceklesbi',
    cmd: ['ceklesbi'],
    tags: 'Fun Menu',
    desc: 'mengecek seberapa lesbi orang',
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

        let txt = persen <= 17 ? 'masih aman mbak' :
                  persen <= 34 ? 'agak agak sih' :
                  persen <= 51 ? 'agak lain sih' :
                  persen <= 67 ? 'lesbi banget lho ya' :
                  persen <= 84 ? 'gangguan jiwa' :
                  persen <= 93 ? 'fiks lesbi' : 'orang gila',
            teks = `@${target} ${persen}%\n${txt}`

        await xp.sendMessage(chat.id, { text: teks, mentions: [user] }, { quoted: m })
      } catch (e) {
        err('error pada ceklesbi', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'cekmesum',
    cmd: ['cekmesum'],
    tags: 'Fun Menu',
    desc: 'cek seberapa mesum orang',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              target = quoted?.participant || quoted?.mentionedJid?.[0],
              user = target || m.key?.participant,
              mention = user.replace(/@s\.whatsapp\.net$/, ''),
              persen = Math.floor(Math.random() * 101)

        let txt = persen <= 17 ? 'masih aman' :
                  persen <= 34 ? 'agak agak sih' :
                  persen <= 51 ? 'mencurigakan' :
                  persen <= 67 ? 'cabul banget jir' :
                  persen <= 84 ? 'dasar mesum' :
                  persen <= 93 ? 'fiks cabul' : 'orang gila',
            teks = `@${mention} ${persen}% ${txt}`

        await xp.sendMessage(chat.id, { text: teks, mentions: [user] }, { quoted: m })
      } catch (e) {
        err('error pada cekmesum', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'cekpedo',
    cmd: ['cekpedo'],
    tags: 'Fun Menu',
    desc: 'cek seberapa pedo orang',
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

        let txt = persen <= 17 ? 'masih aman' :
                  persen <= 34 ? 'mencurigakan' :
                  persen <= 51 ? 'tanda² pedo' :
                  persen <= 67 ? 'pedo banget' :
                  persen <= 84 ? 'fiks pedo' :
                  persen <= 93 ? 'pedo,\nlapor fbi' : 'orang gila',
            teks = `@${target} ${persen}%\n${txt}`

        await xp.sendMessage(chat.id, { text: teks, mentions: [user] }, { quoted: m })
      } catch (e) {
        err('error pada cekpedo', e)
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