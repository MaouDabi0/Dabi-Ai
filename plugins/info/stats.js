import os from 'os'
import fs from 'fs'
import { execSync } from 'child_process'
import { performance } from 'perf_hooks'
import moment from 'moment-timezone'

export default {
  name: 'stats',
  command: ['stats', 'info', 'st', 'ping', 'device'],
  tags: 'Info Menu',
  desc: 'Menampilkan status device dan statik bot',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const start = performance.now(),
          { chatId, senderId } = chatInfo

    global.commandCount = (global.commandCount || 0) + 1e0

    const uptime = process.uptime(),
          totalMem = os.totalmem(),
          usedMem = totalMem - os.freemem(),
          cpu = os.cpus()?.[0]?.model ?? 'Tidak diketahui',
          platform = os.platform(),
          arch = os.arch(),
          botName = global.botName ?? 'Bot',
          botFullName = global.botFullName ?? botName,
          formatBytes = bytes => (bytes / 1024 / 1024).toFixed(2),
          deviceUptime = Format.toTime(os.uptime() * 1e3),
          timeNow = Format.indoTime('Asia/Jakarta', 'DD MMM YYYY HH:mm')

    let totalDisk = 'Tidak diketahui',
        usedDisk = 'Tidak diketahui',
        freeDisk = 'Tidak diketahui'

    try {
      const disk = execSync('df -h /', { encoding: 'utf8' }).split('\n')[1].split(/\s+/)
      ;[totalDisk, usedDisk, freeDisk] = [disk[1], disk[2], disk[3]]
    } catch (err) {
      console.error('Gagal mendapatkan disk info:', err.message)
    }

    const db = getDB?.(),
          Private = db?.Private || {},
          users = Object.values(Private)

    let privateCmd = '-', maxCmd = 0
    for (const user of users)
      user.Nomor === senderId
        ? privateCmd = user.cmd || 0
        : (user.cmd || 0) > maxCmd && (maxCmd = user.cmd)

    const responseTime = (performance.now() - start).toFixed(2),
          stats = `
Stats Bot ${Obrack} ${botFullName} ${Cbrack}
┃
┣ ${btn} Bot Name: ${botName}
┣ ${btn} Time Server: ${timeNow}
┣ ${btn} Uptime: ${Format.uptime()}
┖ ${btn} Respon: ${responseTime} ms

Stats Chat
┃
┣ ${btn} Private (cmd): ${privateCmd}
┖ ${btn} Total Cmd (terbesar): ${maxCmd}

Stats System
┃
┣ ${btn} Up Device: ${deviceUptime}
┣ ${btn} Platform: ${platform} (${arch})
┣ ${btn} Cpu: ${cpu}
┣ ${btn} Ram: ${formatBytes(usedMem)} MB / ${formatBytes(totalMem)} MB
┖ ${btn} Storage: ${usedDisk} / ${totalDisk} (Free: ${freeDisk})
`.trim()

    await conn.sendMessage(chatId, {
      text: stats,
      contextInfo: {
        externalAdReply: {
          title: 'Informasi Status Bot',
          body: `Ini adalah status ${botFullName}`,
          thumbnailUrl: thumbnail,
          mediaType: 1,
          renderLargerThumbnail: !0
        },
        forwardingScore: 1e0,
        isForwarded: !0,
        forwardedNewsletterMessageInfo: { newsletterJid: idCh }
      }
    }, { quoted: msg })
  }
}