import './system/global.js'
import c from 'chalk'
import fs from 'fs'
import path from 'path'
import pino from 'pino'
import readline from 'readline'
import { makeWASocket, useMultiFileAuthState } from 'baileys'
import { handleCmd, ev } from './cmd/handle.js'
import { signal } from './cmd/interactive.js'
import { evConnect, handleSessionIssue } from './connect/evConnect.js'
import { autofarm } from './system/gamefunc.js'
import getMessageContent from './system/msg.js'
import { init, authFarm } from './system/db/data.js'
import { txtWlc, txtLft, mode, banned, bangc } from './system/sys.js'
import { getMetadata, replaceLid, saveLidCache, cleanMsg, filter, imgCache, _imgTmp, afk } from './system/function.js'

global.rl = readline.createInterface({ input: process.stdin, output: process.stdout })
global.q = (t) => new Promise((r) => rl.question(t, r))
global.lidCache = {}

const logLevel = pino({ level: 'silent' }),
      tempDir = path.join(dirname, '../temp')

let xp,
    ft

if (!imgCache.url) await _imgTmp()

fs.existsSync(tempDir) || fs.mkdirSync(tempDir, { recursive: !0 })
setInterval(() => console.clear(), 6e5)
init

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
    autofarm()

    xp.ev.on('messages.upsert', async ({ messages }) => {
      for (let m of messages) {
        if (m?.message?.messageContextInfo?.deviceListMetadata && !Object.keys(m.message).some(k => k === 'conversation' || k === 'extendedTextMessage')) continue

        m = cleanMsg(m)
        m = replaceLid(m)

        const chat = global.chat(m, botName),
              time = global.time.timeIndo('Asia/Jakarta', 'HH:mm'),
              meta = chat.group
                ? (groupCache.get(chat.id) || await getMetadata(chat.id, xp) || {})
                : {},
              groupName = chat.group ? meta?.subject || 'Grup' : chat.channel ? chat.id : '',
              { text, media } = getMessageContent(m),
              name = chat.pushName || chat.sender || chat.id,
              isMode = await mode(xp, chat),
              gcData = chat.group && getGc(chat)

        if (chat.group && Object.keys(meta).length) { await saveLidCache(meta) }

        log(
          c.bgGrey.yellowBright.bold(
            chat.group
              ? `[ ${groupName} | ${name} ]`
              : chat.channel
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

        if (banned(chat)) return log(c.yellowBright.bold(`${chat.sender} diban`))
        if (chat.group && bangc(chat)) return

        await afk(xp, m)
        await authFarm(m)

        if (chat.group) {
          ft = await filter(xp, m, text)
          ft && (
            ft.antiLink(),
            ft.antiTagSw(),
            ft.badword(),
            ft.antiCh()
          )
        }

        if (!isMode) return

        if (gcData) {
          const { usrAdm, botAdm } = await grupify(xp, m)
          if (gcData.filter?.mute && !usrAdm) return !1
        }

        if (text) await signal(text, m, xp, ev)

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
      })
    )
  } catch (e) {
    err(c.redBright.bold('Error pada index.js:'), e)
  }
}

startBot()