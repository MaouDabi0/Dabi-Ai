import fs from 'fs'

let isBroadcasting = !1,
    delayTime = 5e3 * 6e1

const delay = ms => new Promise(res => setTimeout(res, ms))

export default {
  name: 'bcgc',
  command: ['bcgc', 'broadcastgc'],
  tags: 'Owner Menu',
  desc: 'Broadcast ke semua grup.',
  prefix: !0,
  owner: !1,
  premium: !0,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText
  }) => {
    const { chatId } = chatInfo,
          cmd = `${prefix}${commandText}`,
          text = textMessage.slice(cmd.length).trim()
    
    if (!text) return conn.sendMessage(chatId, { text: `Pesan tidak boleh kosong.\nGunakan: ${cmd} [pesan]` }, { quoted: msg })
    if (isBroadcasting) return conn.sendMessage(chatId, { text: 'Tunggu beberapa saat sebelum mengirim lagi.' }, { quoted: msg })

    const groups = await conn.groupFetchAllParticipating(),
          ids = Object.keys(groups)

    if (!ids.length) return conn.sendMessage(chatId, { text: 'Bot tidak ada di grup mana pun.' }, { quoted: msg })

    isBroadcasting = !0
    conn.sendMessage(chatId, { text: `Mengirim ke ${ids.length} grup...` }, { quoted: msg })

    let success = 0, failed = 0, failedList = []

    for (const id of ids) {
      try {
        await conn.sendMessage(id, {
          text,
          contextInfo: {
            forwardingScore: 0,
            isForwarded: !0,
            forwardedNewsletterMessageInfo: { newsletterJid: global.idCh || '' }
          }
        }, { quoted: msg })
        success++
      } catch {
        failed++, failedList.push(`- ${groups[id]?.subject || 'Unknown'} (${id})`)
      }
      await delay(3e3)
    }

    let res = `Selesai.\nBerhasil: ${success}\nGagal: ${failed}`
    failedList.length && (res += `\n\nGrup gagal:\n${failedList.join('\n')}`)
    conn.sendMessage(chatId, { text: res }, { quoted: msg })

    setTimeout(() => {
      isBroadcasting = !1
      conn.sendMessage(chatId, { text: 'Broadcast bisa digunakan lagi.' }, { quoted: msg })
    }, delayTime)
  }
}