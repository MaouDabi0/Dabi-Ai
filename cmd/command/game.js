import fs from 'fs'
import path from 'path'
const bankData = path.join(dirname, './db/bank.json')

export default function game(ev) {
  ev.on({
    name: 'rampok',
    cmd: ['rampok'],
    tags: 'Game Menu',
    desc: 'merampok orang',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      chat
    }) => {
      try {
        if (!chat.group) {
          return xp.sendMessage(chat.id, { text: 'perintah ini hanya bisa dijalankan digrup' }, { quoted: m })
        }

        const quoted = m.message?.extendedTextMessage?.contextInfo,
              target = quoted?.participant || quoted?.mentionedJid?.[0],
              usrData = Object.values(db().key).find(u => u.jid === target)

        if (!target || !usrData) {
          return xp.sendMessage(chat.id, { text: !target ? 'reply/tag target yang akan dirampok' : 'target belum terdaftar' }, { quoted: m })
        }

        const user = target.replace(/@s\.whatsapp\.net$/, ''),
              robber = Object.values(db().key).find(u => u.jid === chat.sender),
              victim = usrData,
              moneyVictim = victim.money || 0

        if (moneyVictim <= 0) {
          return xp.sendMessage(chat.id, { text: 'target tidak memiliki uang untuk dirampok' }, { quoted: m })
        }

        const chance = Math.floor(Math.random() * 100) + 1,
              escapeChance = chance >= 50
                ? Math.floor(Math.random() * 21) + 30
                : Math.floor(Math.random() * 21) + 10,
              escapeRoll = Math.floor(Math.random() * 100) + 1

        if (escapeRoll <= escapeChance) {
          return xp.sendMessage(chat.id, {
            text: `Target berhasil *lolos!*`
          }, { quoted: m, mentions: [target] })
        }

        const percent = chance > 100 ? 100 : chance,
              stolen = Math.floor(moneyVictim * (percent / 100)),
              finalStolen = stolen < 1 ? 1 : stolen

        victim.money -= finalStolen
        robber.money = (robber.money || 0) + finalStolen

        saveDb()

        return xp.sendMessage(chat.id, {
          text: `🛡️ *Rampokan Berhasil!*\n` +
                `Kamu merampok *@${user}*\n\n` +
                `📊 Peluang keberhasilan: *${percent}%*\n` +
                `💰 Uang target: *${moneyVictim.toLocaleString()}*\n` +
                `🪙 Hasil rampokan: *${finalStolen.toLocaleString()}*\n\n` +
                `Saldo kamu sekarang: *${robber.money.toLocaleString()}*`,
          mentions: [target]
        }, { quoted: m })

      } catch (e) {
        err('error pada rampok', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'slot',
    cmd: ['isi', 'spin', 'slot'],
    tags: 'Game Menu',
    desc: 'gacha uang',
    owner: !1,
    prefix: !0,

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
              saldo = user.money || 0

        if (!args[0] || isNaN(isi) || isi < 0) {
          return xp.sendMessage(chat.id, { text: 'masukan jumlah yang valid\ncontoh: .isi 10000' }, { quoted: m })
        }

        if (isi > saldo) {
          return xp.sendMessage(chat.id, { text: 'saldo kamu tidak cukup' }, { quoted: m })
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
          user.money += hadiah
          saldoBank.key.saldo = isiBank >= rsMoney ? isiBank - rsMoney : 0
          rsMoney = hadiah
        } else {
          user.money += rsMoney
          saldoBank.key.saldo += Math.abs(rsMoney)
        }

        const saveBank = d => fs.writeFileSync(bankData, JSON.stringify(d, null, 2)),
              txt = `
╭───🎰 GACHA UANG 🎰───╮
│               ${isi1.join(' : ')}
│               ${hasil}
│               ${isi3.join(' : ')}
╰────────────────────╯
             ${menang ? `🎉 Kamu Menang! +${rsMoney.toLocaleString()}` : `💥 Zonk! -${Math.abs(rsMoney).toLocaleString()}`}
`.trim();

        saveDb()
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
}