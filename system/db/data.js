import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const database = path.join(dirname, 'database.json'),
      dataGc = path.join(dirname, 'datagc.json'),
      datagame = path.join(dirname, 'datagame.json'),
      bankdb = path.join(dirname, 'bank.json')

let saving = Promise.resolve(),
    init = (() => {
  const load = (file, def = { key: {} }) => {
    if (!fs.existsSync(file))
      return fs.writeFileSync(file, JSON.stringify(def, null, 2)), def

    try {
      const data = JSON.parse(fs.readFileSync(file))
      return data ? data : (fs.writeFileSync(file, JSON.stringify(def, null, 2)), def)
    } catch (e) {
      console.error(`${path.basename(file)} rusak`, e)
      fs.writeFileSync(file, JSON.stringify(def, null, 2))
      return def
    }
  }

  const inBank = () => load(bankdb, { key: { saldo: 0, tax: '12%' } }),
        gm = () => load(datagame, { key: { farm: {} } })

  return {
    db: load(database),
    gc: load(dataGc),
    gm: gm(),
    bnk: inBank()
  }
})()

const db = () => init.db,
      gc = () => init.gc,
      gm = () => init.gm,
      bnk = () => init.bnk

const getUsr = jid => Object.values(db().key).find(u => u.jid === jid)

const getGc = chat => gc()?.key && Object.values(gc().key).find(g => String(g?.id) === String(chat.id)) || null

const save = {
  db() {
    saving = saving.then(async () => {
      try {
        await fs.promises.writeFile(
          database,
          JSON.stringify(init.db, null, 2)
        )
      } catch (e) {
        console.error('error pada save.db', e)
        erl(e, 'save.db')
      }
    })
    return saving
  },

  gm() {
    saving = saving.then(async () => {
      try {
        await fs.promises.writeFile(
          datagame,
          JSON.stringify(init.gm, null, 2)
        )
      } catch (e) {
        console.error('error pada save.gm', e)
        erl(e, 'save.gm')
      }
    })
    return saving
  },

  gc() {
    saving = saving.then(async () => {
      try {
        await fs.promises.writeFile(
          dataGc,
          JSON.stringify(init.gc, null, 2)
        )
      } catch (e) {
        console.log('error pada save.gc', e)
        erl(e, 'save.gc')
      }
    })
    return saving
  }
}

const listRole = [
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

const role = jid => {
  const user = getUsr(jid)
  if (!user?.ai) return

  const exp = user.exp || 0,
        maxExp = 2000,
        len = listRole.length,
        step = maxExp / len,
        idx = Math.min(len - 1, Math.floor(exp / step)),
        newRole = listRole[idx]

  user.ai.role !== newRole && (
    user.ai.role = newRole,
    !0
  )
}

const randomId = m => {
  const chat = global.chat(m),
        letters = 'abcdefghijklmnopqrstuvwxyz',
        pick = s => Array.from({ length: 5 }, () => s[Math.floor(Math.random() * s.length)]),
        jid = chat.sender?.replace(/@s\.whatsapp\.net$/, ''),
        base = [...pick(letters), ...jid.slice(-4)]

  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[base[i], base[j]] = [base[j], base[i]]
  }

  return base.join('')
}

const authUser = async (m) => {
  try {
    const chat = global.chat(m),
          group = !!chat?.group,
          e = o => Object.values(o || {}).some(u => u.jid === chat.sender),
          time = global.time.timeIndo("Asia/Jakarta", "DD-MM-YYYY")

    if (
      !chat.sender?.endsWith('@s.whatsapp.net') ||
      e(db().key) ||
      (group && chat.sender && chat.sender !== chat.sender)
    ) return

    const nama = chat.pushName?.trim().slice(0, 20)
    let k = nama, i = 1
    while (db().key[k]) k = `${nama}_${i++}`

    db().key[k] = {
      jid: chat.sender,
      noId: randomId(m),
      acc: time,
      ban: !1,
      cmd: 0,
      exp: 0,
      moneyDb: {
        money: 2e5,
        moneyInBank: 0
      },
      ai: {
        bell: !1,
        chat: 0,
        role: listRole[0]
      },
      afk: {
        status: !1,
        reason: '',
        afkStart: ''
      },
      game: {
        farm: !1
      }
    }

    save.db()
  } catch (e) {
    console.error('error pada authUser', e)
  }
}

const authFarm = async m => {
  try {
    const chat = global.chat(m),
          userDb = getUsr(chat.sender),
          gameDb = Object.values(gm().key.farm).find(u => u.jid === chat.sender),
          group = !!chat?.group,
          time = global.time.timeIndo("Asia/Jakarta", "DD-MM-YYYY HH:mm:ss"),
          nama = chat.pushName?.trim().slice(0, 20),
          costMny =
            (userDb?.moneyDb?.money ?? 0) +
            (userDb?.moneyDb?.moneyInBank ?? 0)

    if (
      !chat.sender?.endsWith('@s.whatsapp.net') ||
      gameDb
    ) return

    let k = nama, i = 1
    while (gm().key.farm[k]) k = `${nama}_${i++}`

    gm().key.farm[k] = {
      jid: chat.sender,
      set: time,
      exp: userDb?.exp || 0,
      moneyDb: {
        money: costMny
      }
    }

    save.gm()
  } catch (e) {
    console.log('error pada authFarm', e)
  }
}

export {
  init,
  db,
  gc,
  gm,
  bnk,
  authFarm,
  getGc,
  save,
  role,
  randomId,
  authUser
}