import fs from 'fs'
import path from 'path'
const gameFile = path.join(dirname, './db/game.json')

export default {
  name: 'tebang',
  command: ['tebang', 'tebangpohon'],
  tags: 'Rpg Menu',
  desc: 'Menebang pohon untuk mendapatkan kayu dan XP',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId, senderId } = chatInfo
    try {
      const wood = global.wood,
            db = JSON.parse(fs.readFileSync(gameFile)),
            user = Object.values(db.tca?.user || {}).find(v => v.id === senderId)

      if (!user) return conn.sendMessage(chatId, { text: 'Kamu belum memiliki akun game!\nKetik *.create <nama>* untuk membuat akun.' }, { quoted: msg })

      const inv = user.inv || {},
            axe = inv.axe || {},
            akey = Object.keys(axe)[0],
            aval = axe[akey]

      if (!akey || !aval || typeof aval.durabilty !== 'number')
        return conn.sendMessage(chatId, { text: !akey 
          ? 'Kamu tidak memiliki Axe!\nSilakan buat terlebih dahulu dengan perintah *.buat axe <material>' 
          : `Axe ${akey} tidak valid atau rusak.` }, { quoted: msg })

      const jenis = Object.keys(wood)[Math.floor(Math.random() * Object.keys(wood).length)],
            str = wood[jenis]?.str || 1e+0

      let amt = Math.round(str / 4e+0)
      ;(str / 4e+0) % 1 === .5 && (amt = Math.random() < .5 ? Math.floor(str / 4e+0) : Math.ceil(str / 4e+0))

      const loss = Math.ceil(amt / 1e+1),
            xp = Math.min(amt / 8e+1, 1e+0)

      inv.wood = inv.wood || {},
      inv.wood[jenis] = (inv.wood[jenis] || 0) + amt

      aval.durabilty -= loss,
      aval.durabilty <= 0 && delete axe[akey]

      user.lvl = Number(((user.lvl || 0) + xp).toFixed(2)),
      user.tebang = `${amt}x ${jenis}`

      fs.writeFileSync(gameFile, JSON.stringify(db, null, 2))

      const txt = `Menebang pohon berhasil!\n\nHasil Tebangan: ${jenis} x${amt}\nXP Tambahan: +${xp.toFixed(2)}\nDurabilitas ${akey}: ${aval?.durabilty ?? 0}`
      conn.sendMessage(chatId, { text: txt }, { quoted: msg })
    } catch (err) {
      console.error(err),
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat menebang pohon!' }, { quoted: msg })
    }
  }
}