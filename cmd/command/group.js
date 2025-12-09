import { groupCache } from '../../system/function.js'
import { init, saveGc, gc, getGc } from '../../system/db/data.js'
import { isJidGroup } from 'baileys'

export default function group(ev) {
  ev.on({
    name: 'antilink',
    cmd: ['antilink'],
    tags: 'Group Menu',
    desc: 'anti link grup',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        const gcData = getGc(chat),
              { usrAdm, botAdm } = await grupify(xp, chat.id, chat.sender)

        if (!chat.group || !gcData || !usrAdm || !botAdm) {
          return xp.sendMessage(
            chat.id,
            {
              text:
                !chat.group
                  ? 'perintah ini hanya bisa dijalankan digrup'
                  : !gcData
                  ? 'grup ini belum terdaftar ketik .daftargc untuk mendaftar'
                  : !usrAdm
                  ? 'kamu bukan admin'
                  : 'aku bukan admin'
            },
            { quoted: m }
          )
        }

        const input = args[0]?.toLowerCase()

        if (!input || !['on', 'off'].includes(input)) {
          return xp.sendMessage(chat.id, { text: 'gunakan:\n.antilink on/off' }, { quoted: m })
        }

        (gcData.filter ??= {}).antilink = input === 'on'
        saveGc()

        await xp.sendMessage(chat.id, { text: `antilink berhasil di-${input === 'on' ? 'aktifkan' : 'nonaktifkan'}` }, { quoted: m })
      } catch (e) {
        err('error pada antilink', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'antitagsw',
    cmd: ['antitagsw', 'tagsw'],
    tags: 'Group Menu',
    desc: 'anti tag status digrup',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        const gcData = getGc(chat),
              { usrAdm, botAdm } = await grupify(xp, chat.id, chat.sender)

        if (!chat.group || !usrAdm || !botAdm || !gcData) {
          return xp.sendMessage(
            chat.id,
            {
              text: !chat.group 
                ? 'perintah ini hanya bisa digunakan digrup'
                : !usrAdm
                ? 'kamu bukan admin'
                : !botAdm
                ? 'aku bukan admin'
                : !gcData
                ? 'grup ini belum terdaftar ketik .daftargc untuk mendaftar'
                : ''
            },
            { quoted: m }
          )
        }

        const input = args[0]?.toLowerCase()

        if (!input || !['on', 'off'].includes(input)) {
          return xp.sendMessage(chat.id, { text: 'gunakan:\n.antitagsw on/off' }, { quoted: m })
        }

        (gcData.filter ??= {}).antitagsw = input === 'on'
        saveGc()

        await xp.sendMessage(chat.id, { text: `antitagsw di${input === 'on' ? 'aktifkan' : 'nonaktifkan'}` }, { quoted: m })
      } catch (e) {
        err('error pada antitagsw', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'close',
    cmd: ['tutup', 'close'],
    tags: 'Group Menu',
    desc: 'menutup grup',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        if (!chat.group) {
          return xp.sendMessage(chat.id, { text: 'Perintah ini hanya untuk grup' }, { quoted: m })
        }

        const { botAdm, usrAdm } = await grupify(xp, chat.id, chat.sender)

        if (!botAdm || !usrAdm) {
          return xp.sendMessage(chat.id, { text: !botAdm ? 'aku bukan admin' : 'kamu bukan admin' }, { quoted: m })
        }

        await xp.groupSettingUpdate(chat.id, 'announcement')
      } catch (e) {
        err('error pada close', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'daftargc',
    cmd: ['daftargc'],
    tags: 'Group Menu',
    desc: 'mendaftarkan grup ke database',
    owner: !0,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        if (!chat.group) {
          return xp.sendMessage(chat.id, { text: 'perintah ini hanya bisa digunakan digrup' }, { quoted: m })
        }

        init.gc

        if (getGc(gc(), chat.id)) {
          return xp.sendMessage(chat.id, { text: 'grup ini sudah terdaftar' }, { quoted: m })
        }

        const cache = groupCache.get(chat.id) || await xp.groupMetadata(chat.id),
              groupName = cache.subject,
              gcInfo = cache;

        gc().key[groupName] = {
          id: chat.id,
          ban: !1,
          member: gcInfo.participants?.length || 0,
          filter: {
            mute: !1,
            antilink: !1,
            antitagsw: !1,
            left: {
              leftGc: !1,
              leftText: ''
            },
            welcome: {
              welcomeGc: !1,
              welcomeText: ''
            }
          }
        }

        saveGc()
        xp.sendMessage(chat.id, { text: `grup *${groupName}* berhasil didaftarkan` }, { quoted: m })
      } catch (e) {
        err('error pada daftargc', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'delete',
    cmd: ['d', 'del', 'delete'],
    tags: 'Group Menu',
    desc: 'menghapus pesan di group',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              reply = quoted?.quotedMessage,
              mKey = quoted?.stanzaId,
              user = quoted?.participant

        if (!reply || !mKey || !user) {
          return xp.sendMessage(chat.id, { text: 'reply chat yang ingin dihapus' }, { quoted: m })
        }

        const botNum = `${xp.user.id.split(':')[0]}@s.whatsapp.net`,
              fromBot = user === botNum,
              { botAdm, usrAdm } = await grupify(xp, chat.id, chat.sender)

        if (!fromBot && !usrAdm) return xp.sendMessage(chat.id, { text: 'kamu bukan admin' }, { quoted: m })
        if (!fromBot && !botAdm) return xp.sendMessage(chat.id, { text: 'aku bukan admin' }, { quoted: m })

        await xp.sendMessage(chat.id, { delete: { remoteJid: chat.id, fromMe: fromBot, id: mKey, ...(fromBot? {} : { participant: user }) } })
      } catch (e) {
        err('error pada delete', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'demote',
    cmd: ['demote'],
    tags: 'Group Menu',
    desc: 'menurunkan admin',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              target = quoted?.mentionedJid?.[0] || quoted?.participant,
              { usrAdm, botAdm } = await grupify(xp, chat.id, chat.sender)

        if (!usrAdm || !botAdm) {
          return xp.sendMessage(chat.id, { text: !usrAdm ? 'kamu bukan admin' : 'aku bukan admin' }, { quoted: m })
        }

        if (!target) {
          return xp.sendMessage(chat.id, { text: 'reply atau tag nomor yang ingin dijadikan admin' }, { quoted: m })
        }

        await xp.groupParticipantsUpdate(chat.id, [target], 'demote')

        await xp.sendMessage(chat.id, { react: { text: '✅', key: m.key } })
      } catch (e) {
        err('error pada demote', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'hidetag',
    cmd: ['h', 'hidetag'],
    tags: 'Group Menu',
    desc: 'tag all member',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              reply = quoted?.conversation,
              { botAdm, usrAdm } = await grupify(xp, chat.id, chat.sender),
              text = args.join(' '),
              fallback = reply || text,
              gcInfo = groupCache.get(chat.id) || await xp.groupMetadata(chat.id),
              all = gcInfo.participants.map(v => v.id)

        if (!chat.group || !usrAdm || !botAdm || !fallback)
          return !chat.group
            ? xp.sendMessage(chat.id, { text: 'perintah ini hanya bisa dijalankan di grup' }, { quoted: m })
            : !usrAdm
            ? xp.sendMessage(chat.id, { text: 'kamu bukan admin' }, { quoted: m })
            : !botAdm
            ? xp.sendMessage(chat.id, { text: 'aku bukan admin' }, { quoted: m })
            : xp.sendMessage(chat.id, { text: 'hidetag tidak boleh kosong' }, { quoted: m })

        xp.sendMessage(chat.id, { text: fallback, mentions: all }, { quoted: m })
      } catch (e) {
        err('error pada hidetag', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'intro',
    cmd: ['intro'],
    tags: 'Group Menu',
    desc: 'melihat intro grup',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const gcData = getGc(chat),
              w = gcData?.filter?.welcome,
              txt = w?.welcomeText?.trim() || 'halo selamat datang',
              wlcOn = w?.welcomeGc === true;

        if (!chat.group || !gcData || !wlcOn) {
          return xp.sendMessage(
            chat.id,
            {
              text: !chat.group
                ? 'perintah ini hanya bisa dijalankan digrup'
                : !gcData
                  ? 'grup ini belum terdaftar'
                  : !wlcOn
                    ? 'fitur welcome off ketik .welcome untuk mengaktifkan'
                    : ''
            },
            { quoted: m }
          )
        }

        xp.sendMessage(chat.id, { text: txt }, { quoted: m })

      } catch (e) {
        err('error pada intro', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'joingc',
    cmd: ['join', 'masuk', 'joingc'],
    tags: 'Group Menu',
    desc: 'memasukkan bot ke grup dengan link',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat,
      args
    }) => {
      try {
        let prompt = args.join(' '),
            quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage

        if (quoted) prompt = quoted.conversation 
                        || quoted.extendedTextMessage?.text 
                        || quoted.extendedTextMessage?.prompt 
                        || prompt

        const match = prompt?.match(/chat\.whatsapp\.com\/([\w\d]+)/)
        if (!match) return xp.sendMessage(chat.id, { text: prompt ? 'Link grup tidak valid' : 'Link grupnya mana?' }, { quoted: m })

        const res = await xp.groupAcceptInvite(match[1]),
              text = isJidGroup(res) 
                ? `Berhasil masuk ke grup dengan ID: ${res}` 
                : 'Undangan diterima, menunggu persetujuan admin'

        return xp.sendMessage(chat.id, { text }, { quoted: m })

      } catch (e) {
        err('Error pada joingc:', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'kick',
    cmd: ['kick', 'dor'],
    tags: 'Group Menu',
    desc: 'mengeluarkan orang dari grup',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        if (!chat.group) return xp.sendMessage(chat.id, { text: 'perintah ini hanya bisa dijalankan di grup' }, { quoted: m })

        const { botAdm, usrAdm, adm } = await grupify(xp, chat.id, chat.sender),
              quoted = m.message?.extendedTextMessage?.contextInfo,
              target = quoted?.mentionedJid?.[0] || quoted?.participant

        if (!usrAdm || !botAdm || !target || adm.includes(target)) {
          const txt = !usrAdm ? 'kamu bukan admin'
                    : !botAdm ? 'aku bukan admin'
                    : !target ? 'reply/tag orang yang akan dikeluarkan'
                    : 'tidak bisa mengeluarkan admin'
          return xp.sendMessage(chat.id, { text: txt }, { quoted: m })
        }

        await xp.groupParticipantsUpdate(chat.id, [target], 'remove')
          .catch(() => xp.sendMessage(chat.id, { text: 'gagal mengeluarkan anggota' }, { quoted: m }))
      } catch (e) {
        err('error pada kick', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'open',
    cmd: ['buka', 'open'],
    tags: 'Group Menu',
    desc: 'membuka grup',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        if (!chat.group) {
          return xp.sendMessage(chat.id, { text: 'perintah ini hanya untuk grup' }, { quoted: m })
        }

        const { botAdm, usrAdm } = await grupify(xp, chat.id, chat.sender)

        if (!botAdm || !usrAdm) {
          return xp.sendMessage(chat.id, { text: !botAdm ? 'aku bukan admin' : 'kamu bukan admin' }, { quoted: m })
        }

        await xp.groupSettingUpdate(chat.id, 'not_announcement');
      } catch (e) {
        err('error pada open', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'outgc',
    cmd: ['out', 'keluar', 'outgc'],
    tags: 'Group Menu',
    desc: 'mengeluarkan bot dari grup',
    owner: !0,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        const gc = await xp.groupFetchAllParticipating(),
              gcList = Object.values(gc)

        if (!gcList.length)
          return xp.sendMessage(chat.id, { text: 'Tidak ada grup yang diikuti bot.' }, { quoted: m })

        if (!args.length) {
          let text = '*Daftar Grup Bot:*\n\n'
          gcList.forEach((g, i) => {
            text += `${i + 1}. ${g.subject}\nID: ${g.id}\n\n`
          })
          text += 'Ketik: .outgc <nomor atau id grup>\nContoh:\n.outgc 1\n.outgc 628xxx-xxx@g.us'
          return xp.sendMessage(chat.id, { text }, { quoted: m })
        }

        const input = args[0]
        let target = null

        if (/^\d+$/.test(input)) {
          const i = parseInt(input, 10) - 1
          if (i >= 0 && i < gcList.length) target = gcList[i].id
        } else if (input.endsWith('@g.us')) {
          target = gcList.find(g => g.id === input)?.id
        }

        if (!target || !target.endsWith('@g.us'))
          return xp.sendMessage(chat.id, { text: !target ? 'Grup tidak ditemukan.' : 'ID grup tidak valid.' }, { quoted: m })

        await xp.groupLeave(target)
        xp.sendMessage(chat.id, { text: `Bot berhasil keluar dari grup:\n${target}` }, { quoted: m })

      } catch (e) {
        err('error pada outgc', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'promote',
    cmd: ['promote'],
    tags: 'Group Menu',
    desc: 'menjadikan member sebagai admin',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              target = quoted?.mentionedJid?.[0] || quoted?.participant,
              { usrAdm, botAdm } = await grupify(xp, chat.id, chat.sender)

        if (!usrAdm || !botAdm) {
          return xp.sendMessage(chat.id, { text: !usrAdm ? 'kamu bukan admin' : 'aku bukan admin' }, { quoted: m })
        }

        if (!target) {
          return xp.sendMessage(chat.id, { text: 'reply atau tag nomor yang ingin dijadikan admin' }, { quoted: m })
        }

        await xp.groupParticipantsUpdate(chat.id, [target], 'promote')

        await xp.sendMessage(chat.id, { react: { text: '✅', key: m.key } })
      } catch (e) {
        err('error pada promote', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'welcome',
    cmd: ['welcome'],
    tags: 'Group Menu',
    desc: 'set welcome grup',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat,
      text
    }) => {
      try {
        const gcData = getGc(chat),
              choice = args[0]?.toLowerCase(),
              { usrAdm, botAdm } = await grupify(xp, chat.id, chat.sender),
              quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              reply = quoted?.conversation

        if (!chat.group || !gcData) {
          return xp.sendMessage(chat.id, { text: !chat.group ? 'perintah ini hanya bisa digunakan digrup' : 'grup ini belum terdaftar' }, { quoted: m })
        }

        if (!usrAdm || !botAdm) {
          return xp.sendMessage(chat.id, { text: !usrAdm ? 'kamu bukan admin' : 'aku bukan admin' }, { quoted: m })
        }

        gcData.filter = gcData.filter || { welcome: { welcomeGc: !1, welcomeText: '' } }

        const wlc = gcData.filter.welcome

        if (!choice) {
          return xp.sendMessage(chat.id, { text: 'contoh:\n.welcome on → aktifkan welcome\n.welcome off → nonaktifkan welcome\n.welcome set <text> → setting welcome\n.welcome reset → reset welcome' }, { quoted: m })
        }

        if (choice === 'on' || choice === 'off') return wlc.welcomeGc = choice === 'on' ? !0 : !1,
        saveGc(),
        xp.sendMessage(chat.id, { text: `welcome ${choice === 'on' ? 'diaktifkan' : 'dinonaktifkan'}` }, { quoted: m })

        if (choice === 'set' || choice === 'reset') {
          if (choice === 'set') {
            let wlcTxt = text.replace(/^[^\s]+\s*welcome\s+set/i, "").trim() || reply
            if (!wlcTxt) {
              return xp.sendMessage(chat.id, { text: 'masukan/reply pesan selamat datangnya' }, { quoted: m })
            }

            wlc.welcomeGc = !0
            wlc.welcomeText = wlcTxt
            saveGc()

            return xp.sendMessage(chat.id, { text: `pesan selamat datang diperbaharui\n${wlcTxt}` }, { quoted: m })
          } else if (choice === 'reset') {
            wlc.welcomeGc = !1
            wlc.welcomeText = ''
            saveGc()

            return xp.sendMessage(chat.id, { text: 'welcome berhasil direset' }, { quoted: m })
          }
        }
      } catch (e) {
        err('error pada welcome', e)
        call(xp, e, m)
      }
    }
  })
}