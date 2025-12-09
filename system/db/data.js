import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const database = path.join(dirname, 'database.json'),
      dataGc = path.join(dirname, 'dataGc.json')

let init = (() => {
  const load = file => {
    if (!fs.existsSync(file)) return fs.writeFileSync(file, JSON.stringify({ key: {} }, null, 2)), { key: {} }

    try {
      const data = JSON.parse(fs.readFileSync(file))
      return data ? data : (fs.writeFileSync(file, JSON.stringify({ key: {} }, null, 2)), { key: {} })
    } catch (e) {
      err(`${path.basename(file)} rusak`, e),
      fs.writeFileSync(file, JSON.stringify({ key: {} }, null, 2))
      return { key: {} }
    }
  }

  return {
    db: load(database),
    gc: load(dataGc)
  }
})()

const db = () => init.db,
      gc = () => init.gc

const getGc = chat => gc()?.key && Object.values(gc().key).find(g => String(g?.id) === String(chat.id)) || null

const saveDb = async () => {
  try {
    await fs.promises.writeFile(database, JSON.stringify(init.db, null, 2))
  } catch (e) {
    err('error pada saveDb: ', e)
  }
}

const saveGc = () => {
  try {
    fs.writeFileSync(dataGc, JSON.stringify(init.gc, null, 2))
  } catch (e) {
    err('error pada saveGc', e)
  }
}

const role = [
  'Gak Kenal',
  'Baru Kenal',
  'Temen Biasa',
  'Temen Ngobrol',
  'Temen Gosip',
  'Temen Lama',
  'Temen Hangout',
  'Temen Dekat',
  'Temen Akrab',
  'Temen Baik',
  'Sahabat',
  'Pacar',
  'Soulmate'
]

const randomId = m => {
  const letters = 'abcdefghijklmnopqrstuvwxyz',
        pick = s => Array.from({ length: 5 }, () => s[Math.floor(Math.random() * s.length)]),
        jid = (m?.key?.participantAlt || '').replace('@s.whatsapp.net', ''),
        base = [...pick(letters), ...jid.slice(-4)]

  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[base[i], base[j]] = [base[j], base[i]]
  }

  return base.join('')
}

const authUser = async (m, chat) => {
  try {
    const sender = (m.key.participant || m.key.remoteJid),
          pushName = (m.pushName || '-').trim().slice(0, 20),
          group = !!chat?.group,
          pJid = m?.key?.participantAlt || null,
          e = o => Object.values(o || {}).some(u => u.jid === sender)

    if (
      !sender.endsWith('@s.whatsapp.net') ||
      e(db().key) ||
      (group && pJid && sender !== pJid)
    ) return

    const nama = pushName
    let k = nama, i = 1
    while (db().key[k]) k = `${nama}_${i++}`

    db().key[k] = {
      jid: sender,
      noId: randomId(m),
      ban: !1,
      cmd: 0,
      money: 2e5,
      ai: {
        bell: !1,
        chat: 0,
        role: role[0]
      }
    }

    await saveDb()
  } catch (e) {
    err('error pada authUser', e)
    call(xp, e, m)
  }
}

export {
  init,
  db,
  gc,
  getGc,
  saveDb,
  saveGc,
  randomId,
  authUser
}