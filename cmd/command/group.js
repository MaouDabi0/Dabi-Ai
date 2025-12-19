import { groupCache } from '../../system/function.js'
import { init, saveGc, gc, getGc } from '../../system/db/data.js'
import { isJidGroup } from 'baileys'

export default function group(ev) {
  ev.on({
    name: 'antich',
    cmd: ['antich'],
    tags: 'Group Menu',
    desc: 'mengatur fitur anti saluran/ch',
    owner: !1,
    prefix: !0,
    money: 100,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        if (!chat.group) return xp.sendMessage(chat.id, { text: 'perintah ini hanya bisa digunakan digrup' }, { quoted: m })

        const gcData = getGc(chat),
              { usrAdm, botAdm } = await grupify(xp, chat.id, chat.sender)

        if (!gcData || !usrAdm || !botAdm) {
          return xp.sendMessage(chat.id, { text: !gcData ? `grup ini belum terdaftar ketik ${prefix}daftargc untuk mendaftar` : !usrAdm ? 'kamu bukan admin' : 'aku bukan admin' }, { quoted: m })
        }

        const input = args[0]?.toLowerCase(),
              type = v => v ? 'Aktif' : 'Tidak',
              modech = type(gcData?.filter?.antich)

        if (!input || !['on', 'off'].includes(input)) {
          return xp.sendMessage(chat.id, { text: `gunakan:\n ${prefix}${cmd} on/off\n\nantich: ${modech}` }, { quoted: m })
        }

        (gcData.filter ??= {}).antich = input === 'on'
        saveGc()

        await xp.sendMessage(chat.id, { text: `antich berhasil di-${input === 'on' ? 'aktifkan' : 'nonaktifkan'}` }, { quoted: m })
      } catch (e) {
        err('error pada antich', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'antibadword',
    cmd: ['antibadword', 'badword'],
    tags: 'Group Menu',
    desc: 'mengatur fitur anti badword dalam grup',
    owner: !1,
    prefix: !0,
    money: 100,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix,
      text
    }) => {
      try {
        if (!chat.group)
          return xp.sendMessage(chat.id, { text: 'perintah ini hanya bisa digunakan digrup' }, { quoted: m })

        const gcData = getGc(chat),
              { usrAdm, botAdm } = await grupify(xp, chat.id, chat.sender)

        if (!gcData || !usrAdm || !botAdm || !args[0]) {
          return xp.sendMessage(chat.id, { text: !gcData ? `grup ini belum terdaftar ketik ${prefix}daftargc untuk mendaftar` : !usrAdm ? 'kamu bukan admin' : !botAdm ? 'aku bukan admin' : `masukan input\ncontoh:\n${prefix}${cmd} on → aktifkan antibadword\n${prefix}${cmd} off → nonaktifkan antibadword\n${prefix}${cmd} set <text> → setting antibadword\n${prefix}${cmd} reset → reset antibadword` }, { quoted: m })
        }

        const input = args[0].toLowerCase()

        gcData.filter = gcData.filter || {}
        gcData.filter.badword = gcData.filter.badword || {
          antibadword: !1,
          badwordtext: []
        }

        if (input === 'on' || input === 'off')
          return gcData.filter.badword.antibadword = input === 'on',
          saveGc(),
          await xp.sendMessage(chat.id, { text: `antibadword ${input === 'on' ? 'diaktifkan' : 'dinonaktifkan'}` }, { quoted: m })

        if (input === 'set' || input === 'reset') {
          if (input === 'set') {
            let txt = args.slice(1).join(' ').trim()

            if (!txt)
              return xp.sendMessage(chat.id, {text: `masukan kata-kata kasar nya\ncontoh: ${prefix}${cmd} set bahlil` }, { quoted: m })

            if (!Array.isArray(gcData.filter.badword.badwordtext))
              gcData.filter.badword.badwordtext = []

            if (!gcData.filter.badword.badwordtext.includes(txt))
              gcData.filter.badword.badwordtext.push(txt)

            gcData.filter.badword.antibadword = !0
            saveGc()

            await xp.sendMessage(chat.id, { text: `kata "${txt}" berhasil ditambahkan ke blacklist` }, { quoted: m })
          } else if (input === 'reset') {
            gcData.filter.badword.antibadword = !1
            gcData.filter.badword.badwordtext = []
            saveGc()

            await xp.sendMessage(chat.id, { text: 'badword berhasil direset' }, { quoted: m })
          }
        }
      } catch (e) {
        err('error pada antibadword', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'antilink',
    cmd: ['antilink'],
    tags: 'Group Menu',
    desc: 'anti link grup',
    owner: !1,
    prefix: !0,
    money: 100,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        const gcData = getGc(chat),
              { usrAdm, botAdm } = await grupify(xp, chat.id, chat.sender)

        if (!chat.group || !gcData || !usrAdm || !botAdm) {
          return xp.sendMessage(chat.id, { text: !chat.group ? 'perintah ini hanya bisa dijalankan digrup' : !gcData ? `grup ini belum terdaftar ketik ${prefix}daftargc untuk mendaftar` : !usrAdm ? 'kamu bukan admin' : 'aku bukan admin' }, { quoted: m })
        }

        const input = args[0]?.toLowerCase(),
              type = v => v ? 'Aktif' : 'Tidak',
              modelink = type(gcData?.filter?.antilink)

        if (!input || !['on', 'off'].includes(input)) {
          return xp.sendMessage(chat.id, { text: `gunakan:\n ${prefix}${cmd} on/off\n\nantilink: ${modelink}` }, { quoted: m })
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
    money: 100,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        const gcData = getGc(chat),
              { usrAdm, botAdm } = await grupify(xp, chat.id, chat.sender)

        if (!chat.group || !gcData || !usrAdm || !botAdm) {
          return xp.sendMessage(chat.id, { text: !chat.group ? 'perintah ini hanya bisa dijalankan digrup' : !gcData ? `grup ini belum terdaftar ketik ${prefix}daftargc untuk mendaftar` : !usrAdm ? 'kamu bukan admin' : 'aku bukan admin' }, { quoted: m })
        }

        const input = args[0]?.toLowerCase(),
              type = v => v ? 'Aktif' : 'Tidak',
              modetagsw = type(gcData?.filter?.antitagsw)

        if (!input || !['on', 'off'].includes(input)) {
          return xp.sendMessage(chat.id, { text: `gunakan:\n${cmd}${prefix} on/off\n\nantitagsw: ${modetagsw}` }, { quoted: m })
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
    money: 100,
    exp: 0.1,

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
    money: 300,
    exp: 0.1,

    run: async (xp, m, {
      chat
    }) => {
      try {
        if (!chat.group) {
          return xp.sendMessage(chat.id, { text: 'perintah ini hanya bisa digunakan digrup' }, { quoted: m })
        }

        init.gc

        const gcData = getGc(chat)

        if (gcData) {
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
            antich: !1,
            badword: {
              antibadword: !1,
              badwordtext: []
            },
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
    money: 50,
    exp: 0.1,

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
    money: 100,
    exp: 0.1,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              target = quoted?.mentionedJid?.[0] || quoted?.participant,
              { usrAdm, botAdm } = await grupify(xp, chat.id, chat.sender)

        if (!usrAdm || !botAdm || !target) {
          return xp.sendMessage(chat.id, { text: !usrAdm ? 'kamu bukan admin' : !botAdm ? 'aku bukan admin' : 'reply atau tag nomor yang ingin diturunkan jabatannya' }, { quoted: m })
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
    money: 500,
    exp: 0.1,

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
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const gcData = getGc(chat),
              w = gcData?.filter?.welcome,
              txt = w?.welcomeText?.trim() || 'halo selamat datang',
              wlcOn = w?.welcomeGc === true;

        if (!chat.group || !gcData || !wlcOn) {
          return xp.sendMessage(chat.id, { text: !chat.group ? 'perintah ini hanya bisa dijalankan digrup' : !gcData ? `grup ini belum terdaftar ketik ${prefix}daftargc untuk mendaftar` : `fitur welcome off ketik ${prefix}welcome on untuk mengaktifkan` }, { quoted: m })
        }

        await xp.sendMessage(chat.id, { text: txt }, { quoted: m })
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
    money: 1500,
    exp: 0.1,

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
    money: 100,
    exp: 0.1,

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
    name: 'left',
    cmd: ['left'],
    tags: 'Group Menu',
    desc: 'seting left outro',
    owner: !1,
    prefix: !0,
    money: 100,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix,
      text
    }) => {
      try {
        if (!chat.group) return xp.sendMessage(chat.id, { text: 'perintah ini hanya bisa dijalankan digrup' }, { quoted: m })

        const gcData = getGc(chat),
              choice = args[0]?.toLowerCase(),
              quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation,
              { usrAdm, botAdm } = await grupify(xp, chat.id, chat.sender)

        if (!gcData || !usrAdm || !botAdm) {
          return xp.sendMessage(chat.id, { text: !gcData ? `grup ini belum terdaftar ketik ${prefix}daftargc untuk mendaftar` : !usrAdm ? 'kamu bukan admin' : 'aku bukan admin' }, { quoted: m })
        }

        gcData.filter = gcData.filter || { left: { leftGc: !1, leftText: '' } }

        const lft = gcData.filter.left

        if (!choice) {
          return xp.sendMessage(chat.id, { text: `contoh:\n${prefix}${cmd} on → aktifkan left\n${prefix}${cmd} off → nonaktifkan left\n${prefix}${cmd} set <text> → setting left\n${prefix}${cmd} reset → reset left text` }, { quoted: m })
        }

        if (choice === 'on' || choice === 'off') return lft.leftGc = choice === 'on' ? !0 : !1,
        saveGc(),
        xp.sendMessage(chat.id, { text: `left ${choice === 'on' ? 'diaktifkan' : 'dinonaktifkan'}` }, { quoted: m })

        if (choice === 'set' || choice === 'reset') {
          if (choice === 'set') {
            let lftTxt = text.replace(/^[^\s]+\s*left\s+set/i, "").trim() || quoted
            if (!lftTxt) {
              return xp.sendMessage(chat.id, { text: 'masukan/reply pesan selamat tinggalnya' }, { quoted: m })
            }

            lft.leftGc = !0
            lft.leftText = lftTxt
            saveGc()

            await xp.sendMessage(chat.id, { text: `pesan selamat datang diperbaharui\n${lftTxt}` }, { quoted: m })
          } else if (choice === 'reset') {
            lft.leftGc = !1
            lft.leftText = ''
            saveGc()

            await xp.sendMessage(chat.id, { text: 'welcome berhasil direset' }, { quoted: m })
          }
        }
      } catch (e) {
        err('error pada left', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'mute',
    cmd: ['mute'],
    tags: 'Group Menu',
    desc: 'setting mute grup',
    owner: !1,
    prefix: !0,
    money: 100,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        if (!chat.group) return xp.sendMessage(chat.id, { text: 'perintah ini hanya bisa digunakan digrup' }, { quoted: m })

        const input = args.join(' '),
              gcData = getGc(chat),
              type = v => v ? 'Aktif' : 'Tidak',
              mute = type(gcData?.filter?.mute)

        if (!input || !gcData) {
          return xp.sendMessage(chat.id, { text: !input ? `contoh:\n${prefix}${cmd} on/off\n\nmute: ${mute}` : `grup ini belum terdaftar, ketik ${prefix}daftargc untuk mendaftar` }, { quoted: m })
        }

        if (input === 'on' || input === 'off') {
          return gcData.filter.mute = input === 'on' ? !0 : !1,
          saveGc()

          await xp.sendMessage(chat.id, { text: `mute ${input === 'on' ? 'diaktifkan' : 'dinonaktifkan'}` }, { quoted: m })
        }
      } catch (e) {
        err('error pada mute', e)
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
    money: 100,
    exp: 0.1,

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
    money: 50,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
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
          text += `Ketik: ${prefix}${cmd} <nomor atau id grup>\nContoh:\n${prefix}${cmd} 1\n${prefix}${cmd} 628xxx-xxx@g.us`
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
    money: 100,
    exp: 0.1,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              target = quoted?.mentionedJid?.[0] || quoted?.participant,
              { usrAdm, botAdm } = await grupify(xp, chat.id, chat.sender)

        if (!usrAdm || !botAdm || !target) {
          return xp.sendMessage(chat.id, { text: !usrAdm ? 'kamu bukan admin' : !botAdm ? 'aku bukan admin' : 'reply atau tag nomor yang ingin dijadikan admin' }, { quoted: m })
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
    money: 50,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix,
      text
    }) => {
      try {
        const gcData = getGc(chat),
              choice = args[0]?.toLowerCase(),
              { usrAdm, botAdm } = await grupify(xp, chat.id, chat.sender),
              quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation

        if (!chat.group || !gcData || !usrAdm || !botAdm) {
          return xp.sendMessage(chat.id, { text: !chat.group ? 'perintah ini hanya bisa digunakan digrup' : !gcData ? `grup ini belum terdaftar ketik ${prefix}daftargc untuk mendaftar` : !usrAdm ? 'kamu bukan admin' : 'aku bukan admin' }, { quoted: m })
        } 

        gcData.filter = gcData.filter || { welcome: { welcomeGc: !1, welcomeText: '' } }

        const wlc = gcData.filter.welcome

        if (!choice) {
          return xp.sendMessage(chat.id, { text: `contoh:\n${prefix}${cmd} on → aktifkan welcome\n${prefix}${cmd} off → nonaktifkan welcome\n${prefix}${cmd} set <text> → setting welcome\n${prefix}${cmd} reset → reset welcome` }, { quoted: m })
        }

        if (choice === 'on' || choice === 'off') return wlc.welcomeGc = choice === 'on' ? !0 : !1,
        saveGc(),
        xp.sendMessage(chat.id, { text: `welcome ${choice === 'on' ? 'diaktifkan' : 'dinonaktifkan'}` }, { quoted: m })

        if (choice === 'set' || choice === 'reset') {
          if (choice === 'set') {
            let wlcTxt = text.replace(/^[^\s]+\s*welcome\s+set/i, "").trim() || quoted
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