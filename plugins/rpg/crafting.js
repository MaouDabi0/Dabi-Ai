import fs from 'fs'
import path from 'path'

const gameFile = path.join(dirname, './db/game.json'),
      refPath = path.join(dirname, './set/gameSetting.json')

export default {
  name: 'crafting',
  command: ['crafting','buat'],
  tags: 'Rpg Menu',
  desc: 'Membuat item dari bahan',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId, senderId } = chatInfo
    try {
      const ref = JSON.parse(fs.readFileSync(refPath)),
            db = JSON.parse(fs.readFileSync(gameFile)),
            users = db.tca?.user || {},
            nama = Object.keys(users).find(k => users[k].id === senderId)

      if (!nama)
        return conn.sendMessage(
          chatId,
          { text: 'Kamu belum mempunyai akun game!\nKetik *.create <nama>* untuk membuat akun.' },
          { quoted: msg }
        )

      const u = users[nama],
            inv = (u.inv = u.inv || {}),
            durRef = ref.setGame?.rpg?.durabilty || {}

      if (!args.length) {
        const ownedMats = [...Object.keys(inv.ore || {}), ...Object.keys(inv.wood || {})],
              craftable = Object.keys(durRef)
                .map(tool => {
                  const mats = Object.keys(durRef[tool] || {}).filter(m => ownedMats.includes(m))
                  return mats.length ? `${tool}\n${mats.map(m => `• ${m} x1`).join('\n')}` : null
                })
                .filter(Boolean),
              txtList = craftable.length
                ? craftable.join('\n\n')
                : 'Kamu belum punya bahan yang cukup untuk membuat item.',
              reply = `Format salah!\nContoh: *.buat pickaxe iron*\n\nItem yang bisa dibuat:\n\n${txtList}`

        return conn.sendMessage(chatId, { text: reply }, { quoted: msg })
      }

      if (args.length < 2)
        return conn.sendMessage(
          chatId,
          { text: 'Format salah!\nContoh: *.buat pickaxe iron*' },
          { quoted: msg }
        )

      const [tool, mat] = args,
            bahan = mat.toLowerCase()

      if (!durRef[tool] || !durRef[tool][bahan])
        return conn.sendMessage(
          chatId,
          { text: `Item ${tool} dengan bahan ${bahan} tidak dapat dibuat.` },
          { quoted: msg }
        )

      const durability = durRef[tool][bahan].durabilty || 5e1,
            bahanAda = (inv.ore?.[bahan] || inv.wood?.[bahan] || 0) > 0,
            kayuAda = Object.values(inv.wood || {}).reduce((a, b) => a + b, 0) > 0

      if (!kayuAda || !bahanAda)
        return conn.sendMessage(
          chatId,
          { text: `Bahan tidak cukup!\nDibutuhkan: 1 ${bahan} & 1 kayu` },
          { quoted: msg }
        )

      inv.ore?.[bahan]
        ? (inv.ore[bahan]--, inv.ore[bahan] === 0 && delete inv.ore[bahan])
        : inv.wood?.[bahan]
        ? (inv.wood[bahan]--, inv.wood[bahan] === 0 && delete inv.wood[bahan])
        : null

      const woodTypes = Object.keys(inv.wood || {})

      woodTypes.length
        ? (inv.wood[woodTypes[0]]--,
           inv.wood[woodTypes[0]] === 0 && delete inv.wood[woodTypes[0]])
        : null

      inv[tool] = inv[tool] || {}
      inv[tool][bahan] = { durability }

      fs.writeFileSync(gameFile, JSON.stringify(db, null, 2))

      conn.sendMessage(
        chatId,
        { text: `Berhasil membuat ${tool}.${bahan} dengan durabilitas ${durability}.\nBahan telah dikurangi.` },
        { quoted: msg }
      )
    } catch (e) {
      console.error(e)
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat crafting!' }, { quoted: msg })
    }
  }
}