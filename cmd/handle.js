import c from "chalk"
import fs from "fs"
import p from "path"
import EventEmitter from "events"
import { authUser } from '../system/db/data.js'
import { own } from '../system/helper.js'
import { cekSpam } from '../system/function.js'

const dir = p.join(dirname, "../cmd/command"),
      cache = {}

class CommandEmitter extends EventEmitter {
  on(def, listener) {
    if (typeof def !== "object" || !def.cmd || !def.run) return super.on(def, listener)
    def.name && (this.pluginName = def.name)
    const cmds = Array.isArray(def.cmd) ? def.cmd : [def.cmd]
    for (const c2 of cmds) {
      super.on(c2.toLowerCase(), async (xp, m, extra) => {
        try {
          if (def.owner && !own(m)) return
          await def.run(xp, m, extra)
        } catch (e) {
          err(c.redBright.bold(`Error ${def.name || c2}: `), e)
        }
      })
    }
    ;(this.cmd ??= []).push(def)
  }
}

const ev = new CommandEmitter()

const unloadByFile = file => {
  if (!file || !ev.cmd) return
  const targets = ev.cmd.filter(x => x.file === file)
  if (!targets.length) return
  for (const t of targets) {
    const cmds = Array.isArray(t.cmd) ? t.cmd : [t.cmd]
    for (const c2 of cmds) ev.removeAllListeners(c2.toLowerCase())
  }
  ev.cmd = ev.cmd.filter(x => x.file !== file)
}

const loadFile = async (f, isReload = !0) => {
  try {
    const fp = p.join(dir, f),
          moduleUrl = `${fp}?update=${Date.now()}`
    isReload ? unloadByFile(f) : null
    const originalOn = ev.on.bind(ev)
    ev.on = def => {
      if (typeof def === 'object' && def.cmd) def.file = f
      originalOn(def)
    }
    const mod = await import(moduleUrl).then(m => m.default || m)
    typeof mod === "function" ? mod(ev) : null
    ev.on = originalOn
  } catch (e) {
    err('error pada loadFile', e)
  }
}

const loadAll = async () => {
  const files = fs.readdirSync(dir).filter(x => x.endsWith(".js"))
  for (const f of files) await loadFile(f, !0)
  const total = ev.cmd ? ev.cmd.length : 0
  log(c.greenBright.bgGrey.bold(`Berhasil memuat ${total} cmd`))
}

const watch = () => {
  const debounceTimers = {}
  try {
    fs.watch(dir, (_, f) => {
      if (!f?.endsWith(".js")) return
      clearTimeout(debounceTimers[f])
      debounceTimers[f] = setTimeout(() => {
        log(c.cyanBright.bold(`${f} diedit`))
        loadFile(f, !0)
      }, 3e2)
    })
  } catch {
    for (const f of fs.readdirSync(dir).filter(x => x.endsWith(".js"))) {
      fs.watchFile(p.join(dir, f), () => {
        log(c.cyanBright.bold(`${f} diedit`))
        loadFile(f, !0)
      })
    }
  }
}

const handleCmd = async (m, xp) => {
  try {
    const { text } = global.getMessageContent(m) || {}
    if (!text) return

    const pfx = [].concat(global.prefix),
          pre = pfx.find(p => text.startsWith(p)),
          usePrefix = pre || '',
          cmdText = pre ? text.slice(pre.length).trim() : text.trim(),
          [cmd, ...args] = cmdText.split(/\s+/),
          lowCmd = cmd?.toLowerCase()
    if (!lowCmd) return

    const chat = global.chat(m),
          sender = (m.key.participant || m.key.remoteJid).replace(/@s\.whatsapp\.net$/, ''),
          user = Object.values(db().key).find(u => u.jid === chat.sender),
          ownerNum = (Array.isArray(global.ownerNumber)
            ? global.ownerNumber
            : [global.ownerNumber]
          ).map(n => n?.replace(/[^0-9]/g, '')),
          eventData = ev.cmd?.find(e =>
            e.name?.toLowerCase() === lowCmd ||
            (Array.isArray(e.cmd) && e.cmd.some(c => c.toLowerCase() === lowCmd))
          )

    if (!eventData) return

    const mode = eventData.prefix ?? true
    if ((mode && !pre) || (!mode && pre)) return

    await authUser(m, chat)

    if ((!global.public || eventData.owner) && !ownerNum.includes(sender)) return

    if ((user && (user.cmd = (user.cmd || 0) + 1, await saveDb())), await cekSpam(xp, m)) return

    ev.emit(lowCmd, xp, m, {
      args,
      chat,
      text,
      command: lowCmd,
      prefix: usePrefix
    })
  } catch (e) {
    err('error pada handleCmd', e)
  }
}

await loadAll()
watch()
export { handleCmd, ev }