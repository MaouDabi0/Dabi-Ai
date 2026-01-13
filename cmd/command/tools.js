import axios from 'axios'
import fromdt from 'form-data'
import fs from 'fs'
import os from 'os'
import path from 'path'
import c from 'chalk'
import fetch from 'node-fetch'
import { vn } from '../interactive.js'
import { downloadMediaMessage } from 'baileys'
import { tmpFiles } from '../../system/tmpfiles.js'
import { fileTypeFromBuffer } from 'file-type'

export default function tools(ev) {
  ev.on({
    name: 'enigma2text',
    cmd: ['enigma2text', 'en2text', 'en2txt'],
    tags: 'Tools Menu',
    desc: 'decode enigma personal',
    owner: !1,
    prefix: !0,
    money: 50,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd
    }) => {
      try {
        const file = './temp/enigma.json',
              abc = [...'abcdefghijklmnopqrstuvwxyz'],
              rand = () => [...abc].sort(() => Math.random() - .5),
              dec = (t, r) => t.toLowerCase().split('')
                .map(c => {
                  const i = r.indexOf(c)
                  return i !== -1 ? abc[i] : c
                }).join(''),
              q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              text = q?.conversation || q?.text || args.join(' ')

        if (!text) return xp.sendMessage(chat.id, { text: 'reply atau masukkan teks enigma' }, { quoted: m })

        const db = fs.existsSync(file)
              ? JSON.parse(fs.readFileSync(file))
              : {},
              data = Object.values(db.key || {})
                .find(v => v.jid === chat.sender),
              rotor = data?.rotor?.random || rand(),
              result = dec(text, rotor)

        await xp.sendMessage(chat.id, { text: result }, { quoted: m })

      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'getchid',
    cmd: ['getchid', 'getch'],
    tags: 'Tools Menu',
    desc: 'mengambil id ch/saluran whatsapp',
    owner: !1,
    prefix: !0,
    money: 500,
    exp: 0.1,

    run: async (xp, m, {
      chat,
      cmd,
      store
    }) => {
      try {
        const q = m.message?.extendedTextMessage?.contextInfo
        if (!q?.stanzaId) return xp.sendMessage(chat.id, { text: 'reply pesan yang diteruskan dari saluran' }, { quoted: m })

        const load = await store.loadMsg(chat.id, q?.stanzaId)
        if (!load) return xp.sendMessage(chat.id, { text: 'pastikan reply pesan yang diteruskan dari saluran' }, { quoted: m })

        const info = load?.message?.[load.message?.extendedTextMessage ? 'extendedTextMessage' : 'conversation']?.contextInfo?.forwardedNewsletterMessageInfo

        log(info)

        if (!info?.newsletterJid) return xp.sendMessage(chat.id, { text: 'Tidak ditemukan informasi saluran.' }, { quoted: m })

        let txt = `${head}${opb} Data Channel ${clb}\n`
            txt += `${body} ${btn} *Nama: ${info?.newsletterName}*\n`
            txt += `${body} ${btn} *ID Saluran: ${info?.newsletterJid}*\n`
            txt += `${body} ${btn} *ID Pesan: ${info?.serverMessageId}*\n`
            txt += `${foot}${line}`

        await xp.sendMessage(chat.id, {
          text: txt,
          contextInfo: {
            externalAdReply: {
              body: `informasi saluran ${info.newsletterName}`,
              thumbnailUrl: thumbnail,
              mediaType: 1,
              renderLargerThumbnail: !0
            },
            forwardingScore: 1,
            isForwarded: !0,
            forwardedNewsletterMessageInfo: {
              newsletterJid: idCh,
              newsletterName: footer
            }
          }
        })
      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'getpp',
    cmd: ['getpp'],
    tags: 'Tools Menu',
    desc: 'mengambil foto profil orang',
    owner: !1,
    prefix: !0,
    money: 100,
    exp: 0.1,

    run: async (xp, m, {
      chat,
      cmd
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              target = quoted?.participant || quoted?.mentionedJid?.[0],
              user = target.replace(/@s\.whatsapp\.net$/, ''),
              { usrAdm, botAdm } = await grupify(xp, m),
              defThumb = 'https://c.termai.cc/i0/7DbG.jpg'

        if (!chat.group || !usrAdm || !botAdm || !target) {
          return xp.sendMessage(chat.id, {
              text: !chat.group
                ? 'perintah ini hanya bisa dijalankan digrup'
                : !usrAdm
                ? 'kamu bukan admin'
                : !botAdm
                ? 'aku bukan admin'
                : 'reply/tag target'
            }, { quoted: m })
        }

        let thumb
        try { thumb = await xp.profilePictureUrl(target, 'image') }
        catch { thumb = defThumb }

        await xp.sendMessage(chat.id, { image: { url: thumb }, caption: `pp @${user}`, mentions: [target] }, { quoted: m })
      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'hd',
    cmd: ['hd'],
    tags: 'Tools Menu',
    desc: 'Upscale / enhance gambar menggunakan AI',
    owner: !1,
    prefix: !0,
    money: 500,
    exp: 0.1,

    run: async (xp, m, {
      chat,
      cmd,
      prefix
    }) => {
      try {
        const q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              img = q?.imageMessage || m.message?.imageMessage

        if (!img) return xp.sendMessage(chat.id, { text: `Kirim atau reply gambar dengan caption ${prefix}${cmd}` }, { quoted: m })

        const media = await downloadMediaMessage({ message: q || m.message }, 'buffer')
        if (!media) throw new Error('media tidak terunduh')

        await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })

        const imageUrl = await tmpFiles(media),
              type = 'stdx4',
              task = await fetch(`${termaiWeb}/api/tools/enhance/createTask?url=${encodeURIComponent(imageUrl)}&type=${type}&key=${termaiKey}`).then(r => r.json()).catch(() => null)

        let i = 0

        if (!task?.status)
          return xp.sendMessage(chat.id, { text: task?.msg || 'Gagal membuat task enhance.' }, { quoted: m })

        while (i++ < 5e1) {
          const status = await fetch(`${termaiWeb}/api/tools/enhance/taskStatus?id=${task.id}&key=${termaiKey}`).then(r => r.json()).catch(() => null)
          if (!status) break
          if (status.task_status === 'failed' || status.task_status === 'done')
            return xp.sendMessage(chat.id,
              status.task_status === 'failed'
                ? { text: 'Maaf terjadi kesalahan. Gunakan gambar lain!' }
                : { image: { url: status.output }, caption: 'Gambar berhasil di-enhance' }, { quoted: m })
          await new Promise(r => setTimeout(r, 1e3))
        }

        xp.sendMessage(chat.id, { text: 'Waktu pemrosesan habis. Coba lagi.' }, { quoted: m })
      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'mc2text',
    cmd: ['mc2text', 'decmc', 'decodeminecraft'],
    tags: 'Tools Menu',
    desc: 'mengubah bahasa mc menjadi text',
    owner: !1,
    prefix: !0,
    money: 50,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        const q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              text = q?.conversation || q?.text || args.join(' ')

        if (!text) return xp.sendMessage(chat.id, { text: `Masukkan teks atau reply pesan\nContoh: ${prefix}${cmd} halo aku ${botName}` }, { quoted: m });

        const mc = {
          a: "ᔑ", b: "ʖ",
          c: "ᓵ", d: "↸",
          e: "ᒷ", f: "⎓",
          g: "⊣", h: "⍑",
          i: "╎", j: "⋮",
          k: "ꖌ", l: "ꖎ",
          m: "ᒲ", n: "リ",
          o: "𝙹", p: "!¡",
          q: "ᑑ", r: "∷",
          s: "ᓭ", t: "ℸ̣",
          u: "⚍", v: "⍊", 
          w: "∴", x: "̇/",
          y: "||", z: "⨅",
          " ": "/"
        },
        decmc = text => text
          .trim()
          .split(" ")
          .map(v => v === "/" ? " " : Object.keys(mc).find(k => mc[k] === v) ?? v)
          .join("")

        await xp.sendMessage(chat.id, { text: decmc(text) }, { quoted: m })
      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'morse2text',
    cmd: ['decodemorse', 'decomorse', 'morse2text'],
    tags: 'Tools Menu',
    desc: 'mengubah morse menjadi text',
    owner: !1,
    prefix: !0,
    money: 50,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        const q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              text = q?.conversation || args.join(' ')

        if (!text) return xp.sendMessage(chat.id, { text: `masukan atau reply pesan nya\ncontoh: ${prefix}${cmd} .... .- .-.. ---   .- -.- ..-   -... --- -` }, { quoted: m })

        const mrs = {
          a: ".-", b: "-...",
          c: "-.-.", d: "-..",
          e: ".", f: "..-.",
          g: "--.", h: "....",
          i: "..", j: ".---",
          k: "-.-", l: ".-..",
          m: "--", n: "-.",
          o: "---", p: ".--.",
          q: "--.-", r: ".-.",
          s: "...", t: "-",
          u: "..-", v: "...-",
          w: ".--", x: "-..-",
          y: "-.--", z: "--..",
          "0": "-----", "1": ".----",
          "2": "..---", "3": "...--",
          "4": "....-", "5": ".....",
          "6": "-....", "7": "--...",
          "8": "---..", "9": "----."
        },
        decodemrs = text => text
          .trim()
          .replace(/ {3,}/g, " / ")
          .split(" ")
          .map(v => v === "/" 
              ? " "
              : Object.keys(mrs).find(key => mrs[key] === v) ?? v
          ).join("")

        await xp.sendMessage(chat.id, { text: decodemrs(text) }, { quoted: m })
      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'ptv',
    cmd: ['ptv', 'p'],
    tags: 'Tools Menu',
    desc: 'generate ptv studio',
    owner: !1,
    prefix: !0,
    money: 100,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              video = quoted?.videoMessage || m.message?.videoMessage

        if (!video) {
          return xp.sendMessage(chat.id, { text: 'reply atau kirim video yang ingin dijadikan ptv' }, { quoted: m })
        }

        const buffer = await downloadMediaMessage({ message: quoted || m.message }, 'buffer')

        if (!buffer) throw new Error('gagal mengunduh media')

        await xp.sendMessage(chat.id, { video: buffer, mimetype: 'video/mp4', ptv: !0 })
      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'rvo',
    cmd: ['rvo'],
    tags: 'Tools Menu',
    desc: 'mengekstrak media viewOnce',
    owner: !1,
    prefix: !0,
    money: 100,
    exp: 0.1,

    run: async (xp, m, {
      chat,
      cmd
    }) => {
      try {
        const q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              reply = ['imageMessage','videoMessage','audioMessage']
                .map(v => q?.[v])
                .find(Boolean),
              media = ['image', 'video', 'audio'],
              mediaType = media.find(t => reply?.mimetype?.includes(t)),
              time = global.time.timeIndo("Asia/Jakarta", "HH"),
              { usrAdm } = await grupify(xp, m)

        if (!usrAdm) return xp.sendMessage(chat.id, { text: 'kamu bukan admin' }, { quoted: m })

        if (!reply || !mediaType || !reply.mediaKey) {
          return xp.sendMessage(chat.id, { text: !reply ? 'reply pesan satu kali lihat' : 'pesan tidak didukung atau sudah dibuka' }, { quoted: m })
        }

        const buffer = await downloadMediaMessage({ message: { [`${mediaType}Message`]: reply } }, 'buffer', {}, { logger: xp.logger, reuploadRequest: xp.updateMediaMessage })

        if (!buffer) throw new Error('gagal mengunduh media')

        await xp.sendMessage(chat.id, {
            [mediaType]: buffer,
            caption: reply.caption ? `pesan: ${reply.caption}` : 'media berhasil diambil'
          }, { quoted: m })
      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'toenigma',
    cmd: ['toenigma', 'toen'],
    tags: 'Tools Menu',
    desc: 'encode teks enigma personal',
    owner: !1,
    prefix: !0,
    money: 50,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        const file = './temp/enigma.json',
              abc = [...'abcdefghijklmnopqrstuvwxyz'],
              rand = () => [...abc].sort(() => Math.random() - .5),
              enc = (t, r) => t.toLowerCase().split('')
                .map(c => {
                  const i = abc.indexOf(c)
                  return i !== -1 ? r[i] : c
                }).join(''),
              q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              text = q?.conversation || q?.text || args.join(' ')

        if (!text) return xp.sendMessage(chat.id, {
            text: `Masukkan teks atau reply pesan\nContoh: ${prefix}${cmd} halo aku ${botName}` }, { quoted: m })

        !fs.existsSync(file)
          ? fs.writeFileSync(file, JSON.stringify({ key: {} }, null, 2))
          : !0

        const jid = m.key?.participant || chat.sender,
              rotor = rand(),
              result = enc(text, rotor),
              db = JSON.parse(fs.readFileSync(file))

        db.key[chat.pushName] = {
          jid,
          id: m.key?.id,
          rotor: {
            text: result,
            random: rotor
          }
        }

        fs.writeFileSync(file, JSON.stringify(db, null, 2))
        await xp.sendMessage(chat.id, { text: result }, { quoted: m })
      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'tomc',
    cmd: ['tomc', 'tominecraft', 'totomc'],
    tags: 'Tools Menu',
    desc: 'mengubah teks menjadi bahasa mc',
    owner: !1,
    prefix: !0,
    money: 50,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        const q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              text = q?.conversation || q?.text || args.join(' ')

        if (!text) return xp.sendMessage(chat.id, { text: `Masukkan teks atau reply pesan\nContoh: ${prefix}${cmd} halo aku ${botName}` }, { quoted: m })

        const mc = {
          a: "ᔑ", b: "ʖ",
          c: "ᓵ", d: "↸",
          e: "ᒷ", f: "⎓",
          g: "⊣", h: "⍑",
          i: "╎", j: "⋮",
          k: "ꖌ", l: "ꖎ",
          m: "ᒲ", n: "リ",
          o: "𝙹", p: "!¡",
          q: "ᑑ", r: "∷",
          s: "ᓭ", t: "ℸ̣",
          u: "⚍", v: "⍊", 
          w: "∴", x: "̇/",
          y: "||", z: "⨅",
          " ": "/"
        },
        encmc = text => text
          .toLowerCase()
          .split("")
          .map(v => mc[v] ?? v)
          .join(" ")

        await xp.sendMessage(chat.id, { text: encmc(text) }, { quoted: m })
      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'tomorse',
    cmd: ['tomorse'],
    tags: 'Tools Menu',
    desc: 'mengubah text menjadi morse',
    owner: !1,
    prefix: !0,
    money: 50,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        const q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              text = q?.conversation || q?.text || args.join(' ')

        if (!text) return xp.sendMessage(chat.id, { text: `masukan atau reply pesan nya\ncontoh: ${prefix}${cmd} halo aku ${botName}` }, { quoted: m })

        const mrs = {
          a: ".-", b: "-...",
          c: "-.-.", d: "-..",
          e: ".", f: "..-.",
          g: "--.", h: "....",
          i: "..", j: ".---",
          k: "-.-", l: ".-..",
          m: "--", n: "-.",
          o: "---", p: ".--.",
          q: "--.-", r: ".-.",
          s: "...", t: "-",
          u: "..-", v: "...-",
          w: ".--", x: "-..-",
          y: "-.--", z: "--..",
          "0": "-----", "1": ".----",
          "2": "..---", "3": "...--",
          "4": "....-", "5": ".....",
          "6": "-....", "7": "--...",
          "8": "---..", "9": "----."
        },
        encmrs = text => text
           .toLowerCase()
            .split("")
            .map(v => mrs[v] ?? v)
            .join(" ")

        await xp.sendMessage(chat.id, { text: ` ${encmrs(text)}` }, { quoted: m })
      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'tmpfiles',
    cmd: ['tmpfiles', 'totmp'],
    tags: 'Tools Menu',
    desc: 'Ubah gambar jadi link dengan tmpfiles',
    owner: !1,
    prefix: !0,
    money: 50,
    exp: 0.1,

    run: async (xp, m, {
      chat,
      cmd
    }) => {
      try {
        const q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || m.message,
              img = q?.imageMessage || q?.videoMessage

        if (!img)
          return xp.sendMessage(chat.id, { text: 'Kirim atau reply gambar/video untuk dijadikan link.' }, { quoted: m })

        const buffer = await downloadMediaMessage({ message: q }, 'buffer'),
              url = await tmpFiles(buffer)

        await xp.sendMessage(chat.id, { text: url }, { quoted: m })
      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'tourl',
    cmd: ['tourl', 'url'],
    tags: 'Tools Menu',
    desc: 'mengubah media menjadi url',
    owner: !1,
    prefix: !0,
    money: 500,
    exp: 0.1,

    run: async (xp, m, {
      chat,
      cmd
    }) => {
      try {
        const q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              media = ['imageMessage','videoMessage','documentMessage','audioMessage']
                .map(v => m.message?.[v] || q?.[v])
                .find(Boolean),
              name = chat.pushName,
              time = global.time.timeIndo("Asia/Jakarta", "HH")

        if (!media) return xp.sendMessage(chat.id, { text: 'reply media yang ingin dijadikan url' }, { quoted: m })

        const mediadl = await downloadMediaMessage({ message: q || m.message }, 'buffer')
        if (!mediadl) throw new Error('error saat mengunduh')

        const upload = async (file) => {
          const { ext } = await fileTypeFromBuffer(file),
                form = new fromdt()

          form.append('file', file, { filename: `${name}-${time}.` + ext })

          const url = await axios.post(`https://c.termai.cc/api/upload?key=AIzaBj7z2z3xBjsk`, form, { headers: form.getHeaders() })

          return url.data
        }

        const res = await upload(mediadl)

        if (!res) return xp.sendMessage(chat.id, { text: 'error pada api' }, { quoted: m })

        let txt = `upload file berhasil\n\n`
            txt += `${head}${opb} *${botName}* ${clb}\n`
            txt += `${body} ${btn} *url:* ${res.path}\n`
            txt += `${body} ${btn} *type:* ${res.mimetype}\n`
            txt += `${body} ${btn} *size:* ${res.size}\n`
            txt += `${foot}${line}`

        await xp.sendMessage(chat.id, {
          text: txt,
          contextInfo: {
            externalAdReply: {
              body: `terima kasih telah menggunakan ${botName}`,
              thumbnailUrl: thumbnail,
              mediaType: 1,
              renderLargerThumbnail: !0
            },
            forwardingScore: 1,
            isForwarded: !0,
            forwardedNewsletterMessageInfo: {
              newsletterJid: idCh,
              newsletterName: footer
            }
          }
        })
      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'tovn',
    cmd: ['tovn', 'vn'],
    tags: 'Tools Menu',
    desc: 'ubah lagu jadi vn',
    owner: !1,
    prefix: !0,
    money: 100,
    exp: 0.1,

    run: async (xp, m, {
      chat,
      cmd
    }) => {
      try {
        const q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              reply = ['audioMessage', 'videoMessage']
                .map(v => m.message?.[v] || q?.[v])
                .find(Boolean)

        if (!reply) {
          return xp.sendMessage(chat.id, { text: 'reply atau kirim audio atau video yang akan diubah ke vn' }, { quoted: m })
        }

        let media
        media = await downloadMediaMessage({ message: q || m.message }, 'buffer')
        if (!media) throw new Error('media tidak terunduh')

        await vn(xp, chat.id, media, m)
      } catch (e) {
        err(`error pada ${cmd}`, e)
        call(xp, e, m)
      }
    }
  })
}