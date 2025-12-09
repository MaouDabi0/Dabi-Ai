import fs from 'fs'
import path from 'path'
import AdmZip from "adm-zip"
import { exec } from 'child_process'
import { getGc, saveGc } from '../../system/db/data.js'
const config = path.join(dirname, './set/config.json'),
      pkg = JSON.parse(fs.readFileSync(path.join(dirname, '../package.json'))),
      temp = path.join(dirname, '../temp')

export default function owner(ev) {
  ev.on({
    name: 'isibank',
    cmd: ['isibank','addbank'],
    tags: 'Owner Menu',
    desc: 'isi saldo bank',
    owner: !0,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        const num = parseInt(args),
              bank = path.join(dirname,'./db/bank.json')

        if (!args || isNaN(num)) return xp.sendMessage(chat.id,{ text: 'nominal tidak valid\ncontoh: .isibank 10000' },{ quoted: m })

        const saldoBank = JSON.parse(fs.readFileSync(bank,'utf-8')),
              saldoLama = saldoBank.key?.saldo || 0,
              saldoBaru = saldoLama + num

        saldoBank.key.saldo = saldoBaru

        fs.writeFileSync(bank, JSON.stringify(saldoBank,null,2))

        await xp.sendMessage(
          chat.id,
          { text: `Saldo bank ditambah: ${num}\nTotal: ${saldoBaru}` },
          { quoted: m }
        )
      } catch (e) {
        err('error pada isibank', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'addowner',
    cmd: ['addowner'],
    tags: 'Owner Menu',
    desc: 'menambahkan owner',
    owner: !0,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              target = args[0]
                ? await global.number(args[0])
                : (quoted?.mentionedJid?.[0] || quoted?.participant).replace(/@s\.whatsapp\.net$/, '')

        if (!target) {
          return xp.sendMessage(chat.id, { text: 'reply/tag/masukan nomor nya' }, { quoted: m })
        }

        const cfg = JSON.parse(fs.readFileSync(config, 'utf-8'))

        if (cfg.ownerSetting?.ownerNumber.includes(target)) {
          return xp.sendMessage(chat.id, { text: 'nomor sudah ada' }, { quoted: m })
        }

        cfg.ownerSetting.ownerNumber.push(target)
        fs.writeFileSync(config, JSON.stringify(cfg, null, 2), 'utf-8')
        global.ownerNumber = cfg.ownerSetting.ownerNumber
        xp.sendMessage(chat.id, { text: `${target} berhasil ditambahkan` }, { quoted: m })
      } catch (e) {
        err('error pada addowner', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'backup',
    cmd: ['backup'],
    tags: 'Owner Menu',
    desc: 'backup sc',
    owner: !0,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const name = global.botName.replace(/\s+/g, '_'),
              vers = pkg.version.replace(/\s+/g, '.'),
              zipName = `${name}-${vers}.zip`

        if (!fs.existsSync(temp)) fs.mkdirSync(temp, { recursive: !0 })

        const p = path.join(temp, zipName),
              zip = new AdmZip(),
              file = [
                'cmd',
                'connect',
                'system',
                'index.js',
                'package.json'
              ]

        for (const item of file) {
          const full = path.join(dirname, '../', item)
          if (!fs.existsSync(full)) continue
          const dir = fs.lstatSync(full).isDirectory()
          dir
            ? zip.addLocalFolder(
                full,
                item,
                item === 'connect' ? p => !p.includes('session') : void 0
              )
            : zip.addLocalFile(full)
        }

        zip.writeZip(p)

        await xp.sendMessage(chat.id, {
          document: fs.readFileSync(p),
          mimetype: 'application/zip',
          fileName: zipName,
          caption: `Backup berhasil dibuat.\nNama file: ${zipName}`
        }, m && m.key ? { quoted: m } : {})

        setTimeout(() => {
          if (fs.existsSync(p)) fs.unlinkSync(p)
        }, 5e3)
      } catch (e) {
        err('error pada backup', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'banchat',
    cmd: ['ban', 'banchat'],
    tags: 'Owner Menu',
    desc: 'banned pengguna',
    owner: !0,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        const ctx = m.message?.extendedTextMessage?.contextInfo || {},
              nomor = args[0]
                ? await global.number(args[0])
                : (ctx.mentionedJid?.[0] || ctx.participant || '')
                    .replace(/@s\.whatsapp\.net$/, ''),
              found = Object.keys(db().key).some(k => {
                const u = db().key[k]
                if (u.jid.replace(/@s\.whatsapp\.net$/i, '') === nomor) {
                  u.ban = !0
                  return !0
                }
                return !1
              })

        const errorMsg = !nomor
          ? 'reply/tag atau input nomor'
          : !found
            ? 'nomor belum terdaftar'
            : null

        if (errorMsg) return xp.sendMessage(chat.id, { text: errorMsg }, { quoted: m })

        saveDb(),
        xp.sendMessage(chat.id, { text: `${nomor} diban` }, { quoted: m })
      } catch (e) {
        err('error pada banchat', e)
      }
    }
  })

  ev.on({
    name: 'bangrup',
    cmd: ['bangc', 'bangrup'],
    tags: 'Owner Menu',
    desc: 'memblokir grup',
    owner: !0,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const gc = getGc(chat)

        if (!chat.group || !gc) {
          return xp.sendMessage(
            chat.id,
            { text: !chat.group ? 'perintah ini hanya bisa digunakan digrup' : 'grup ini belum terdaftar' },
            { quoted: m }
          )
        }

        gc.ban = !0

        saveGc()
        xp.sendMessage(chat.id, { react: { text: '✅', key: m.key } })

      } catch (e) {
        err('error pada bangrup', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'delowner',
    cmd: ['delowner'],
    tags: 'Owner Menu',
    desc: 'menghapus nomor owner',
    owner: !0,
    prefix: !0,

    run: async (xp, m, { args, chat }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              target = args[0]
                ? await global.number(args[0])
                : (quoted?.mentionedJid?.[0] || quoted?.participant)?.replace(/@s\.whatsapp\.net$/, '');

        if (!target) {
          return xp.sendMessage(chat.id, { text: 'reply/tag/masukan nomor nya' }, { quoted: m })
        }

        const cfg = JSON.parse(fs.readFileSync(config, 'utf-8')),
              list = cfg.ownerSetting?.ownerNumber || [],
              index = list.indexOf(target)

        if (index < 0) {
          return xp.sendMessage(chat.id, { text: 'nomor tidak terdaftar' }, { quoted: m })
        }

        list.splice(index, 1)
        fs.writeFileSync(config, JSON.stringify(cfg, null, 2), 'utf-8')
        global.ownerNumber = cfg.ownerSetting.ownerNumber
        xp.sendMessage(chat.id, { text: `${target} berhasil dihapus` }, { quoted: m })

      } catch (e) {
        err('error pada delowner', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'eval',
    cmd: ['=>', '>', '~>'],
    tags: 'Owner Menu',
    desc: 'Mengeksekusi kode JavaScript secara langsung',
    owner: !0,
    prefix: !1,

    run: async (xp, m, {
      args,
      chat,
      cmdText
    }) => {
      try {
        const code = args.join(' ').trim()

        if (!code)
          return xp.sendMessage(chat.id, { text: 'isi eval yang akan dijalankan' }, { quoted: m })

        let result
        if (cmdText === '~>') {
          await (async () => {
            let logs = []
            const oriLog = log
            log = (...v) => logs.push(v.map(x => typeof x === 'object' ? JSON.stringify(x, null, 2) : String(x)).join(' '))
            result = await eval(`(async () => {${code}})()`)
            log = oriLog
            const output = [logs.join('\n'), typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)]
              .filter(Boolean)
              .join('\n') || 'code berhasil dijalankan tanpa output'
            return xp.sendMessage(chat.id, { text: output }, { quoted: m })
          })()
        } else {
          result = cmdText === '=>'
            ? await eval(`(async () => (${code}))()`)
            : await eval(`(async () => { return ${code} })()`)

          const output = typeof result === 'object'
            ? JSON.stringify(result, null, 2)
            : String(result)

          await xp.sendMessage(chat.id, {
            text: (output && output !== 'undefined')
              ? output
              : 'code berhasil dijalankan tanpa output'
          }, { quoted: m })
        }
      } catch (e) {
        log('error pada eval', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'mode',
    cmd: ['mode'],
    tags: 'Owner Menu',
    desc: 'setting mode group/private',
    owner: !0,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        const arg = args[0]?.toLowerCase(),
              cfg = JSON.parse(fs.readFileSync(config, 'utf-8')),
              input = arg === 'group',
              type = v => v ? 'Group' : 'Private',
              md = type(global.isGroup)

        if (!['private', 'group'].includes(arg)) {
          return xp.sendMessage(chat.id, { text: `gunakan: .mode group/private\n\nmode: ${md}` }, { quoted: m })
        }

        cfg.botSetting.isGroup = input
        fs.writeFileSync(config, JSON.stringify(cfg, null, 2))
        global.isGroup = input

        xp.sendMessage(chat.id, { text: `mode berhasil diganti ${input ? 'ke private' : 'ke group'}` }, { quoted: m })
      } catch (e) {
        err('error pada mode', )
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'unban',
    cmd: ['unban'],
    tags: 'Owner Menu',
    desc: 'menghapus status ban pada pengguna',
    owner: !0,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        const ctx = m.message?.extendedTextMessage?.contextInfo || {},
              nomor = args[0]
                ? await global.number(args[0])
                : (ctx.mentionedJid?.[0] || ctx.participant || '')
                    .replace(/@s\.whatsapp\.net$/, ''),
              found = Object.keys(db().key).some(k => {
                const u = db().key[k]
                if (u.jid.replace(/@s\.whatsapp\.net$/i, '') === nomor) {
                  u.ban = !1
                  return !0
                }
                return !1
              })

        const errorMsg = !nomor
          ? 'reply/tag atau input nomor'
          : !found
            ? 'nomor belum terdaftar'
            : null

        if (errorMsg) return xp.sendMessage(chat.id, { text: errorMsg }, { quoted: m })

        saveDb()
        xp.sendMessage(chat.id, { text: `${nomor} diunban` }, { quoted: m })
      } catch (e) {
        err('Error pada unban', e)
      }
    }
  })

  ev.on({
    name: 'unbangc',
    cmd: ['unbangc', 'unbangrup'],
    tags: 'Owner Menu',
    desc: 'membuka ban grup',
    owner: !0,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const gc = getGc(chat)

        if (!chat.group || !gc) {
          return xp.sendMessage(
            chat.id,
            { text: !chat.group ? 'perintah ini hanya bisa digunakan digrup' : 'grup ini belum terdaftar' },
            { quoted: m }
          )
        }

        gc.ban = !1

        saveGc()
        xp.sendMessage(chat.id, { react: { text: '✅', key: m.key } })

      } catch (e) {
        err('error pada bangrup', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'public',
    cmd: ['public'],
    tags: 'Owner Menu',
    desc: 'pengaturan bot mode',
    owner: !0,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        const arg = args[0]?.toLowerCase(),
              cfg = JSON.parse(fs.readFileSync(config, 'utf-8')),
              input = arg === 'on'

        if (!['on', 'off'].includes(arg)) {
          return xp.sendMessage(chat.id, {
            text: `gunakan: .public on/off\n\nstatus: ${global.public}`
          }, { quoted: m })
        }

        cfg.ownerSetting.public = input
        fs.writeFileSync(config, JSON.stringify(cfg, null, 2))
        global.public = input

        xp.sendMessage(chat.id, {
          text: `public ${input ? 'diaktifkan' : 'dimatikan'}`
        }, { quoted: m })
      } catch (e) {
        err('error pada public', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'shell',
    cmd: ['$', 'sh'],
    tags: 'Owner Menu',
    desc: 'menjalankan perintah shell',
    owner: !0,
    prefix: !1,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        const cmd = args.join(' ')

        return !args.length
          ? xp.sendMessage(chat.id, { text: 'masukan perintah shell' }, { quoted: m })
          : exec(cmd, (e, out, err) => {
              const text = e ? e.message : err ? err : out || '✅'
              xp.sendMessage(chat.id, { text: text.trim() }, { quoted: m })
            })
      } catch (e) {
        err('error pada shell', e)
        call(xp, e, m)
      }
    }
  })
}