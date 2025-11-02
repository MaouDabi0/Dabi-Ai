import fs from 'fs'
import path from 'path'

const gameFile = path.join(dirname, './db/game.json')

export default {
  name: 'maining',
  command: ['maining'],
  tags: 'Rpg Menu',
  desc: 'Menambang untuk mendapatkan item dan XP',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId, senderId } = chatInfo

    try {
      const oreData = global.ore,
            db = JSON.parse(fs.readFileSync(gameFile)),
            user = Object.values(db.tca?.user || {}).find(u => u.id === senderId)

      if (!user) return conn.sendMessage(chatId, { text: 'Kamu belum memiliki akun game!\nKetik *.create <nama>* untuk membuat akun.' }, { quoted: msg })

      const inv = user.inv || {},
            [pkey, pval] = Object.entries(inv.pickaxe || {})[0] || []

      if (!pkey || !pval?.durabilty)
        return conn.sendMessage(
          chatId,
          { text: !pkey 
              ? 'Kamu tidak memiliki Pickaxe!\nSilakan beli atau buat terlebih dahulu.' 
              : `Pickaxe ${pkey} tidak valid atau rusak.` },
          { quoted: msg }
        )

      const pickStr = pval.str || 0,
            possibleOre = Object.entries(oreData).filter(([_, v]) => v.str <= pickStr + 2)

      let chosenOre, rand = Math.random()
      if (rand < .6) {
        const normalOre = possibleOre.filter(([_, v]) => v.str <= pickStr)
        chosenOre = normalOre[Math.floor(Math.random() * normalOre.length)]
      } else if (rand < .9) {
        const higherOre = possibleOre.filter(([_, v]) => v.str === pickStr + 1)
        chosenOre = higherOre.length ? higherOre[Math.floor(Math.random() * higherOre.length)] : possibleOre[Math.floor(Math.random() * possibleOre.length)]
      } else chosenOre = possibleOre[Math.floor(Math.random() * possibleOre.length)]

      const [item] = chosenOre
      let amt = Math.round(pickStr / 4)
      if ((pickStr / 4) % 1 === .5) amt = Math.random() < .5 ? Math.floor(pickStr / 4) : Math.ceil(pickStr / 4)

      const loss = Math.ceil(amt / 2e1),
            xp = Math.min(amt / 1e2, 1)

      inv.ore = inv.ore || {}
      inv.ore[item] = (inv.ore[item] || 0) + amt

      pval.durabilty -= loss
      if (pval.durabilty <= 0) delete inv.pickaxe[pkey]

      user.lvl = Number(((user.lvl || 0) + xp).toFixed(2))
      user.maining = `${amt}x ${item}`

      fs.writeFileSync(gameFile, JSON.stringify(db, null, 2))

      const txt = `Menambang berhasil!\n\nHasil Tambang: ${item} x${amt}\nXP Tambahan: +${xp.toFixed(2)}\nDurabilitas ${pkey}: ${pval?.durabilty ?? 0}`
      conn.sendMessage(chatId, { text: txt }, { quoted: msg })
    } catch(err) {
      console.error(err)
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat menambang!' }, { quoted: msg })
    }
  }
}