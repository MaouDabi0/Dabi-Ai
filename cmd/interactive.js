import fetch from 'node-fetch'
import c from 'chalk'
import { generateWAMessageContent, getContentType } from 'baileys'
import { convertToOpus, generateWaveform } from '../system/ffmpeg.js'
import { role } from '../system/db/data.js'

const fetchData = async (url, type = 'json', options = {}) => {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return type === 'buffer' ? Buffer.from(await res.arrayBuffer()) : res.json()
}

async function vn(xp, audio, m) {
  try {
    const chat = global.chat(m),
          buff = await convertToOpus(audio),
          config = { audio: buff, mimetype: 'audio/ogg; codecs=opus', ptt: !0 },
          messageContent = await generateWAMessageContent(config, { upload: xp.waUploadToServer }),
          type = getContentType(messageContent)

    if (m) messageContent[type].contextInfo = {
      stanzaId: m.key.id,
      participant: m.key.participant || m.key.remoteJid,
      quotedMessage: m.message
    }

    messageContent[type].waveform = await generateWaveform(buff)
    return await xp.relayMessage(chat.id, messageContent, {})
  } catch (e) {
    err('error pasa vn', e)
    throw e
  }
}

async function bell(txt, m, xp, voice = "dabi", pitch = 0, speed = 0.9) {
  const chat = global.chat(m),
        name = m?.pushName || chat.sender || 'tidak diketahui',
        usr = Object.values(db().key).find(u => u.jid === chat.sender),
        role = usr?.ai?.role || 'gak kenal',
        data = {
          text: txt,
          id: chat.sender,
          fullainame: botFullName,
          nickainame: botName,
          senderName: name,
          ownerName,
          date: new Date().toString(),
          role: role,
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
      const audio = await fetchData(
        `${termaiWeb}/api/text2speech/elevenlabs?text=${encodeURIComponent(resData.msg)}&voice=${voice}&pitch=${pitch}&speed=${speed}&key=${termaiKey}`,
        'buffer'
      )
      return audio
        ? (await vn(xp, audio, m), { cmd: 'voice' })
        : { error: !0, message: 'Gagal membuat voice' }
    }

    return { cmd: resData?.cmd, msg: resData?.msg }
  } catch (e) {
    return { error: !0, message: e.message }
  }
}

const signal = async (text, m, xp, ev) => {
  const idBot = xp.user?.id?.split(':')[0] + '@s.whatsapp.net',
        chat = global.chat(m),
        botName = global.botName?.toLowerCase(),
        ctx = m.message?.extendedTextMessage?.contextInfo || m.message?.imageMessage?.contextInfo || {},
        txt = text?.toLowerCase(),
        call =
          ctx?.mentionedJid?.includes(idBot) ||
          chat.sender === idBot ||
          ctx?.participant === idBot ||
          (!!botName && txt.includes(botName)),
        prefix = [].concat(global.prefix).some(p => txt.startsWith(p))

  if (!call || prefix || chat.sender?.split(':')[0] === idBot?.split('@')[0]) return

  const keyData = Object.values(db().key).find(u => u.jid === chat.sender),
        exp = Math.round(0.1 * 10)
  if (!keyData?.ai?.bell) return

  keyData.ai.chat = ++keyData.ai.chat || 1
  keyData.exp = (keyData.exp || 0) + exp
  role(m)
  save.db()

  const _ai = await bell(txt, m, xp)
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
    ev.emit(ify.event, xp, m, { args: _args, chat })
    res = ify.res ?? !1
  } else res = !!_ai.msg

  if (_ai.msg && res) await xp.sendMessage(chat.id, { text: _ai.msg }, { quoted: m })

  return _ai
}

export { vn, signal, bell }