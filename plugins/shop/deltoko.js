import fs from 'fs'
import path from 'path'

const tokoPath = './toolkit/set/toko.json',
      pluginFolder = './plugins/toko'

export default {
  name: 'deltoko',
  command: ['deltoko', 'deletetoko'],
  tags: 'Shop Menu',
  desc: 'Menghapus toko',
  prefix: !0,
  owner: !0,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo,
          tokoName = args.join(' ').trim()

    return !tokoName
      ? conn.sendMessage(chatId, { text: 'Masukkan nama toko yang ingin dihapus!' }, { quoted: msg })
      : (() => {
          let tokoData
          try {
            tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'))
          } catch (err) {
            console.error('Gagal membaca toko.json:', err)
            return conn.sendMessage(chatId, { text: 'Gagal membaca file toko.json' }, { quoted: msg })
          }

          return !tokoData.storeSetting?.[tokoName]
            ? conn.sendMessage(chatId, { text: 'Toko tidak ditemukan dalam daftar.' }, { quoted: msg })
            : (async () => {
                delete tokoData.storeSetting[tokoName]
                fs.writeFileSync(tokoPath, JSON.stringify(tokoData, null, 2))

                const tokoPluginPath = path.join(pluginFolder, `${tokoName}.js`)
                fs.existsSync(tokoPluginPath) && fs.unlinkSync(tokoPluginPath)

                const sent = await conn.sendMessage(chatId, { text: `Toko "${tokoName}" berhasil dihapus.\nplugins/toko/${tokoName}.js` }, { quoted: msg }),
                      key = sent.key

                await new Promise(r => setTimeout(r, 2e3))
                await conn.sendMessage(chatId, { text: 'Bot akan restart dalam 3 detik...', edit: key }, { quoted: msg })
                setTimeout(() => process.exit(1), 3e3)
              })()
        })()
  }
}