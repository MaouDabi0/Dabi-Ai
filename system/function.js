import fetch from 'node-fetch'
import fs from 'fs'
import { bell } from '../cmd/interactive.js'
import { bnk } from './db/data.js'
import { tmpFiles } from './tmpfiles.js'

const memoryCache = {},
      groupCache = new Map(),
      spamData = {}

let imgCache = {}

async function getMetadata(id, xp, retry = 2) {
  if (groupCache.has(id)) return groupCache.get(id)
  try {
    const m = await xp.groupMetadata(id)
    groupCache.set(id, m)
    setTimeout(() => groupCache.delete(id), 12e4)
    return m
  } catch (e) {
    return retry > 0
      ? (await new Promise(r => setTimeout(r, 1e3)), getMetadata(id, xp, retry - 1))
      : null
  }
}

async function saveLidCache(metadata) {
  for (const p of metadata?.participants || []) {
    const phone = p.phoneNumber?.replace(/@.*/, ""),
          lid = p.id?.endsWith("@lid") ? p.id : null
    if (phone && lid) global.lidCache[phone] = lid
  }
}

function replaceLid(o, v = new WeakSet()) {
  if (!o) return o
  if (typeof o == "object") {
    if (v.has(o)) return o
    v.add(o)
    if (Array.isArray(o)) return o.map(i => replaceLid(i, v))
    if (Buffer.isBuffer(o) || o instanceof Uint8Array) return o
    for (const k in o) o[k] = replaceLid(o[k], v)
    return o
  }
  if (typeof o == "string") {
    const e = Object.entries(global.lidCache ?? {})
    if (/@lid$/.test(o)) {
      const p = e.find(([, v]) => v === o)?.[0]
      if (p) return `${p}@s.whatsapp.net`
    }
    return o
      .replace(/@(\d+)@lid/g, (_, i) => {
        const p = e.find(([, v]) => v === `${i}@lid`)?.[0]
        return p ? `@${p}` : `@${i}@lid`
      })
      .replace(/@(\d+)(?!@)/g, (m, l) => {
        const p = e.find(([, v]) => v === `${l}@lid`)?.[0]
        return p ? `@${p}` : m
      })
  }
  return o
}

async function call(xp, e, m) {
  try {
    const err = (typeof e === 'string' ? e : e?.stack || e?.message || String(e))
            .replace(/file:\/\/\/[^\s)]+/g, '')
            .replace(/at\s+/g, '\n→ ')
            .trim(),
          chat = global.chat(m),
          sender = chat.sender || 'unknown',
          txt = `Tolong bantu jelaskan error ini dengan bahasa alami dan ramah pengguna:\n\n${e}`,
          res = await bell(txt, m, xp)

    res?.msg
      ? await xp.sendMessage(chat.id, { text: res.msg }, { quoted: m })
      : await xp.sendMessage(chat.id, { text: `Gagal memproses error: ${res?.message || 'tidak diketahui'}` }, { quoted: m })
  } catch (errSend) {
    await xp.sendMessage(
      m?.chat || m?.key?.remoteJid || 'unknown',
      { text: `Gagal menjalankan call(): ${errSend?.message || String(errSend)}` },
      { quoted: m }
    )
  }
}

const cleanMsg = obj => {
  if (obj == null) return
  if (Array.isArray(obj)) {
    const arr = obj.map(cleanMsg).filter(v => v !== undefined)
    return arr.length ? arr : undefined
  }
  if (typeof obj === 'object') {
    if (Buffer.isBuffer(obj) || ArrayBuffer.isView(obj)) return obj
    const cleaned = Object.entries(obj).reduce((acc, [k, v]) => {
      const c = cleanMsg(v)
      if (c !== undefined) acc[k] = c
      return acc
    }, {})
    return Object.keys(cleaned).length ? cleaned : undefined
  }
  return obj
}

async function func() {
  const url = 'https://raw.githubusercontent.com/MaouDabi0/Dabi-Ai-Documentation/main/assets/func.js',
        code = await fetch(url).then(r => r.text()),
        data = 'data:text/javascript;base64,' + Buffer.from(code).toString('base64'),
        md = await import(data),
        funcs = md.default

  return Object.assign(global, funcs), funcs
}

async function filter(xp, m, text) {
  const chat = global.chat(m),
        gcData = getGc(chat),
        { usrAdm, botAdm } = await grupify(xp, m)

  const filter = {
    link: async t => !!t && /chat\.whatsapp\.com/i.test(t),
    linkCh: async t => !!t && /whatsapp\.com\/channel/i.test(t),

    antiLink: async () => {
      const txt = m.message?.extendedTextMessage?.text
      if (!gcData || !botAdm) return

      const isLink = await filter.link(txt)
      return (gcData?.filter?.antilink && botAdm && !usrAdm && isLink)
        ? await xp.sendMessage(chat.id, { delete: m.key }).catch(() => {})
        : !1
    },

    antiTagSw: async () => {
      const txt = m.message?.groupStatusMentionMessage
      if (!gcData || !botAdm) return

      return (gcData?.filter?.antitagsw && botAdm && !usrAdm && txt)
        ? await xp.sendMessage(chat.id, { delete: m.key }).catch(() => {})
        : !1
    },

    badword: async () => {
      if (!gcData || !botAdm) return

      const txt = m.message?.extendedTextMessage?.text,
            cfg = gcData?.filter?.badword,
            list = cfg?.badwordtext,
            isBot = m.key?.fromMe

      if (!cfg?.antibadword || !txt || !Array.isArray(list) || isBot) return

      const hit = list.some(w => txt.toLowerCase().includes(w.toLowerCase()))

      return hit && !usrAdm
        ? await xp.sendMessage(chat.id, { delete: m.key }).catch(() => {})
        : !1
    },

    antiCh: async () => {
      if (!gcData || !botAdm || !gcData?.filter?.antich || usrAdm || m.key?.fromMe) return !1

      const ch =
        m.message?.extendedTextMessage?.contextInfo ??
        m.message?.imageMessage?.contextInfo ??
        m.message?.videoMessage?.contextInfo ??
        m.message?.audioMessage?.contextInfo ??
        m.message?.stickerMessage?.contextInfo

      let info = ch?.forwardedNewsletterMessageInfo

      !info && ch?.stanzaId && global.store && (
        info = (await (async () => {
          const msg = (await global.store.loadMsg(chat.id, ch.stanzaId))?.message
          return msg && Object.values(msg)[0]
        })())?.contextInfo?.forwardedNewsletterMessageInfo
      )

      return info?.newsletterJid
        ? xp.sendMessage(chat.id, { delete: m.key }).catch(() => !1)
        : !1
    }
  }

  return filter
}

async function cekSpam(xp, m) {
  const chat = global.chat(m),
        user = m.key.participant || chat.sender,
        usrData = Object.values(db().key).find(u => u.jid === user),
        now = Date.now(),
        target = usrData?.jid

  if (!usrData) return !1

  if (!spamData[target]) {
    return spamData[target] = {
      count: 1,
      time: { last: now }
    }, !1
  }

  const diff = now - spamData[target].time.last

  if (diff <= 1e3) {

    spamData[target].count++,
    spamData[target].time.last = now

    if (spamData[target].count >= 2) {

      await xp.sendMessage(chat.id, { text: 'jangan spam' }, { quoted: m })

      return spamData[target].count = 0, !0
    }

    return !1
  }

  return diff >= 5e3
    ? (spamData[target] = {
        count: 1,
        time: { last: now }
      }, !1)
    : (spamData[target].time.last = now, !1)
}

async function _imgTmp() {
  if (!fs.existsSync('./system/set/thumb-dabi.png')) return

  const img = fs.readFileSync('./system/set/thumb-dabi.png')

  if (!img || imgCache.url) {
    if (!img) return

    const res = imgCache.url ? await fetch(imgCache.url,{method:'HEAD'}).catch(_=>!1) : null
    if (res && res.ok) return imgCache.url
    if (imgCache.url) delete imgCache.url
  }

  return imgCache.url = await tmpFiles(img)
}

async function afk(xp, m) {
  const chat = global.chat(m),
        q = m.message?.extendedTextMessage?.contextInfo,
        target = q?.mentionedJid || q?.participant,
        users = Object.values(db().key),
        self = users.find(u => u.jid === chat?.sender),
        targetUser = users.find(u => u.jid === target),
        nowStr = global.time.timeIndo('Asia/Jakarta', 'DD-MM HH:mm:ss'),
        calcDur = afk => {
          const start = afk?.afkStart || nowStr,
                [d, mo, h, mi, s] = start.match(/\d+/g).map(Number),
                [nd, nmo, nh, nmi, ns] = nowStr.match(/\d+/g).map(Number),
                diffSec = Math.floor(
                  (new Date(new Date().getFullYear(), nmo - 1, nd, nh, nmi, ns)
                  - new Date(new Date().getFullYear(), mo - 1, d, h, mi, s)) / 1e3
                ),
                diffMin = Math.floor(diffSec / 60),
                diffHour = Math.floor(diffMin / 60)
          return diffSec < 60 ? 'baru saja'
               : diffMin < 60 ? `${diffMin} menit yang lalu`
               : diffHour < 24 ? `${diffHour} jam yang lalu`
               : `${Math.floor(diffHour / 24)} hari yang lalu`
        }

  if (!chat?.sender || m.key?.fromMe) return !1

  if (targetUser?.afk?.status && target === targetUser.jid) {
    return await xp.sendMessage(chat.id, { text: `jangan tag dia, dia sedang afk\nWaktu AFK: ${calcDur(targetUser.afk)}` }, { quoted: m })
  }

  if (!self?.afk?.status) return !1

  const reason = self.afk.reason || 'tidak ada alasan',
        afkDuration = calcDur(self.afk)

  self.afk.status = !1
  self.afk.reason = ''
  self.afk.afkStart = ''
  save.db()

  return xp.sendMessage(chat.id, { text: `Kamu kembali dari AFK: "${reason}"\nWaktu AFK: ${afkDuration}` }, { quoted: m })
}

async function _tax(xp, m) {
  const chat = global.chat(m),
        usrDb = Object.values(db().key).find(u => u.jid === chat.sender),
        taxStr = bnk().key?.tax || '0%',
        tax = parseInt(taxStr.replace('%', '')) || 0,
        money = usrDb?.moneyDb?.money || 0

  return Math.floor(money * tax / 100)
}

export {
  getMetadata,
  replaceLid,
  saveLidCache,
  call,
  cleanMsg,
  groupCache,
  imgCache,
  func,
  filter,
  cekSpam,
  afk,
  _imgTmp,
  _tax
}