import fs from 'fs'
import os from 'os'
import path from 'path'
import c from 'chalk'
import fetch from 'node-fetch'
import { vn } from '../interactive.js'
import { downloadMediaMessage } from 'baileys'
import { tmpFiles } from '../../system/tmpfiles.js'

export default function tools(ev) {
  ev.on({
    name: 'enlarger',
    cmd: ['hd', 'enlarger'],
    tags: 'Tools Menu',
    desc: 'Upscale / enhance gambar menggunakan AI',
    owner: !1,
    prefix: !0,
    money: 500,
    exp: 0.1,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              img = q?.imageMessage || m.message?.imageMessage

        if (!img)
          return xp.sendMessage(chat.id, { text: `Kirim atau reply gambar dengan caption *.hd*` }, { quoted: m })

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
            return xp.sendMessage(
              chat.id,
              status.task_status === 'failed'
                ? { text: 'Maaf terjadi kesalahan. Gunakan gambar lain!' }
                : { image: { url: status.output }, caption: 'Gambar berhasil di-enhance' },
              { quoted: m }
            )
          await new Promise(r => setTimeout(r, 1e3))
        }

        xp.sendMessage(chat.id, { text: 'Waktu pemrosesan habis. Coba lagi.' }, { quoted: m })
      } catch (e) {
        err('error pada enlarger', e)
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
        err('error pada getchid', e)
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
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo,
              target = quoted?.participant || quoted?.mentionedJid?.[0],
              user = target.replace(/@s\.whatsapp\.net$/, ''),
              { usrAdm, botAdm } = await grupify(xp, chat.id, chat.sender),
              defThumb = 'https://c.termai.cc/i0/7DbG.jpg'

        if (!chat.group || !usrAdm || !botAdm || !target) {
          return xp.sendMessage(chat.id,
            {
              text: !chat.group
                ? 'perintah ini hanya bisa dijalankan digrup'
                : !usrAdm
                ? 'kamu bukan admin'
                : !botAdm
                ? 'aku bukan admin'
                : 'reply/tag target'
            },
            { quoted: m }
          )
        }

        let thumb
        try { thumb = await xp.profilePictureUrl(target, 'image') }
        catch { thumb = defThumb }

        await xp.sendMessage(chat.id, { image: { url: thumb }, caption: `pp @${user}`, mentions: [target] }, { quoted: m })
      } catch (e) {
        err('error pada getpp', e)
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
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              reply = quoted?.imageMessage || quoted?.videoMessage || quoted?.audioMessage,
              media = ['image', 'video', 'audio'],
              mediaType = media.find(t => reply?.mimetype?.includes(t)),
              time = global.time.timeIndo("Asia/Jakarta", "HH"),
              { usrAdm } = await grupify(xp, chat.id, chat.sender)

        if (!usrAdm) {
          return xp.sendMessage(chat.id, { text: 'kamu bukan admin' }, { quoted: m })
        }

        if (!reply || !mediaType || !reply.mediaKey) {
          return xp.sendMessage(chat.id, { text: !reply ? 'reply pesan satu kali lihat' : 'pesan tidak didukung atau sudah dibuka' }, { quoted: m })
        }

        const buffer = await downloadMediaMessage({ message: { [`${mediaType}Message`]: reply } }, 'buffer', {}, { logger: xp.logger, reuploadRequest: xp.updateMediaMessage })

        if (!buffer) throw new Error('gagal mengunduh media')

        await xp.sendMessage(
          chat.id,
          {
            [mediaType]: buffer,
            caption: reply.caption ? `pesan: ${reply.caption}` : 'media berhasil diambil'
          },
          { quoted: m }
        )
      } catch (e) {
        err('error pada rvo', e)
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
      chat
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
        err('error pada tourl', e)
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
      chat
    }) => {
      try {
        const q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              audio = q?.audioMessage || m.message?.audioMessage,
              video = q?.videoMessage || m.message?.videoMessage

        if (!(audio || video)) {
          return xp.sendMessage(chat.id, { text: audio ? 'reply atau kirim audio yang akan di ubah' : 'reply atau kirim video yang akan di ubah' }, { quoted: m })
        }

        let media
        media = await downloadMediaMessage({ message: q || m.message }, 'buffer')
        if (!media) throw new Error('media tidak terunduh')

        await vn(xp, chat.id, media, m)
      } catch (e) {
        err('error pada tovn', e)
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
      chat
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
        err('error pada ptv', e)
        call(xp, e, m)
      }
    }
  })
}