import fs from "fs";
import path from "path";
import moment from "moment-timezone";
import { exec } from "child_process";
import axios from "axios";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url),
      __dirname = path.dirname(__filename),
      plugDir = path.join(__dirname, '../plugins'),
      dbDir = path.join(__dirname, './db'),
      dbFile = path.join(dbDir, 'database.json')

let db = { Private: {}, Grup: {} }

const loadPlug = async () => {
  if (!fs.existsSync(plugDir)) return
  let ok = 0, fail = 0, logs = []
  global.plugins = {}, global.categories = {}

  for (const folder of fs.readdirSync(plugDir)) {
    const fPath = path.join(plugDir, folder)
    if (!fs.statSync(fPath).isDirectory()) continue
    for (const file of fs.readdirSync(fPath).filter(f => f.endsWith('.js'))) {
      const fullPath = path.join(fPath, file)
      try {
        const plug = (await import(`${fullPath}?update=${Date.now()}`)).default
        if (plug?.run) {
          const name = path.basename(file, '.js'),
                tag = plug.tags || 'Uncategorized'
          plug.__path = fullPath
          global.plugins[name] = plug
          global.categories[tag] ??= []
          global.categories[tag].push(plug.command)
          ok++
        }
      } catch (e) { fail++, logs.push(`${file}: ${e.message}`) }
    }
  }

  !fail ? console.log(chalk.greenBright.bold(`${ok} plugin dimuat.`))
        : (logs.forEach(msg => console.log(chalk.redBright.bold(msg))),
           console.log(chalk.yellowBright.bold(`${ok} plugin dimuat, ${fail} gagal.`)))

  return { ok, fail, logs }
},

initDB = () => {
  if (!fs.existsSync(dbDir) && fs.mkdirSync(dbDir, { recursive: !0 }),
      !fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify(db, null, 2e0))
  else try {
    const raw = fs.readFileSync(dbFile, 'utf-8')
    db = raw ? JSON.parse(raw) : db
  } catch (e) { console.error('Gagal membaca file db:', e) }
},

getDB = () => db,

saveDB = () => {
  try { fs.writeFileSync(dbFile, JSON.stringify(db, null, 2e0)) }
  catch (e) { console.error('[DB] Gagal simpan:', e) }
},

getUser = id => {
  const { Private } = getDB()
  if (!Private) return null
  const key = Object.keys(Private).find(k => Private[k]?.Nomor === id)
  return key ? { key, data: Private[key] } : null
},

getGc = (db, chatId) => db?.Grup && Object.values(db.Grup).find(g => String(g?.Id) === String(chatId)) || null,

getWelTxt = id => {
  const gc = getGc(db, id)?.gbFilter?.Welcome
  const text = gc?.welcomeText?.trim() || '👋 Selamat datang @user di grup!'
  const media = gc?.content?.media || ''
  return { text, media }
},

enWelcome = id => getGc(db, id)?.gbFilter?.Welcome?.welcome === !0,
enLeft = id => getGc(db, id)?.gbFilter?.Left?.gcLeft === !0,
getLeftTxt = id => {
  const gc = getGc(db, id)?.gbFilter?.Left
  const text = gc?.leftText?.trim() || '👋 Selamat tinggal @user!'
  const media = gc?.content?.media || ''
  return { text, media }
},

ensureGc = id => (db.Grup[id] ??= { id, gbFilter: {} }, db.Grup[id]),

setWelcome = (id, on, txt) => {
  const gc = ensureGc(id)
  gc.gbFilter.Welcome = { ...(gc.gbFilter.Welcome || {}), welcome: on }
  if (txt) gc.gbFilter.Welcome.welcomeText = txt
  saveDB()
},

setLeft = (id, on, txt) => {
  const gc = ensureGc(id)
  gc.gbFilter.Left = { ...(gc.gbFilter.Left || {}), gcLeft: on }
  if (txt) gc.gbFilter.Left.leftText = txt
  saveDB()
},

exGrup = async (conn, chatId, senderId) => {
  const meta = await getMetadata(chatId, conn)
  if (!meta) return {}
  const admins = (meta.participants || []).filter(p => p.admin).map(p => p.phoneNumber),
        botId = `${conn.user?.id?.split(':')[0]}@s.whatsapp.net`
  return {
    meta,
    groupName: meta.subject,
    botId,
    botAdmin: admins.includes(botId),
    userAdmin: admins.includes(senderId),
    admins
  }
},

Format = {
  time: () => moment().format('HH:mm'),
  realTime: () => moment().tz('Asia/Jakarta').format('HH:mm:ss DD-MM-YYYY'),
  date: ts => moment(ts * 1e3).format('DD-MM-YYYY'),
  uptime: () => `${Math.floor(process.uptime() / 3600)}h ${Math.floor(process.uptime() % 3600 / 60)}m`,
  duration: (s, e) => {
    const d = e - s,
          day = Math.floor(d / 864e5),
          h = Math.floor(d % 864e5 / 36e5),
          m = Math.floor(d % 36e5 / 6e4)
    return `${day ? day + ' Hari ' : ''}${h ? h + ' Jam ' : ''}${m ? m + ' Menit' : ''}`.trim()
  },
  toTime: ms => {
    if (!ms || typeof ms !== 'number') return '-'
    const d = Math.floor(ms / 864e5),
          h = Math.floor(ms % 864e5 / 36e5),
          m = Math.floor(ms % 36e5 / 6e4),
          s = Math.floor(ms % 6e4 / 1e3)
    return `${d ? d + ' Hari ' : ''}${h ? h + ' Jam ' : ''}${m ? m + ' Menit ' : ''}${s ? s + ' Detik' : ''}`.trim()
  },
  parseDur: str => {
    const [, n, u] = /^(\d+)([smhd])$/i.exec(str) || [],
          map = { s: 1e3, m: 6e4, h: 36e5, d: 864e5 }
    return map[u?.toLowerCase()] ? parseInt(n) * map[u.toLowerCase()] : null
  },
  toNum: n => typeof n === 'number' ? n.toLocaleString('id-ID') : '-',
  indoTime: (zone = 'Asia/Jakarta', fmt = 'HH:mm:ss DD-MM-YYYY') => moment().tz(zone).format(fmt)
},

target = (msg, sender) => {
  const ctx = msg.message?.extendedTextMessage?.contextInfo || {},
        clean = jid => jid?.replace(/@s\.whatsapp\.net$/i, '').replace(/\D/g, '')
  return ctx.quotedMessage && ctx.participant ? clean(ctx.participant)
       : ctx.mentionedJid?.length ? clean(ctx.mentionedJid[0])
       : msg.key?.participant ? clean(msg.key.participant)
       : clean(sender)
},

getSender = msg => {
  const chatId = msg?.key?.remoteJid,
        isGc = chatId?.endsWith('@g.us'),
        senderId = isGc ? msg.key.participant : chatId
  return { chatId, senderId }
},

isOwner = async (plugin, conn, msg) => {
  try {
    if (plugin.owner) {
      const { chatId, senderId } = getSender(msg),
            num = senderId.replace(/\D/g, '')
      if (!global.ownerNumber.includes(num))
        return await conn.sendMessage(chatId, { text: owner }, { quoted: msg }), !1
    }
    return !0
  } catch {
    return !1
  }
},

isPrem = async (plugin, conn, msg) => {
  if (plugin.premium) {
    const { chatId, senderId } = getSender(msg),
          usr = global.getUserData(senderId)
    if (!usr?.isPremium?.isPrem)
      return await conn.sendMessage(chatId, {
        text: prem,
        contextInfo: {
          externalAdReply: {
            title: 'Stop',
            body: 'Hanya Untuk Pengguna Premium',
            thumbnailUrl: 'https://c.termai.cc/i56/Fg50KYE.jpg',
            mediaType: 1,
            renderLargerThumbnail: !0
          },
          forwardingScore: 1,
          isForwarded: !0,
          forwardedNewsletterMessageInfo: { newsletterJid: idCh }
        }
      }, { quoted: msg }), !1
  }
  return !0
},

updateBio = async conn => {
  clearInterval(global.bioInterval)
  global.bioInterval = setInterval(async () => {
    if (!global.autoBio) return clearInterval(global.bioInterval)
    try {
      const bio = global.bioText
        .replace(/<waktu>|<time>/gi, Format.uptime())
        .replace(/<botName>/gi, global.botName)
      await conn.updateProfileStatus(bio)
    } catch (e) {
      console.error(chalk.redBright.bold('Bio gagal diperbarui:'), e)
    }
  }, 60e3)
},

getDBFlag = (userId, chatId, key) => {
  const db = getDB(),
        isPrivate = chatId.endsWith('@s.whatsapp.net'),
        source = isPrivate ? db.Private : db.Grup
  return Object.values(source || {}).some(e =>
    (isPrivate ? e.Nomor === userId : e.Id === chatId) && e[key] === !0
  )
},

exCht = (msg = {}, conn) => {
  const chatId = msg?.key?.remoteJid ?? '',
        isGroup = chatId.endsWith('@g.us'),
        participant = msg?.key?.participant || msg?.participant || msg?.message?.extendedTextMessage?.contextInfo?.participant || msg?.message?.sender || '',
        senderId = msg?.key?.fromMe ? conn?.user?.id?.split(':')[0] + '@s.whatsapp.net' : participant || chatId,
        pushName = (msg?.pushName || global.botName || 'User').trim()

  if (isGroup && senderId === chatId) senderId = participant || msg?.key?.participant || ''
  return (
    { chatId: replaceLid(chatId), isGroup, senderId: replaceLid(senderId), pushName }
  )
},

chtEmt = async (txt, msg, userId, chatId, conn) => {
  const { chatId: exChatId, isGroup, senderId, pushName } = exCht(msg, conn),
        botId = conn.user?.id?.split(':')[0] + '@s.whatsapp.net',
        botName = (global.botName || '').toLowerCase(),
        prefixes = [].concat(global.setting?.isPrefix || '.'),
        ctx = msg.message?.extendedTextMessage?.contextInfo || msg.message?.imageMessage?.contextInfo || msg.message?.videoMessage?.contextInfo || msg.message?.documentMessage?.contextInfo || {},
        { mentionedJid = [], participant = '' } = ctx,
        isReplyBot = participant === botId,
        isMentionBot = mentionedJid.includes(botId),
        ai = getDBFlag(userId, exChatId, 'autoai'),
        bell = getDBFlag(userId, exChatId, 'bell'),
        caption = msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption || msg.message?.documentMessage?.caption || txt || '',
        lowerCaption = caption.toLowerCase(),
        triggered = isReplyBot || isMentionBot || (botName && lowerCaption.includes(botName)),
        fromMe = msg.key?.fromMe || msg.participant === botId,
        prefixDetected = txt && prefixes.some(p => txt.startsWith(p))

  if (prefixDetected || fromMe || (!ai && !bell) || !triggered) return !1

  if (ai) {
    const r = await global.ai(caption, msg, userId)
    r?.msg && await conn.sendMessage(exChatId, { text: r.msg }, { quoted: msg })
  }

  if (bell) {
    const r = await Bella(caption, msg, userId, conn, exChatId),
          cmds = [
            {
              cmd: 'play',
              args: !0,
              msg: !1
            },
            {
              cmd: 'stiker',
              args: !0,
              msg: !1
            },
            {
              cmd: 'closegroup',
              cmdP: ['close'],
              args: !1,
              msg: !0
            },
            {
              cmd: 'opengroup',
              cmdP: ['open'],
              args: !1,
              msg: !0
            },
            {
              cmd: 'cekkey',
              args: !0,
              msg: !0
            },
            {
              cmd: 'menu',
              args: !0,
              msg: !0
            },
            {
              cmd: 'i2i',
              cmdP: ['i2i', 'img2img'],
              args: !0,
              msg: !0
            },
            {
              cmd: 'join',
              cmdP: ['masuk'],
              args: !0,
              msg: !0
            },
            {
              cmd: 'toimg',
              cmdP: ['toimg'],
              args: !0,
              msg: !1
            }
          ]

    if (r.cmd === 'voice' && r.audio)
      await conn.sendMessage(exChatId, { audio: r.audio, mimetype: 'audio/mpeg', ptt: !0 }, { quoted: msg })
    else if (!cmds.some(c => c.cmd === (r.cmd?.toLowerCase() || '') && !c.msg) && r.msg)
      await conn.sendMessage(exChatId, { text: r.msg }, { quoted: msg })

    if (r.cmd) {
      const cmdLower = r.cmd.toLowerCase(),
            cmdConfig = cmds.find(c => c.cmd === cmdLower)
      if (!cmdConfig) return !0

      const cmdP = cmdConfig?.cmdP?.length ? cmdConfig.cmdP : [cmdLower]
      cmdConfig?.args && (r.args = [r.msg])

      let foundPlugin = !1
      for (const [fileName, plugin] of Object.entries(global.plugins)) {
        const pluginCmds = plugin?.command?.map(c => c.trim().toLowerCase()) || [],
              cmdPnorm = cmdP.map(c => c.trim().toLowerCase()),
              match = pluginCmds.some(c => cmdPnorm.includes(c))
        if (!match) continue

        foundPlugin = !0
        try {
          await plugin.run(conn, msg, {
            chatInfo: { chatId: exChatId, senderId, isGroup },
            prefix: '',
            commandText: cmdPnorm[0],
            args: r.args || []
          })
        } catch (err) {
          console.error(`[plugin ${fileName}]`, err.stack)
        }
        break
      }
      if (!foundPlugin) return !0
    }
  }
  return !0
},

exTxtMsg = msg =>
  msg.body || msg.message?.conversation || msg.message?.extendedTextMessage?.text ||
  msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption ||
  msg.message?.documentMessage?.fileName || msg.message?.locationMessage?.name ||
  msg.message?.locationMessage?.address || msg.message?.contactMessage?.displayName ||
  msg.message?.pollCreationMessage?.name || msg.message?.reactionMessage?.text || '',

parseMessage = (msg, prefixes) => {
  const chatInfo = exCht(msg),
        txt = exTxtMsg(msg)
  if (!txt) return null
  const prefix = prefixes.find(p => txt.startsWith(p))
  if (!prefix) return null
  const args = txt.slice(prefix.length).trim().split(/\s+/),
        commandText = args.shift()?.toLowerCase()
  return { chatInfo, textMessage: txt, prefix, commandText, args }
},

parseNoPrefix = msg => {
  const chatInfo = exCht(msg),
        txt = exTxtMsg(msg)
  if (!txt) return null
  const args = txt.trim().split(/\s+/),
        commandText = args.shift()?.toLowerCase()
  return { chatInfo, textMessage: txt, prefix: '', commandText, args }
},

randomId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz',
        randStr = [...Array(7)].map(() => chars[Math.floor(Math.random() * chars.length)]).join(''),
        randNum = Math.floor(Math.random() * 100) + 1
  return randStr + randNum
},

authUser = (msg, chatInfo) => {
  const db = getDB(),
        { senderId, isGroup, chatId } = chatInfo,
        nama = (msg.pushName || '-').trim().slice(0, 30)
  if (Object.values(db.Private || {}).some(u => u.Nomor === senderId)) return
  const fromP = msg?.key?.participant || null
  if (isGroup && fromP && senderId !== fromP) return
  if (!isGroup && Object.values(db.Private || {}).some(u => u.Nomor === chatId)) return
  db.Private ??= {}
  let finalName = nama, c = 1
  while (db.Private[finalName]) finalName = `${nama}_${c++}`
  db.Private[finalName] = {
    Nomor: senderId, noId: randomId(), autoai: !1, bell: !1, cmd: 0, claim: !1, ban: !1,
    money: { amount: 3e5 },
    isPremium: { isPrem: !1, time: 0 },
    afk: {}
  }
  saveDB()
},

banned = userId => {
  let user = getUser(userId)
  if (!user) {
    const db = getDB(),
          clean = userId.replace(/\D/g, ''),
          found = Object.values(db.Private || {}).find(u => u?.Nomor?.replace(/\D/g, '').endsWith(clean))
    user = found ? { data: found } : null
  }
  const nomor = user?.data?.Nomor,
        ban = user?.data?.ban
  return ban === !0
}

async function shopHandle(conn, msg, txt, chatId, userId) {
  const quoted = msg.message?.extendedTextMessage?.contextInfo
  if (
    !quoted ||
    txt?.trim().toLowerCase() !== 'done' ||
    !global.ownerNumber.includes(userId.replace(/\D/g, '')) ||
    !fs.existsSync(dbPath)
  ) return

  const { stanzaId: qId, participant: qUser } = quoted,
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8')),
        orders = dbData.pendingOrders || [],
        order = orders.find(o => o.userId === qUser && o.idChat === qId)

  if (!order) return conn.sendMessage(chatId, { text: 'Transaksi tidak ditemukan.' }, { quoted: msg })

  dbData.pendingOrders = orders.filter(o => o.userId !== qUser || o.idChat !== qId)
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2))

  const res = `Pembelian dikonfirmasi\n\nUser: @${qUser.split('@')[0]}\nToko: ${order.toko}\nBarang: ${order.barang}\nHarga: Rp${parseInt(order.harga).toLocaleString()}`
  await conn.sendMessage(chatId, { text: res, mentions: [qUser] }, { quoted: msg })
}

const Sys = {
  loadPlug,
  initDB,
  getDB,
  saveDB,
  getUser,
  getGc,
  enWelcome,
  getWelTxt,
  enLeft,
  getLeftTxt,
  ensureGc,
  setWelcome,
  setLeft,
  exGrup,
  Format,
  target,
  getSender,
  isOwner,
  isPrem,
  updateBio,
  getDBFlag,
  chtEmt,
  exCht,
  parseMessage,
  parseNoPrefix,
  authUser,
  shopHandle,
  banned,
};

export default Sys;