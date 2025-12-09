import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { performance } from 'perf_hooks'
import moment from 'moment-timezone'
import { getGc, saveGc} from '../../system/db/data.js'
import { groupCache } from '../../system/function.js'
import os from 'os'

export default function info(ev) {
  ev.on({
    name: 'cekgc',
    cmd: ['cekgc'],
    tags: 'Info Menu',
    desc: 'mengecek status grup',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const gcData = getGc(chat),
              metadata = groupCache.get(chat.id),
              name = metadata.subject,
              member = metadata.participants.length,
              { usrAdm, botAdm } = await grupify(xp, chat.id, chat.sender),
              defThumb = 'https://c.termai.cc/i0/7DbG.jpg'

        if (!chat.group || !gcData || !usrAdm || !botAdm) {
          return xp.sendMessage(
            chat.id,
            {
              text: !chat.group
                ? 'perintah ini hanya bisa digunakan digrup'
                : !gcData
                  ? 'grup ini belum terdaftar'
                  : !usrAdm
                    ? 'kamu bukan admin'
                    : 'aku bukan admin'
            },
            { quoted: m }
          )
        }

        let txt = `${head} ${opb} *Informasi Grup* ${clb}\n`
            txt += `${body} ${btn} *Nama: ${name}*\n`
            txt += `${body} ${btn} *Id: ${gcData?.id}*\n`
            txt += `${body} ${btn} *Diban: ${gcData?.ban ? 'Iya' : 'Tidak'}*\n`
            txt += `${body} ${btn} *Member: ${gcData?.member}*\n`
            txt += `${foot}${line}\n`
            txt += `${head} ${opb} *Pengaturan Grup* ${clb}\n`
            txt += `${body} ${btn} *Anti Link: ${gcData?.filter?.antilink ? 'Aktif' : 'Tidak'}*\n`
            txt += `${body} ${btn} *Anti TagSw: ${gcData?.filter?.antitagsw ? 'Aktif' : 'Tidak'}*\n`
            txt += `${body} ${btn} *Leave: ${gcData?.filter?.left?.leftGc ? 'Aktif' : 'Tidak'}*\n`
            txt += `${body} ${btn} *Welcome: ${gcData?.filter?.welcome?.welcomeGc ? 'Aktif' : 'Tidak'}*\n`
            txt += `${foot}${line}`

        let thumb = await xp.profilePictureUrl(metadata.id, 'image') || defThumb,
            oldName = name,
            newName = metadata.subject

        await xp.sendMessage(chat.id, {
          text: txt,
          contextInfo: {
            externalAdReply: {
              body: `Ini adalah informasi grup ${name}`,
              thumbnailUrl: thumb,
              mediaType: 1,
              renderLargerThumbnail: !0
            },
            forwardingScore: 1,
            isForwarded: !0,
            forwardedNewsletterMessageInfo: {
              newsletterJid: idCh
            }
          }
        })

        if (gcData.member === metadata?.participants.length) {
          return
        }
        gcData.member = metadata.participants.length
        saveGc()

        if (oldName !== newName) {
          gc().key[newName] = gc().key[oldName]
          delete gc().key[oldName]
          saveGc()
        }
      } catch (e) {
        err('error pada cekgc', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'help',
    cmd: ['help'],
    tags: 'Info Menu',
    desc: 'informasi fitur',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        const text = args[0]?.toLowerCase(),
              cmdFile = path.join(process.cwd(), 'cmd', 'command')

        if (!text) {
          return xp.sendMessage(chat.id, { text: 'gunakan:,\n.help menu' }, { quoted: m })
        }

        const files = fs.readdirSync(cmdFile).filter(f => f.endsWith('.js'))
        let found = null

        for (const file of files) {
          const event = (await import (`file://${path.join(cmdFile, file)}`)).default
          if (typeof event !== 'function') continue

          event({
            on: obj => {
              const name = obj?.name?.toLowerCase(),
                    cmds = Array.isArray(obj?.cmd) ? obj.cmd.map(v => v.toLowerCase()) : []

              if (name === text || cmds.includes(text)) {
                found = obj
              }
            }
          })

          if (found) break
        }

        if (!found) {
          return xp.sendMessage(chat.id, { text: `fitur ${text} tidak ada` }, { quoted: m })
        }

        let txt = `${head} ${opb} *I N F O R M A S I* ${clb}\n`
            txt += `${body} ${btn} *Nama: ${found.name || '-'}*\n`
            txt += `${body} ${btn} *Cmd: ${Array.isArray(found.cmd) ? found.cmd.map(c => '.' + c).join(', ') : '-'}*\n`
            txt += `${body} ${btn} *Tags: ${found.tags || '-'}*\n`
            txt += `${body} ${btn} *Deskripsi: ${found.desc || '-'}*\n`
            txt += `${body} ${btn} *Owner Only: ${found.owner ? 'Ya' : 'Tidak'}*\n`
            txt += `${body} ${btn} *Prefix: ${found.prefix ? 'Ya' : 'Tidak'}*\n`
            txt += `${foot}${line}`

        await xp.sendMessage(chat.id, {
          text: txt,
          contextInfo: {
            externalAdReply: {
              body: `informasi fitur ${found.name}`,
              thumbnailUrl: thumbnail,
              mediaType: 1,
              renderLargerThumbnail: !0,
            },
            forwardingScore: 1,
            isForwarded: !0,
            forwardedNewsletterMessageInfo: {
              newsletterJid: idCh
            }
          }
        }, { quoted: m })
      } catch (e) {
        err('error pada help', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'menu',
    cmd: ['menu'],
    tags: 'Info Menu',
    desc: 'main Menu',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat,
      args
    }) => {
      try {
        const time = global.time.timeIndo('Asia/Jakarta', 'HH:mm'),
              filterTag = args[0]?.toLowerCase(),
              cmds = ev.cmd || [],
              name = chat.pushName || m.pushName || m.key.participant,
              commands = {}

        for (const c of cmds) {
          const tag = c.tags || 'Other',
                name = c.name || (Array.isArray(c.cmd) ? c.cmd[0] : c.cmd)
          commands[tag] ??= []
          name && commands[tag].push(name)
        }

        const allCmd = Object.values(commands).reduce((a, b) => a + b.length, 0)

        let txt =
          `Halo *${name}*, Saya adalah asisten virtual.\n\n` +
          `${head}${opb} *${botName}* ${clb}\n` +
          `${body} ${btn} *Bot Name: ${botFullName}*\n` +
          `${body} ${btn} *Owner: ${ownerName}*\n` +
          `${body} ${btn} *Waktu: ${time}*\n` +
          `${body} ${btn} *All Cmd: ${allCmd}*\n` +
          `${foot}${line}\n${readmore}\n`

        const entries = (filterTag
          ? Object.entries(commands).filter(([cat]) => cat.toLowerCase().includes(filterTag))
          : Object.entries(commands)
        ).sort(([a], [b]) => a.localeCompare(b))

        !entries.length
          ? txt += `${body} Tag *${filterTag}* tidak ditemukan!\n`
          : entries.forEach(([cat, features]) => {
              features.length &&
              (txt +=
                `${head}${opb} *${cat.charAt(0).toUpperCase() + cat.slice(1)}* ${clb}\n` +
                features.map(f => `${body} ${btn} *${f}*`).join('\n') +
                `\n${foot}${line}\n\n`)
            })

        txt += `${footer}`

        await xp.sendMessage(chat.id, {
          text: txt,
          contextInfo: {
            externalAdReply: {
              body: `Ini adalah menu ${botName}`,
              thumbnailUrl: thumbnail,
              mediaType: 1,
              renderLargerThumbnail: !0
            },
            forwardingScore: 1,
            isForwarded: !0,
            forwardedNewsletterMessageInfo: {
              newsletterJid: idCh
            }
          }
        }, { quoted: m })

      } catch (e) {
        err('Error pada menu', e)
      }
    }
  })

  ev.on({
    name: 'owner',
    cmd: ['owner',  'contact'],
    tags: 'Info Menu',
    desc: 'menampilkan kontak owner',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat,
    }) => {
      try {
        const owner = global.ownerName || 'error',
              bot = global.botName || 'error',
              ownerNumber = Array.isArray(global.ownerNumber) ? global.ownerNumber : [global.ownerNumber]

        if (!ownerNumber || !ownerNumber.length) {
          return xp.sendMessage(chat.id, { text: 'tidak ada kontak owner' }, { quoted: m })
        }

        const contact = ownerNumber.map((num, i) => ({ vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${owner} ${i + 1}\nTEL;type=CELL;waid=${num}:${num}\nEND:VCARD` })),
              displayName = ownerNumber.length > 1 ? `${owner} dan ${ownerNumber.length - 1} lainnya` : owner

        await xp.sendMessage(chat.id, { contacts: { displayName, contacts: contact } }, { quoted: m })
        await xp.sendMessage(chat.id, { text: 'ini adalah kontak owner ku' }, { quoted: m })
      } catch (e) {
        err('error pada owner', e)
      }
    }
  })

  ev.on({
    name: 'profile',
    cmd: ['profile', 'me'],
    tags: 'Info Menu',
    desc: 'mengecek profile orang',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const user = m.key?.participant || m.key?.participantAlt || m.key?.id,
              data = Object.values(db().key).find(u => u.jid === user),
              base64 = v => Buffer.from(v).toString('base64'),
              defThumb = 'https://c.termai.cc/i0/7DbG.jpg',
              type = v => v ? 'Aktif' : 'Tidak'

        if (!data) {
          return xp.sendMessage(chat.id, { text: 'kamu belum terdaftar' }, { quoted: m })
        }

        let thumb
        try { thumb = await xp.profilePictureUrl(user, 'image') }
        catch { thumb = defThumb }

        const name = chat.pushName || m.pushName,
              nomor = data.jid,
              noId = base64(data.noId),
              cmd = data.cmd,
              ban = type(data.ban),
              ai = type(data.ai?.bell),
              chatAi = data.ai.chat,
              role = data.ai.role,
              money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR'}).format(data?.money ?? 0)

        let txt = `${head} ${opb} *P R O F I L E* ${clb}\n`
            txt += `${body} ${btn} *Nama:* ${name}\n`
            txt += `${body} ${btn} *Nomor:* ${nomor}\n`
            txt += `${body} ${btn} *No ID:* ${noId}\n`
            txt += `${body} ${btn} *Cmd:* ${cmd}\n`
            txt += `${body} ${btn} *Ban:* ${ban}\n`
            txt += `${body} ${btn} *Money:* ${money}\n`
            txt += `${body}\n`
            txt += `${body} ${btn} *Ai:* ${ai}\n`
            txt += `${body} ${btn} *Chat Ai:* ${chatAi}\n`
            txt += `${body} ${btn} *Role:* ${role}\n`
            txt += `${foot}${line}`

        await xp.sendMessage(chat.id, {
          text: txt,
          contextInfo: {
            externalAdReply: {
              body: `ini profile ${name}`,
              thumbnailUrl: thumb,
              mediaType: 1,
              renderLargerThumbnail: !0
            },
            forwardingScore: 1,
            isForwarded: !0,
            forwardedNewsletterMessageInfo: {
              newsletterJid: idCh
            }
          }
        })
      } catch (e) {
        err('error pada profile', e),
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'stats',
    cmd: ['st', 'stats', 'ping'],
    tags: 'Info Menu',
    desc: 'status Bot',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      const a = performance.now(),
            bytes = b => (b / 1024 / 1024).toFixed(2),
            time = global.time.timeIndo("Asia/Jakarta", "HH:mm"),
            cpu = os.cpus()?.[0]?.model ?? 'Tidak diketahui',
            platform = os.platform(),
            arch = os.arch(),
            totalMem = os.totalmem(),
            usedMem = totalMem - os.freemem()

      let totalDisk = 'Tidak diketahui',
          usedDisk = 'Tidak diketahui',
          freeDisk = 'Tidak diketahui'

      try {
        const d = execSync('df -h /', { encoding: 'utf8' })
          .split('\n')[1]
          .split(/\s+/)
        ;[totalDisk, usedDisk, freeDisk] = [d[1], d[2], d[3]]
      } catch (e) {
        err('Disk info error:', e.message)
      }

      const stats = `Ini adalah status dari ${botName}

  ${head} ${opb} Stats *${botName}* ${clb}
  ${body} ${btn} *Bot Name:* ${botName}
  ${body} ${btn} *Bot Full Name:* ${botFullName}
  ${body} ${btn} *Time:* ${time}
  ${body} ${btn} *Respon:* ${(performance.now() - a).toFixed(2)} ms
  ${foot}${line}

  ${head} ${opb} Stats System ${clb}
  ${body} ${btn} *Platform:* ${platform} ( ${arch} )
  ${body} ${btn} *Cpu:* ${cpu}
  ${body} ${btn} *Ram:* ${bytes(usedMem)} MB / ${bytes(totalMem)} MB
  ${body} ${btn} *Storage:* ${usedDisk} / ${totalDisk} ( ${freeDisk} )
  ${foot}${line}`.trim()

      await xp.sendMessage(chat.id, {
        text: stats,
        contextInfo: {
          externalAdReply: {
            title: botFullName,
            body: `Ini adalah stats ${botName}`,
            thumbnailUrl: thumbnail,
            mediaType: 1,
            renderLargerThumbnail: !0
          },
          forwardingScore: 1,
          isForwarded: !0,
          forwardedNewsletterMessageInfo: {
            newsletterJid: idCh
          }
        }
      }, { quoted: m })
    }
  })
}