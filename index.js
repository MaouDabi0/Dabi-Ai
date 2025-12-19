import './system/global.js'
import c from 'chalk'
import fs from 'fs'
import path from 'path'
import pino from 'pino'
import { makeWASocket, useMultiFileAuthState } from 'baileys'
import { handleCmd, ev } from './cmd/handle.js'
import { signal } from './cmd/interactive.js'
import { evConnect, handleSessionIssue } from './connect/evConnect.js'
import { getGc } from './system/db/data.js'
import { txtWlc, txtLft, mode, banned, bangc } from './system/sys.js'
import { getMetadata, replaceLid, saveLidCache, cleanMsg, groupCache, filter } from './system/function.js'

const tempDir = path.join(dirname, '../temp')
fs.existsSync(tempDir) || fs.mkdirSync(tempDir, { recursive: !0 })

global.lidCache = {}
const logLevel = pino({ level: 'silent' })
let xp

setInterval(() => console.clear(), 6e5)

const startBot = async () => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./connect/session')
    xp = makeWASocket({
      auth: state,
      version: [2, 3000, 1029700657],
      printQRInTerminal: !1,
      syncFullHistory: !1,
      logger: logLevel,
      browser: ['Ubuntu', 'Chrome', '20.0.04']
    })

    xp.ev.on('creds.update', saveCreds)

    if (!state.creds?.me?.id) {
      try {
        const num  = await q(c.blueBright.bold('Nomor: ')),
              code = await xp.requestPairingCode(await global.number(num)),
              show = (code || '').match(/.{1,4}/g)?.join('-') || ''
        log(c.greenBright.bold('Pairing Code:'), c.cyanBright.bold(show))
      } catch (e) {
        if (e?.output?.statusCode === 428 || /Connection Closed/i.test(e?.message || ''))
          return handleSessionIssue('Pairing timeout', startBot)
        throw e
      }
    }

    rl.close()
    evConnect(xp, startBot)
    store.bind(xp.ev)

    xp.ev.on('messages.upsert', async ({ messages }) => {
      for (let m of messages) {
        if (m?.message?.messageContextInfo?.deviceListMetadata) continue

        m = cleanMsg(m)
        m = replaceLid(m)

        const { id, group, sender, pushName, channel } = global.chat(m, botName),
              time = global.time.timeIndo('Asia/Jakarta', 'HH:mm'),
              meta = group
                ? (groupCache.get(id) || await getMetadata(id, xp) || {})
                : {},
              groupName = group ? meta?.subject || 'Grup' : channel ? id : '',
              { text, media } = global.getMessageContent(m),
              name = pushName || sender || id

        if (group && Object.keys(meta).length) {
          await saveLidCache(meta)
        }

        log(
          c.bgGrey.yellowBright.bold(
            group
              ? `[ ${groupName} | ${name} ]`
              : channel
                ? `[ ${groupName} ]`
                : `[ ${name} ]`
          ) +
          c.white.bold(' | ') +
          c.blueBright.bold(`[ ${time} ]`)
        )

        ;(media || text) &&
        log(
          c.white.bold(
            [media && `[ ${media} ]`, text && `[ ${text} ]`]
              .filter(Boolean)
              .join(' ')
          )
        )

        if (banned(sender)) return log(c.yellowBright.bold(`${sender} diban`))

        if (group && bangc({ id, group, sender, pushName, channel })) return log(c.redBright.bold(`Grup ${id} diban`));

        const cht = { id, group, sender, pushName, channel }
        const modeGroup = await mode(xp, cht)
        if (!modeGroup) return

        if (text) {
          try {
            await signal(text, m, sender, id, xp, ev)
          } catch (e) {
            err('error pada response', e)
          }
        }

        const ft = await filter(xp, m, text)
        ft && (
          await ft.antiLink(),
          await ft.antiTagSw(),
          await ft.badword(),
          await ft.antiCh()
        )

        await handleCmd(m, xp, store)
      }
    })

    xp.ev.on('group-participants.update', async u => {
      if (!u.id) return
      groupCache.delete(u.id)

      const meta = await getMetadata(u.id, xp),
            g = meta?.subject || 'Grup',
            idToPhone = Object.fromEntries((meta?.participants || []).map(p => [p.id, p.phoneNumber]))

      for (const pid of u.participants) {
        const phone = pid.phoneNumber || idToPhone[pid],
              msg = u.action === 'add'     ? c.greenBright.bold(`+ ${phone} joined ${g}`) :
                    u.action === 'remove'  ? c.redBright.bold(`- ${phone} left ${g}`) :
                    u.action === 'promote' ? c.magentaBright.bold(`${phone} promoted in ${g}`) :
                    u.action === 'demote'  ? c.cyanBright.bold(`${phone} demoted in ${g}`) : ''
        if (msg) log(msg)

        if (u.action === 'add' || u.action === 'remove') {
          const gcData = getGc({ id: u.id }),
                isAdd = u.action === 'add',
                cfg = isAdd ? gcData?.filter?.welcome?.welcomeGc : gcData?.filter?.left?.leftGc
        
          if (!gcData || !cfg) return
        
          const id = { id: u.id },
                { txt } = await (isAdd ? txtWlc : txtLft)(xp, id),
                jid = pid.phoneNumber || idToPhone[pid],
                mention = '@' + (jid?.split('@')[0] || jid),
                text = txt.replace(/@user|%user/gi, mention)
        
          await xp.sendMessage(u.id, { text, mentions: [jid] })
        }
      }
    })

    xp.ev.on('groups.update', u => 
      u.forEach(async v => {
        if (!v.id) return
        const m = await getMetadata(v.id, xp).catch(() => ({})),
              a = v.participantAlt || v.participant || v.author,
              f = a && m?.participants?.length ? m.participants.find(p => p.id === a) : 0
        v.author = f?.phoneNumber || a
        log(c.cyanBright.bold('Settings: ', m?.subject, '\n'), [v])
      })
    )
  } catch (e) {
    err(c.redBright.bold('Error pada index.js:'), e)
  }
}

startBot()