import fs from 'fs'
import path from 'path'

export default {
  name: 'addtoko',
  command: ['addtoko'],
  tags: 'Shop Menu',
  desc: 'Menambahkan toko',
  prefix: !0,
  owner: !0,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo,
          tokoName = args.join(' ').trim(),
          tokoPath = './toolkit/set/toko.json',
          pluginFolder = './plugins/toko'

    !tokoName
      ? await conn.sendMessage(chatId, { text: 'Masukkan nama toko yang ingin ditambahkan!' }, { quoted: msg })
      : (() => {
          let tokoData = {}
          try {
            tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'))
          } catch (err) {
            console.error('Gagal membaca toko.json:', err)
            return conn.sendMessage(chatId, { text: 'Gagal membaca file toko.json' }, { quoted: msg })
          }

          tokoData.storeSetting ||= {}
          return tokoData.storeSetting[tokoName]
            ? conn.sendMessage(chatId, { text: 'Toko sudah ada dalam daftar.' }, { quoted: msg })
            : (() => {
                tokoData.storeSetting[tokoName] = []
                fs.writeFileSync(tokoPath, JSON.stringify(tokoData, null, 2))
                !fs.existsSync(pluginFolder) && fs.mkdirSync(pluginFolder, { recursive: !0 })

                const tokoPluginPath = path.join(pluginFolder, `${tokoName}.js`),
                      tokoPluginCode = `
import fs from 'fs'

export default {
  name: '${tokoName}',
  command: ['${tokoName}'],
  tags: 'Toko Menu',
  desc: 'Menampilkan toko ${tokoName}',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo,
          tokoPath = './toolkit/set/toko.json'
    let tokoData
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'))
    } catch {
      return conn.sendMessage(chatId, { text: 'Gagal membaca file toko.json' }, { quoted: msg })
    }
    const items = tokoData.storeSetting['${tokoName}']
    return !items?.length
      ? conn.sendMessage(chatId, { text: 'Toko ini belum memiliki barang.' }, { quoted: msg })
      : conn.sendMessage(chatId, {
          text: \`Daftar barang di toko ${tokoName}:\\n\\n\${items
            .sort((a,b)=>a.name.localeCompare(b.name))
            .map((x,i)=>\`\${i+1}. \${x.name}: \${x.price}\`)
            .join('\\n')}\`
        }, { quoted: msg })
  }
}`

                fs.writeFileSync(tokoPluginPath, tokoPluginCode.trim())
                conn.sendMessage(chatId, { text: `Toko "${tokoName}" berhasil ditambahkan.\nplugins/toko/${tokoName}.js` }, { quoted: msg })
                  .then(async res => {
                    const editKey = res.key
                    await new Promise(r => setTimeout(r, 2e3))
                    await conn.sendMessage(chatId, { text: 'Bot akan restart dalam 3 detik...', edit: editKey }, { quoted: msg })
                    setTimeout(() => process.exit(1), 3e3)
                  })
              })()
        })()
  }
}