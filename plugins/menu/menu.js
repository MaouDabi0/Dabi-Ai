import fs from 'fs'
import path from 'path'
import menuCh from '../@set/setMenu-1.js'
import menuDoc from '../@set/setMenu-2.js'
import menuteks from '../@set/setMenu-3.js'
import menuThumb3 from '../@set/setMenu-4.js'

const configPath = new URL('../../toolkit/set/config.json', import.meta.url).pathname,
      dbPath = new URL('../../toolkit/db/database.json', import.meta.url).pathname,
      more = String.fromCharCode(8206),
      readmore = more.repeat(4e3 + 1),
      handlers = { 1: menuCh, 2: menuDoc, 3: menuteks, 4: menuThumb3 }

const loadConfig = () => JSON.parse(fs.readFileSync(configPath, 'utf-8')),
      countPlugins = () => Object.values(global.plugins).filter(p => !(p.__path && p.__path.includes(path.join('plugins', '@set')))).length

function buildMenu(sender, category, prefix) {
  const freshDb = JSON.parse(fs.readFileSync(dbPath, 'utf-8')),
        totalUser = Object.keys(freshDb.Private || {}).length
  let txt = `Halo *${sender}*, Saya adalah asisten virtual.\n\n`;
  txt += `${head} ${Obrack} *Info ${botName}* ${Cbrack}\n`;
  txt += `${side} ${btn} Bot Name: ${botFullName}\n`;
  txt += `${side} ${btn} Owner: ${ownerName}\n`;
  txt += `${side} ${btn} Type: ${type}\n`;
  txt += `${side} ${btn} Tutorial: .help\n`;
  txt += `${side} ${btn} Total Cmd: ${countPlugins()}\n`;
  txt += `${side} ${btn} Total User: ${totalUser}\n`;
  txt += `${side} ${btn} Versi: ${version}\n`;
  txt += `${side} ${btn} Baileys: ${baileys}\n`;
  txt += `${foot}${garis}\n\n${readmore}`;

  const categorized = {}
  for (const [name, plugin] of Object.entries(global.plugins)) {
    if (plugin.__path && plugin.__path.includes('/@set/')) continue
    const tag = loadConfig().pluginCategories[plugin.tags] ? plugin.tags : 'Other Menu'
    ;(categorized[tag] ||= []).push(name)
  }

  const categories = Object.keys(categorized).sort(),
        formatCommands = (title, cmds) => {
          let s = `${head} ${Obrack} *${title}* ${Cbrack}\n`
          cmds.sort().forEach(c => {
            const prem = global.plugins[c]?.premium ? ' *[ premium ]*' : ''
            s += `${side} ${btn} ${prefix}${c}${prem}\n`
          })
          return s + `${foot}${garis}\n\n`
        }

  if (category) {
    const matched = categories.find(c => c.toLowerCase().includes(category))
    txt += matched ? formatCommands(matched, categorized[matched]) : `Kategori '${category}' tidak ditemukan!`
  } else for (const cat of categories) txt += formatCommands(cat, categorized[cat])
  return txt + `${Obrack} ${footer} ${Cbrack}`
}

const menuModule = {
  name: 'menu',
  command: ['menu', 'menuall'],
  tags: 'Info Menu',
  desc: 'Menampilkan menu sesuai mode',
  prefix: !0,

  run: async (conn, msg, ctx) => {
    const config = loadConfig(), handler = handlers[config.menuSetting.setMenu]
    if (!handler) return conn.sendMessage(ctx.chatInfo.chatId, { text: `Mode menu tidak valid. Gunakan setmenu ${Object.keys(handlers).join(' atau ')}` }, { quoted: msg })
    try {
      const category = ctx.args.join(' ').toLowerCase() || null
      return handler.run(conn, msg, ctx, buildMenu(ctx.chatInfo.pushName, category, ctx.prefix))
    } catch (e) {
      console.error('Menu error:', e)
      await conn.sendMessage(ctx.chatInfo.chatId, { text: 'Terjadi kesalahan saat membuka menu.' }, { quoted: msg })
    }
  }
}

export default { ...menuModule, handlers }