import fetch from 'node-fetch'
import { bell } from '../cmd/interactive.js'
import { saveGc, getGc } from './db/data.js'

const memoryCache = {},
      groupCache = new Map(),
      spamData = {}

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

async function call(xp, error, m) {
  try {
    const errMsg = (typeof error === 'string' ? error : error?.stack || error?.message || String(error))
            .replace(/file:\/\/\/[^\s)]+/g, '')
            .replace(/at\s+/g, '\n→ ')
            .trim(),
          sender = m?.key?.participant || m?.participant || m?.sender || 'unknown',
          chatId = m?.chat || m?.key?.remoteJid || sender,
          prompt = `Tolong bantu jelaskan error ini dengan bahasa alami dan ramah pengguna:\n\n${errMsg}`,
          res = await bell(prompt, prompt, m, sender, xp, chatId)

    res?.msg
      ? await xp.sendMessage(chatId, { text: res.msg }, { quoted: m })
      : await xp.sendMessage(chatId, { text: `Gagal memproses error: ${res?.message || 'tidak diketahui'}` }, { quoted: m })
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
        { usrAdm, botAdm } = await global.grupify(xp, chat.id, chat.sender)

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

export {
  getMetadata,
  replaceLid,
  saveLidCache,
  call,
  cleanMsg,
  groupCache,
  func,
  filter,
  cekSpam
}