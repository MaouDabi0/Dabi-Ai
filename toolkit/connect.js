import { DisconnectReason } from '@whiskeysockets/baileys'
import c from 'chalk'
import fs from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const sessionPath = join(__dirname, '../session')

async function initReadline() {
  if (global.rl && !global.rl.closed) return
  const { createInterface } = await import('readline')
  global.rl = createInterface({ input: process.stdin, output: process.stdout })
  global.q = t => new Promise(r => global.rl.question(t, r))
}

const clearSessionAndRestart = async restart => {
  try {
    fs.existsSync(sessionPath)
      ? fs.rmSync(sessionPath, { recursive: !0, force: !0 })
      : console.log(c.redBright.bold('Folder session tidak ada:', sessionPath))
  } catch (e) {
    console.log(c.redBright.bold('Gagal hapus session:', e))
  }
  console.log(c.yellowBright.bold('Restarting...'))
  setTimeout(restart, 500)
}

const handleSessionIssue = async (msg, restart) => {
  console.log(c.redBright.bold('Session error:'), msg)
  await initReadline()
  const ans = await q(c.yellowBright.bold('Hapus session & restart? (y/n): '))
  if (['y', 'ya'].includes(ans.toLowerCase())) {
    await clearSessionAndRestart(restart)
  } else {
    console.log(c.greenBright.bold('Bot dihentikan'))
    process.exit(0)
  }
}

let retryCount = 0, retryTimeout = null
const tryReconnect = async restart => {
  if (++retryCount <= 3) return restart()
  if (retryCount <= 6) {
    if (retryCount === 4) {
      retryTimeout = setTimeout(() => {
        retryTimeout = null
        restart()
      }, 6e4)
      return
    }
    return restart()
  }
  console.log(c.redBright.bold('Reconnect gagal'))
  retryCount = 0
  retryTimeout && clearTimeout(retryTimeout)
  await handleSessionIssue('Session bermasalah', restart)
}

export default function evConnect(xp, restart) {
  xp.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const r = lastDisconnect?.error?.output?.statusCode
      console.log(c.redBright.bold('Koneksi tertutup, status:', r))
      switch (r) {
        case DisconnectReason.badSession:
          return handleSessionIssue('Session rusak', restart)
        case DisconnectReason.loggedOut:
          return handleSessionIssue('Logout dari perangkat lain', restart)
        case DisconnectReason.connectionClosed:
        case DisconnectReason.connectionLost:
        case DisconnectReason.timedOut:
        case 428:
          return tryReconnect(restart)
        case DisconnectReason.restartRequired:
          console.log(c.yellowBright.bold('Restart diperlukan'))
          return restart()
        default:
          console.log(c.yellowBright.bold('Disconnect tidak dikenal, coba reconnect...'))
          return tryReconnect(restart)
      }
    }
    if (connection === 'connecting')
      console.log(c.yellowBright.bold('Menyambungkan...'))
    if (connection === 'open') {
      console.log(c.greenBright.bold('Terhubung'))
      retryCount = 0
    }
  })
}