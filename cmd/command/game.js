import fs from 'fs'
import path from 'path'
const bankData = path.join(dirname, './db/bank.json')

export default function game(ev) {
  ev.on({
    name: 'autofarming',
    cmd: ['farm', 'autofarm', 'autofarming'],
    tags: 'Game Menu',
    desc: 'mengaktifkan auto farming',
    owner: !1,
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
        const input = args[0]?.toLowerCase(),
              user = Object.values(db().key).find(u => u.jid === chat.sender),
              opsi = !!user?.game?.farm,
              type = v => v ? 'Aktif' : 'Tidak',
              modefarm = type(user?.game?.farm)

        if (!input || !['on', 'off'].includes(input) || (input === 'on' && opsi) || (input === 'off' && !opsi)) {
          return xp.sendMessage(chat.id, { text: !input || !['on', 'off'].includes(input) ? `gunakan:\n ${prefix}${cmd} on/off\n\n${cmd}: ${modefarm}` : `${cmd} sudah ${opsi ? 'Aktif' : 'nonaktif'}` }, { quoted: m })
        }

        user.game.farm = input === 'on'
        save.db()

        await xp.sendMessage(chat.id, { text: `${cmd} berhasil di-${input === 'on' ? 'aktifkan' : 'nonaktifkan'}` }, { quoted: m })
      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'cekbank',
    cmd: ['cekbank'],
    tags: 'Game Menu',
    desc: 'cek saldo bank',
    owner: !1,
    prefix: !0,
    money: 100,
    exp: 0.1,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const bankDb = JSON.parse(fs.readFileSync(bankData, 'utf-8')),
              saldo = bankDb.key?.saldo || 0

        let txt = `BANK BOT ${botName}\n`
            txt += `${line}\n`
            txt += `Akun: Bank Pusat\n`
            txt += `Saldo: Rp ${saldo.toLocaleString('id-ID')}\n`
            txt += `${line}`

        await xp.sendMessage(chat.id, { text: txt }, { quoted: m })
      } catch (e) {
        err('error pada cekbank', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'nabung',
    cmd: ['nabung', 'isiatm'],
    tags: 'Game Menu',
    desc: 'mengisi saldo bank orang',
    owner: !1,
    prefix: !0,
    money: 1,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        if (!args) {
          return xp.sendMessage(chat.id, { text: 'contoh: .isiatm 10000' }, { quoted: m })
        }

        const userDb = Object.values(db().key).find(u => u.jid === chat.sender),
              nominal = Number(args[0])

        if (!userDb || !nominal) {
          return xp.sendMessage(chat.id, { text: !userDb ? 'kamu belum terdaftar coba lagi' : 'nominal tidak valid\ncontoh: .isiatm 10000' }, { quoted: m })
        }

        if (userDb.moneyDb?.money < nominal) {
          return xp.sendMessage(chat.id, { text: `uang kamu hanya tersisa ${userDb.moneyDb?.money.toLocaleString('id-ID')}` }, { quoted: m })
        }

        userDb.moneyDb.money -= nominal
        userDb.moneyDb.moneyInBank += nominal
        save.db()

        await xp.sendMessage(chat.id, { text: `Rp ${nominal.toLocaleString('id-ID')} berhasil masukan ke bank` }, { quoted: m })
      } catch (e) {
        err('error pada nabung', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'rampok',
    cmd: ['rampok'],
    tags: 'Game Menu',
    desc: 'merampok orang',
    owner: !1,
    prefix: !0,
    money: 0,
    exp: 0.2,

    run: async (xp, m, {
      chat
    }) => {
      try {
        if (!chat.group) return xp.sendMessage(chat.id, { text: 'perintah ini hanya bisa digunakan digrup' }, { quoted: m })

        const quoted = m.message?.extendedTextMessage?.contextInfo,
              target = quoted?.participant || quoted?.mentionedJid?.[0],
              targetdb = Object.values(db().key).find(t => t.jid === target),
              usrdb = Object.values(db().key).find(u => u.jid === chat.sender)

        if (!target || !targetdb) {
          return xp.sendMessage(chat.id, { text: !target ? 'reply/tag target' : 'target belum terdaftar' }, { quoted: m })
        }

        if (!usrdb) return xp.sendMessage(chat.id, { text: 'kamu belum terdaftar coba lagi' }, { quoted: m })

        const mention = target.replace(/@s\.whatsapp\.net$/, ''),
              moneyTarget = targetdb.moneyDb.money,
              moneyUsr = usrdb.moneyDb.money

        if (moneyTarget <= 0) return xp.sendMessage(chat.id, { text: 'target miskin' }, { quoted: m })

        const chance = Math.floor(Math.random() * 100) + 1,
              escapeChance = chance >= 45
                ? Math.floor(Math.random() * 21) + 25
                : Math.floor(Math.random() * 21) + 10,
              escapeRoll = Math.floor(Math.random() * 100) + 1

        if (escapeRoll <= escapeChance) {
          return xp.sendMessage(chat.id, { text: `Target berhasil *lolos!*` }, { quoted: m })
        }

        const persen = chance > 100 ? 100 : chance,
              stolin = Math.floor(moneyTarget * (persen / 100)),
              finalSt = stolin < 1 ? 1 : stolin

        targetdb.moneyDb.money -= finalSt
        usrdb.moneyDb.money += finalSt
        save.db()

        let txt = `${head}\n`
            txt += `${body} ${btn} *Berhasil Merampok:* Rp ${finalSt.toLocaleString('id-ID')} dari @${mention}\n`
            txt += `${body} ${btn} *Saldo Kamu:* Rp ${usrdb.moneyDb?.money.toLocaleString('id-ID')}\n`
            txt += `${foot}${line}`

        await xp.sendMessage(chat.id, { text: txt, mentions: [target] }, { quoted: m })
      } catch (e) {
        err('error pada rampok', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'slot',
    cmd: ['isi', 'spin', 'slot', 'gacha'],
    tags: 'Game Menu',
    desc: 'gacha uang',
    owner: !1,
    prefix: !0,
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        const saldoBank = JSON.parse(fs.readFileSync(bankData, 'utf-8')),
              user = Object.values(db().key).find(u => u.jid === chat.sender),
              delay = ms => new Promise(res => setTimeout(res, ms)),
              sym = ['🕊️','🦀','🦎','🍀','💎','🍒','❤️','🎊'],
              randSym = () => sym[Math.floor(Math.random() * sym.length)]

        if (!user) {
          return xp.sendMessage(chat.id, { text: 'kamu belum terdaftar' }, { quoted: m })
        }

        const isi = parseInt(args[0]),
              saldo = user.moneyDb?.money || 0

        if (!args[0] || isNaN(isi) || isi < 0) {
          return xp.sendMessage(chat.id, { text: 'masukan jumlah yang valid\ncontoh: .isi 10000' }, { quoted: m })
        }

        if (isi > saldo) {
          return xp.sendMessage(chat.id, { text: `saldo kamu tersisa Rp ${saldo.toLocaleString('id-ID')}` }, { quoted: m })
        }

        const isi1 = [randSym(), randSym(), randSym()],
              isi3 = [randSym(), randSym(), randSym()],
              menang = Math.random() < 0.5,
              isi2 = menang ? Array(3).fill(randSym()) : (() => {
                let r; do { r = [randSym(), randSym(), randSym()] } while (r[0] === r[1] && r[1] === r[2]);
                return r;
              })(),
              hasil = isi2.join(' : '),
              isiBank = saldoBank.key?.saldo || 0

        let rsMoney = menang ? isi * 2 : -isi

        if (menang) {
          const hadiah = isiBank >= rsMoney ? rsMoney : isiBank
          user.moneyDb.money += hadiah
          saldoBank.key.saldo = isiBank >= rsMoney ? isiBank - rsMoney : 0
          rsMoney = hadiah
        } else {
          user.moneyDb.money += rsMoney
          saldoBank.key.saldo += Math.abs(rsMoney)
        }

        const saveBank = d => fs.writeFileSync(bankData, JSON.stringify(d, null, 2)),
              txt = `
╭───🎰 GACHA UANG 🎰───╮
│               ${isi1.join(' : ')}
│               ${hasil}
│               ${isi3.join(' : ')}
╰────────────────────╯
             ${menang ? `🎉 Kamu Menang! +${rsMoney.toLocaleString('id-ID')}` : `💥 Zonk! -${Math.abs(rsMoney).toLocaleString('id-ID')}`}
`.trim();

        save.db()
        saveBank(saldoBank)

        const pesanAwal = await xp.sendMessage(chat.id, { text: '🎲 Gacha dimulai...' }, { quoted: m });

        await delay(2000);
        await xp.sendMessage(chat.id, { text: txt, edit: pesanAwal.key });
      } catch (e) {
        err('error pada slot', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'tariksaldo',
    cmd: ['tariksaldo', 'tarik'],
    tags: 'Game Menu',
    desc: 'mengambil saldo dari bank',
    owner: !1,
    prefix: !0,
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        if (!args) return xp.sendMessage(chat.id, { text: 'masukan nominal\ncontoh: .tarik 1000' }, { quoted: m })

        const nominal = Number(args[0]),
              usrdb = Object.values(db().key).find(u => u.jid === chat.sender)

        if (!nominal || !usrdb) {
          return xp.sendMessage(chat.id, { text: !nominal ? 'nominal tidak valid' : 'kamu belum terdaftar coba lagi' }, { quoted: m })
        }

        const moneyBank = usrdb.moneyDb?.moneyInBank
        if (moneyBank < nominal) return xp.sendMessage(chat.id, { text: `saldo bank kamu hanya tersisa Rp ${moneyBank.toLocaleString('id-ID')}` }, { quoted: m })

        usrdb.moneyDb.moneyInBank -= nominal
        usrdb.moneyDb.money += nominal
        save.db()

        await xp.sendMessage(chat.id, { text: `Rp ${nominal.toLocaleString('id-ID')} berhasil di tarik dari bank` }, { quoted: m })
      } catch (e) {
        err('error pada tariksaldo', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'transfer',
    cmd: ['tf', 'transfer'],
    tags: 'Game Menu',
    desc: 'mentransfer uang',
    owner: !1,
    prefix: !0,
    money: 100,
    exp: 0.5,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        if (!chat.group)
          return xp.sendMessage(chat.id, { text: 'perintah ini hanya bisa digunakan digrup' }, { quoted: m })

        const quoted = m.message?.extendedTextMessage?.contextInfo,
              target = quoted?.participant || quoted?.mentionedJid?.[0],
              targetDb = Object.values(db().key).find(u => u.jid === target),
              userDb = Object.values(db().key).find(u => u.jid === chat.sender)

        if (!target || !args?.[0])
          return xp.sendMessage(chat.id, { text: !target ? 'reply/tag orang yang akan menerima transfer' : 'nominal tidak valid\ncontoh: .tf @pengguna/reply 10000' }, { quoted: m })

        const nominal = Number(args[1]) || Number(args[0])
        if (!nominal || nominal < 1e0)
          return xp.sendMessage(chat.id, { text: 'nominal tidak valid' }, { quoted: m })

        if (!userDb || !targetDb)
          return xp.sendMessage(chat.id, { text: !userDb ? 'data kamu tidak ditemukan di database' : 'data penerima tidak ditemukan di database' }, { quoted: m })

        const uMoney = userDb.moneyDb.money

        if (uMoney < nominal)
          return xp.sendMessage(chat.id, { text: `saldo kamu tersisa Rp ${userDb.moneyDb?.money.toLocaleString('id-ID')}` }, { quoted: m })

        userDb.moneyDb.money -= nominal
        targetDb.moneyDb.money += nominal
        save.db()

        let txt = `Rp ${nominal.toLocaleString('id-ID')} berhasil ditransfer`

        await xp.sendMessage(chat.id, { text: txt }, { quoted: m })
      } catch (e) {
        err('error pada transfer', e)
        call(xp, e, m)
      }
    }
  })
}