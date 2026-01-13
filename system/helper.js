import fs from 'fs'
import path from 'path'
import moment from 'moment-timezone'

const number = (input) => {
  const digits = input.replace(/\D/g, '')
  return digits.startsWith("0") ? "62" + digits.slice(1) : digits
}

const own = (m) => {
  const chat = global.chat(m),
        sender = chat.sender.replace(/@s\.whatsapp\.net$/, ''),
        number = Array.isArray(ownerNumber)
          ? ownerNumber.map(n => n.replace(/\D/g, ''))
          : [ownerNumber?.replace(/\D/g, '')]

  return number.includes(sender)
}

const makeInMemoryStore = () => {
  const msg = {},
        loadMsg = async (remoteJid, stanzaId) =>
          msg[remoteJid]?.array?.find(m => m.key?.id === stanzaId) || null,
        bind = (ev) => {
          ev.on('messages.upsert', ({ messages }) => {
            if (!Array.isArray(messages)) return
            for (const m of messages) {
              const jid = m.key?.remoteJid
              if (!jid) continue

              const store = msg[jid] ||= { array: [] }

              if (!store.array.find(x => x.key?.id === m.key?.id)) {
                store.array.push(m)
                if (store.array.length > 100) store.array.shift()
              }
            }
          })
        }

  return { msg, bind, loadMsg }
}

const errDir = path.resolve('../temp'),
      errFile = path.join(errDir, 'error.json'),
      time = moment().tz("Asia/Jakarta").format("DD-MM-YYYY HH:mm:ss"),
      read = f => {
        try {
          const d = JSON.parse(fs.readFileSync(f))
          return Array.isArray(d) ? d : []
        } catch {
          return []
        }
      }

const erl = async (err, from = 'unknown') => {
  try {
    fs.existsSync(errDir) ? !0 : fs.mkdirSync(errDir, { recursive: !0 })

    const logs = fs.existsSync(errFile) ? read(errFile) : [],
          data = {
            time: time,
            from,
            name: err?.name || 'Error',
            message: err?.message || String(err),
            stack: err?.stack || null
          }

    logs.push(data)

    await fs.promises.writeFile(errFile, JSON.stringify(logs, null, 2))
  } catch {}
}

export {
  number,
  own,
  erl,
  makeInMemoryStore
}