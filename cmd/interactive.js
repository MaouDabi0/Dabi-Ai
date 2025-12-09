import fetch from 'node-fetch'
import { generateWAMessageContent, getContentType } from 'baileys'
import { convertToOpus, generateWaveform } from '../system/ffmpeg.js'
import { db, saveDb } from '../system/db/data.js'

const fetchData = async (url, type = 'json', options = {}) => {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return type === 'buffer' ? Buffer.from(await res.arrayBuffer()) : res.json()
}

async function vn(xp, id, audioBuffer, m = null) {
  try {
    const buff = await convertToOpus(audioBuffer),
          config = { audio: buff, mimetype: 'audio/ogg; codecs=opus', ptt: !0 },
          messageContent = await generateWAMessageContent(config, { upload: xp.waUploadToServer }),
          type = getContentType(messageContent)

    if (m) messageContent[type].contextInfo = {
      stanzaId: m.key.id,
      participant: m.key.participant || m.key.remoteJid,
      quotedMessage: m.message
    }

    messageContent[type].waveform = await generateWaveform(buff)
    return await xp.relayMessage(id, messageContent, {})
  } catch (e) {
    err('error pasa vn', e)
    throw e
  }
}

async function bell(body, text, m, sender, xp, id, voice = "dabi", pitch = 0, speed = 0.9) {
  const name = m?.pushName || m?.key?.participantAlt?.split('@')[0] || 'tidak diketahui',
        data = {
          text,
          id: sender,
          fullainame: botFullName,
          nickainame: botName,
          senderName: name,
          ownerName,
          date: new Date().toString(),
          role: 'Sahabat Deket',
          msgtype: 'text',
          custom_profile: logic,
          commands: [
            {
              description: 'Jika perlu direspon dengan suara',
              output: {
                cmd: 'voice',
                msg: `Pesan di sini. Gunakan gaya bicara <nickainame> yang menarik dan realistis, lengkap dengan tanda baca yang tepat agar terdengar hidup saat diucapkan.`
              }
            },
            {
              description: 'Jika pesan adalah permintaan untuk menampilkan menu (maka jawab lah dengan mengatakan ini menu nya!)',
              output: { 
                cmd: 'menu'
              }
            },
            {
              description: 'Jika pesan adalah perintah untuk membuka/menutup group',
              output: {
                cmd: ['opengroup', 'closegroup']
              }
            },
            {
              description: 'Jika pesan adalah permintaan untuk membuat stiker atau mengubah sebuah gambar menjadi stiker. (Abaikan isi konten pada gambar!)',
              output: {
                cmd: 'stiker'
              }
            },
            {
              description: 'Jika pesan adalah permintaan untuk membuat stiker to image atau mengubah sebuah sticker menjadi gambar. (Abaikan isi konten pada sticker!)',
              output: {
                cmd: 'toimg'
              }
            },
            {
              description: 'Jika pesan adalah permintaan untuk mengecek api, maka respon dengan cmd: cekkey!',
              output: {
                cmd: 'cekkey'
              }
            },
            {
              description: 'Jika pesan adalah permintaan untuk mengedit image atau gambar, maka respon dengan cmd: i2i dan hanya untuk cmd ini msg: permintaan dari pengguna.',
              output: {
                cmd: 'i2i',
                msg: `Pesan di sini tambahkan detail untuk promt atau permintaan dengan tanda baca dan abaikan <nickainame>`
              }
            },
            {
              description: 'Jika pesan adalah permintaan untuk memasuki atau bergabung dengan grup, maka respon dengan isi msg dengan link yang di kirim oleh user',
              output: {
                cmd: 'join',
                msg: 'Pesan di sini sertakan link grup yang di kirim oleh user dalam respon kamu!'
              }
            },
            {
              description: 'Jika pesan adalah permintaan untuk mencari lagu, maka isi msg: judul lagu yang di minta. Hanya judul nya saja, dan cmd selalu play',
              output: {
                cmd: ['play', 'cariin', 'putar', 'cari'],
                msg: 'Pesan di sini tambahkan judul lagu yang di cari'
              }
            },
            {
              description: 'Jika pesan adalah rincian detail tentang error, maka kamu harus menjawab dengan menjelaskan kenapa error tersebut terjadi dan bagaimana cara menyelesaikan nya.',
              output: {
                cmd: ['error', 'err', 'Error', 'e'],
                msg: 'pesan disini jelaskan bagaimana error tersebut bisa terjadi dan bagaimana cara menyelesaikan nya.'
              }
            }
          ]
        }

  try {
    const { status, data: resData } = await fetchData(
      `${termaiWeb}/api/chat/logic-bell?key=${termaiKey}`,
      'json',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }
    )

    if (!status) return { error: !0, message: 'API gagal merespon' }

    if (resData?.cmd === 'voice') {
      const audioBuffer = await fetchData(
        `${termaiWeb}/api/text2speech/elevenlabs?text=${encodeURIComponent(resData.msg)}&voice=${voice}&pitch=${pitch}&speed=${speed}&key=${termaiKey}`,
        'buffer'
      )
      return audioBuffer
        ? (await vn(xp, id, audioBuffer, m), { cmd: 'voice' })
        : { error: !0, message: 'Gagal membuat voice' }
    }

    return { cmd: resData?.cmd, msg: resData?.msg }
  } catch (e) {
    return { error: !0, message: e.message }
  }
}

const signal = async (text, m, user, id, xp, ev) => {  
  const idBot = xp.user?.id?.split(':')[0] + '@s.whatsapp.net',
        botName = global.botName?.toLowerCase(),
        botNumb = idBot.split('@')[0],
        msg = m.message || {},
        ctx = msg.extendedTextMessage?.contextInfo || msg.imageMessage?.contextInfo || {},
        caption = msg.imageMessage?.caption 
               || msg.videoMessage?.caption 
               || text 
               || '',
        { mentionedJid = [], participant = '' } = ctx,
        sender = m.key?.participant || m.participant || user,
        senderBase = sender?.split(':')[0] || sender,
        lowerText = caption.toLowerCase(),
        call = [
          mentionedJid.includes(idBot),
          participant === idBot,
          ctx.participant === idBot,
          botName && lowerText.includes(botName)
        ].some(Boolean),
        prefix = [].concat(global.prefix).some(p => lowerText.startsWith(p))

  if ((call && senderBase === botNumb) || prefix || !call) return

  const keyData = Object.values(db()?.key || {}).find(v => v?.jid === sender)
  if (!keyData?.ai || keyData.ai.bell === !1) return

  keyData.ai.chat = (keyData.ai.chat || 0) + 1, saveDb()

  const _ai = await bell(caption, caption, m, sender, xp, id)
  if (!_ai || !ev) return
  log(_ai)

  const cmd = _ai.cmd?.toLowerCase(),
        cmds = [
          {
            cmd: ['opengroup'],
            q: 'open',
            event: 'open',
            res: !0
          },
          {
            cmd: ['closegroup'],
            q: 'close',
            event: 'close',
            res: !0
          },
          {
            cmd: ['menu'],
            q: 'menu',
            event: 'menu',
            res: !1
          },
          {
            cmd: ['stiker', 'sticker'],
            q: 'stiker',
            event: 'stiker',
            res: !0
          },
          {
            cmd: ['toimg'],
            q: 'toimg',
            event: 'toimg',
            res: !0
          },
          {
            cmd: ['cekkey'],
            q: 'cekkey',
            event: 'cekkey',
            res: !0
          },
          {
            cmd: ['i2i'],
            q: 'i2i',
            event: 'i2i',
            res: !1,
            prompt: !0
          },
          {
            cmd: ['join'],
            q: 'join',
            event: 'join',
            res: !1,
            prompt: !0
          },
          {
            cmd: ['play', 'putar', 'cari', 'cariin'],
            q: 'play',
            event: 'play',
            res: !0,
            prompt: !0
          }
        ],
        ify = cmds.find(r => r.cmd.includes(cmd))

  let res = !1
  if (ify) {
    m.q = ify.q
    const _args = ify.prompt && _ai.msg ? _ai.msg.trim().split(/\s+/) : []
    ev.emit(ify.event, xp, m, { args: _args, chat: global.chat(m) })
    res = ify.res ?? !1
  } else if (_ai.msg) res = !0

  if (_ai.msg && res) await xp.sendMessage(m.key.remoteJid, { text: _ai.msg }, { quoted: m })

  return _ai
}

export { vn, signal, bell }