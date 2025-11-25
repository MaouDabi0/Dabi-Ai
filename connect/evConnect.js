import { DisconnectReason } from 'baileys'
import c from 'chalk'
import fs from 'fs'
import path from 'path'

const sessionPath = path.join(dirname, '../connect/session')

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
      : log(c.redBright.bold('Folder session tidak ada:', sessionPath))
  } catch (e) {
    err(c.redBright.bold('Gagal hapus session:', e))
  }
  log(c.yellowBright.bold('Restarting...'))
  setTimeout(restart, 5e2)
}

const handleSessionIssue = async (msg, restart) => {
  err(c.redBright.bold('Session error:'), msg)
  await initReadline()
  const ans = await q(c.yellowBright.bold('Hapus session & restart? (y/n): '))
  if (['y', 'ya'].includes(ans.toLowerCase())) {
    await clearSessionAndRestart(restart)
  } else {
    log(c.greenBright.bold('Bot dihentikan'))
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
  log(c.redBright.bold('Reconnect gagal'))
  retryCount = 0
  retryTimeout && clearTimeout(retryTimeout)
  await handleSessionIssue('Session bermasalah', restart)
}

function evConnect(xp, restart) {
  xp.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const r = lastDisconnect?.error?.output?.statusCode
      log(c.redBright.bold('Koneksi tertutup, status:', r))
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
          log(c.yellowBright.bold('Restart diperlukan'))
          return restart()
        default:
          log(c.yellowBright.bold('Disconnect tidak dikenal, coba reconnect...'))
          return tryReconnect(restart)
      }
    }
    if (connection === 'connecting')
      log(c.yellowBright.bold('Menyambungkan...'))
    if (connection === 'open') {
      log(c.greenBright.bold('Terhubung')),
      retryCount = 0
    }
  })
}

export { evConnect, handleSessionIssue }