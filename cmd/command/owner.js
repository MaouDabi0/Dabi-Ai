import fs from 'fs'
import path from 'path'
import AdmZip from "adm-zip"
import { exec } from 'child_process'
const config = path.join(dirname, './set/config.json'),
      pkg = JSON.parse(fs.readFileSync(path.join(dirname, '../package.json'))),
      temp = path.join(dirname, '../temp')

export default function owner(ev) {
  ev.on({
    name: 'addowner',
    cmd: ['addowner'],
    tags: 'Owner Menu',
    desc: 'menambahkan owner',
    owner: !0,
    prefix: !0,
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              user = quoted?.participant || quoted?.mentionedJid?.[0],
              raw = args && args[0] ? args[0] : null,
              num = raw ? global.number(raw) : null,
              targetRaw = user || num,
              target = targetRaw.replace(/@s\.whatsapp\.net$/, '')

        if (!target) {
          return xp.sendMessage(chat.id, { text: 'reply/tag/masukan nomor nya' }, { quoted: m })
        }

        const cfg = JSON.parse(fs.readFileSync(config, 'utf-8'))

        if (cfg.ownerSetting?.ownerNumber.includes(target)) {
          return xp.sendMessage(chat.id, { text: 'nomor sudah ada' }, { quoted: m })
        }

        cfg.ownerSetting.ownerNumber.push(target)
        fs.writeFileSync(config, JSON.stringify(cfg, null, 2), 'utf-8')

        xp.sendMessage(chat.id, { text: `@${target} berhasil ditambahkan`, mentions: [targetRaw] }, { quoted: m })
      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'addmoney',
    cmd: ['addmoney', 'adduang'],
    tags: 'Owner Menu',
    desc: 'menambahkan uang ke target',
    owner: !0,
    prefix: !0,
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        if (!chat.group) return xp.sendMessage(chat.id, { text: 'perintah ini hanya bisa digunakan digrup' }, { quoted: m })

        const quoted = m.message?.extendedTextMessage?.contextInfo,
              target = quoted?.participant || quoted?.mentionedJid?.[0]

        if (!target) return xp.sendMessage(chat.id, { text: `reply/tag target\ncontoh: ${prefix}${cmd} @pengguna/reply 10000` }, { quoted: m })

        const userDb = Object.values(db().key).find(u => u.jid === target),
              nominal = Number(args[1]) || Number(args[0]),
              mention = target.replace(/@s\.whatsapp\.net$/, '')

        if (!nominal || nominal < 1) {
          return xp.sendMessage(chat.id, { text: 'nominal tidak valid' }, { quoted: m })
        }

        if (!userDb) return xp.sendMessage(chat.id, { text: 'pengguna belum terdaftar' }, { quoted: m })

        userDb.moneyDb.moneyInBank += nominal
        save.db()

        await xp.sendMessage(chat.id, { text: `Rp ${nominal.toLocaleString('id-ID')} berhasil ditambahkan ke bank @${mention}`, mentions: [target] }, { quoted: m })
      } catch (e) {
        err(`error pada ${cmd}`, e)
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
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      chat,
      cmd
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
          caption: `${cmd} berhasil dibuat.\nNama file: ${zipName}`
        }, m && m.key ? { quoted: m } : {})

        setTimeout(() => {
          if (fs.existsSync(p)) fs.unlinkSync(p)
        }, 5e3)
      } catch (e) {
        err(`error pada ${cmd}`, e)
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
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd
    }) => {
      try {
        const ctx = m.message?.extendedTextMessage?.contextInfo,
              nomor = global.number(args.join(' ')) + '@s.whatsapp.net',
              target = ctx?.mentionedJid?.[0] || ctx?.participant || nomor,
              userdb = Object.values(db().key).find(u => u.jid === target)

        if (!target || !userdb) return xp.sendMessage(chat.id, { text: !target ? 'reply/tag atau input nomor' : 'nomor belum terdaftar' }, { quoted: m })

        const opsi = !!userdb?.ban

        if ((target && opsi)) return xp.sendMessage(chat.id, { text: 'nomor sudah diban' }, { quoted: m })

        userdb.ban = !0
        save.db()

        await xp.sendMessage(chat.id, { text: `${target.replace(/@s\.whatsapp\.net$/, '')} diban` }, { quoted: m })
      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
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
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      chat,
      cmd,
      prefix
    }) => {
      try {
        const gc = getGc(chat)

        if (!chat.group || !gc || (chat.id && !!gc?.ban)) {
          return xp.sendMessage(chat.id, { text: !chat.group ? 'perintah ini hanya bisa digunakan digrup' : !gc ? `grup ini belum terdaftar ketik ${prefix}daftargc` : 'grup ini sudah diban' }, { quoted: m })
        }

        gc.ban = !0
        save.gc()

        await xp.sendMessage(chat.id, { react: { text: '✅', key: m.key } })

      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'cleartmp',
    cmd: ['clear', 'cleartmp'],
    tags: 'Owner Menu',
    desc: 'membersihkan tempat sampah',
    owner: !0,
    prefix: !0,
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      chat,
      cmd
    }) => {
      try {
        const tmpdir = path.join(dirname, '../temp')

        if (!fs.existsSync(tmpdir)) return xp.sendMessage(chat.id, { text: 'file temp tidak ditemukan' }, { quoted: m })

        const file = fs.readdirSync(tmpdir)
        return !file.length
          ? xp.sendMessage(chat.id, { text: 'sampah sudah bersih' }, { quoted: m })
          : (file.forEach(f => fs.rmSync(path.join(tmpdir, f), { recursive: !0, force: !0 })),
            await xp.sendMessage(chat.id, { text: 'temp berhasil dibersihkan' }, { quoted: m }))
      } catch (e) {
        err(`error pada ${cmd}`, e)
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
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd
    }) => {
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
        await xp.sendMessage(chat.id, { text: `${target} berhasil dihapus` }, { quoted: m })

      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'deluang',
    cmd: ['deluang'],
    tags: 'Owner Menu',
    desc: 'menghapus uang pengguna',
    owner: !0,
    prefix: !0,
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              user = quoted?.participant || quoted?.mentionedJid?.[0]

        if (!chat.group || !user) {
          return xp.sendMessage(chat.id, { text: !chat.group ? 'perintah ini hanya bisa digunakan digrup' : 'reply/tag target' }, { quoted: m })
        }

        const userDb = Object.values(db().key).find(u => u.jid === user),
              nominal = Number(args[1]) || Number(args[0])

        if (!nominal || !userDb) {
          return xp.sendMessage(chat.id, { text: !nominal ? `nominal tidak valid\ncontoh: ${prefix}${cmd} 10000` : 'pengguna belum terdaftar' }, { quoted: m })
        }

        if (userDb.moneyDb?.money < nominal) return xp.sendMessage(chat.id, { text: `uang pengguna tersisa ${userDb?.moneyDb?.money.toLocaleString('id-ID')}` }, { quoted: m })

        userDb.moneyDb.money -= nominal
        save.db()

        await xp.sendMessage(chat.id, { text: `Rp ${nominal.toLocaleString('id-ID')} berhasil disita` }, { quoted: m })
      } catch (e) {
        err(`error pada ${cmd}`, e)
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
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      text
    }) => {
      try {
        const code = args.join(' ').trim()

        if (!code) return xp.sendMessage(chat.id, { text: `isi ${cmd} yang akan dijalankan` }, { quoted: m })

        let result
        if (text === '~>') {
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
          result = text === '=>'
            ? await eval(`(async () => (${code}))()`)
            : await eval(`(async () => { return ${code} })()`)

          const output = typeof result === 'object'
            ? JSON.stringify(result, null, 2)
            : String(result)

          await xp.sendMessage(chat.id, { text: (output && output !== 'undefined') ? output : 'code berhasil dijalankan tanpa output' }, { quoted: m })
        }
      } catch (e) {
        log('error pada eval', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'isibank',
    cmd: ['isibank','addbank'],
    tags: 'Owner Menu',
    desc: 'isi saldo bank',
    owner: !0,
    prefix: !0,
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        const num = parseInt(args),
              bank = path.join(dirname,'./db/bank.json')

        if (!args || isNaN(num)) return xp.sendMessage(chat.id,{ text: `nominal tidak valid\ncontoh: ${prefix}${cmd} 10000` },{ quoted: m })

        const saldoBank = JSON.parse(fs.readFileSync(bank,'utf-8')),
              saldoLama = saldoBank.key?.saldo || 0,
              saldoBaru = saldoLama + num

        saldoBank.key.saldo = saldoBaru

        fs.writeFileSync(bank, JSON.stringify(saldoBank,null,2))

        await xp.sendMessage(chat.id, { text: `Saldo bank ditambah: Rp ${num.toLocaleString('id-ID')}\nTotal: Rp ${saldoBaru.toLocaleString('id-ID')}` }, { quoted: m })
      } catch (e) {
        err(`error pada ${cmd}`, e)
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
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        const arg = args[0]?.toLowerCase(),
              cfg = JSON.parse(fs.readFileSync(config, 'utf-8')),
              input = arg === 'group',
              type = v => v ? 'Group' : 'Private',
              md = type(global.isGroup)

        if (!['private', 'group'].includes(arg)) return xp.sendMessage(chat.id, { text: `gunakan: ${prefix}${cmd} group/private\n\n${cmd}: ${md}` }, { quoted: m })

        cfg.botSetting.isGroup = input
        fs.writeFileSync(config, JSON.stringify(cfg, null, 2))

        xp.sendMessage(chat.id, { text: `${cmd} berhasil diganti ${input ? 'ke group' : 'ke private'}` }, { quoted: m })
      } catch (e) {
        err(`error pada ${cmd}`, e)
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
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd
    }) => {
      try {
        const ctx = m.message?.extendedTextMessage?.contextInfo,
              nomor = global.number(args.join(' ')) + '@s.whatsapp.net',
              target = ctx?.mentionedJid?.[0] || ctx?.participant || nomor,
              userdb = Object.values(db().key).find(u => u.jid === target)

        if (!target || !userdb) return xp.sendMessage(chat.id, { text: !target ? 'reply/tag atau input nomor' : 'nomor belum terdaftar' }, { quoted: m })

        const opsi = !!userdb?.ban

        if ((target && !opsi)) return xp.sendMessage(chat.id, { text: 'nomor tidak diban' }, { quoted: m })

        userdb.ban = !1
        save.db()
        await xp.sendMessage(chat.id, { text: `${target.replace(/@s\.whatsapp\.net$/, '')} diunban` }, { quoted: m })
      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
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
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      chat,
      cmd,
      prefix
    }) => {
      try {
        const gc = getGc(chat)

        if (!chat.group || !gc || !gc?.ban) {
          return xp.sendMessage(chat.id, { text: !chat.group ? 'perintah ini hanya bisa digunakan digrup' : !gc ? `grup ini belum terdaftar ketik ${prefix}daftargc untuk mendaftar`: 'grup ini tidak diban' }, { quoted: m })
        }

        gc.ban = !1

        save.gc()
        xp.sendMessage(chat.id, { react: { text: '✅', key: m.key } })

      } catch (e) {
        err(`error pada ${cmd}`, e)
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
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        const arg = args[0]?.toLowerCase(),
              cfg = JSON.parse(fs.readFileSync(config, 'utf-8')),
              input = arg === 'on'

        if (!['on', 'off'].includes(arg)) return xp.sendMessage(chat.id, { text: `gunakan: ${prefix}${cmd} on/off\n\nstatus: ${global.public}` }, { quoted: m })

        cfg.ownerSetting.public = input
        fs.writeFileSync(config, JSON.stringify(cfg, null, 2))

        xp.sendMessage(chat.id, { text: `${cmd} ${input ? 'diaktifkan' : 'dimatikan'}` }, { quoted: m })
      } catch (e) {
        err(`error pada ${cmd}`, e)
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
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd
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
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })
}