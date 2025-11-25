import axios from 'axios'
import fetch from 'node-fetch'
import qs from 'qs'

export default function download(ev) {
  ev.on({
    name: 'fb',
    cmd: ['fb', 'facebook'],
    tags: 'Download Menu',
    desc: 'mendownload video dari facebook',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              reply = quoted?.conversation,
              url = args[0] || reply

        if (!url || !url.includes('facebook.com')) {
          return xp.sendMessage(
            chat.id,
            { text: !url ? 'reply/isi link facebook nya' : 'harus berupa link facebook' },
            { quoted: m }
          )
        }

        let res = await fetch(`https://api.vreyn.web.id/api/download/facebook?url=${encodeURIComponent(url)}`);
        res = await res.json();

        const { title, thumbnail, durasi, download } = res.result;

        xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })

        xp.sendMessage(chat.id, {
          text: `D O W N L O A D...`,
          contextInfo: {
            externalAdReply: {
              body: title,
              thumbnailUrl: thumbnail,
              mediaType: 1,
              renderLargerThumbnail: !0,
              forwardingScore: 1,
              isForwarded: !0,
              forwardedNewsletterMessageInfo: {
                newsletterJid: idCh,
                newsletterName: botName
              }
            }
          }
        })

        xp.sendMessage(
          chat.id,
          {
            video: { url: download.hd },
            caption:
              `${head} ${opb} Berikut Hasil Downloadnya ${clb}\n` +
              `${body} ${btn} *Title:* ${title}\n` +
              `${body} ${btn} *Durasi:* ${durasi}\n` +
              `${foot}${line}`
          },
          { quoted: m }
        )

      } catch (e) {
        err('error pada facebook', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'play',
    cmd: ['play', 'putar'],
    tags: 'Download Menu',
    desc: 'mencari lagu di YouTube dan memutarnya',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        if (!args[0]) 
          return xp.sendMessage(chat.id, { text: 'Masukkan judul lagu yang ingin diputar.' }, { quoted: m })

        const query = args.join(' '),
              search = await fetch(`${termaiWeb}/api/search/youtube?query=${encodeURIComponent(query)}&key=${termaiKey}`).then(r => r.json())

        if (!search.status || !search.data?.items?.length)
          return xp.sendMessage(chat.id, { text: 'Lagu tidak ditemukan.' }, { quoted: m })

        const top = search.data.items[0]

        let txt = `Info Pencarian\n\n`
            txt += `${head} ${opb} YouTube ${clb}\n`
            txt += `${body} ${btn} *Title:* ${top.title}\n`
            txt += `${body} ${btn} *Channel:* ${top.author?.name || 'tidak diketahui'}\n`
            txt += `${body} ${btn} *Durasi:* ${top.duration}\n`
            txt += `${body} ${btn} *View:* ${top.viewCount.toLocaleString()}\n`
            txt += `${body} ${btn} *Rilis:* ${top.publishedAt}\n`
            txt += `${body} ${btn} *Link:* ${top.url}\n`
            txt += `${foot}${line}`

        await xp.sendMessage(chat.id, {
          text: txt,
          contextInfo: {
            externalAdReply: {
              title: top.title,
              body: top.author?.name || 'YouTube',
              thumbnailUrl: top.thumbnail,
              mediaType: 1,
              renderLargerThumbnail: !0,
              sourceUrl: top.url
            }
          }
        }, { quoted: m })

        const dl = await fetch(`${termaiWeb}/api/downloader/youtube?type=mp3&url=${encodeURIComponent(top.url)}&key=${termaiKey}`).then(r => r.json())

        if (!dl.status || !dl.data?.downloads?.length)
          return xp.sendMessage(chat.id, { text: 'Gagal mengambil link download.' }, { quoted: m })

        const file = dl.data.downloads[0]
        await xp.sendMessage(chat.id, {
          audio: { url: file.dlink },
          mimetype: 'audio/mpeg',
          ptt: !1
        }, { quoted: m })

      } catch (e) {
        err('error pada play', e)
        xp.sendMessage(chat.id, { text: 'Terjadi kesalahan saat memproses permintaan.' }, { quoted: m })
      }
    }
  })

  ev.on({
    name: 'tiktok',
    cmd: ['tt', 'tiktok'],
    tags: 'Download Menu',
    desc: 'download tiktok video',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              text   = quoted?.conversation || args.join(' ')

        if (!text)
          return xp.sendMessage(chat.id, {
            text: 'reply/kirim link tiktok nya\ncontoh: .tt https://vt.tiktok.com/7494086723190721798/'
          }, { quoted: m })

        if (!text.includes('tiktok.com'))
          return xp.sendMessage(chat.id, { text: 'Link tidak valid' }, { quoted: m })

        await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })

        const { data } = await axios.post(
          'https://tikwm.com/api/',
          qs.stringify({
            url: text,
            count: 1.2e1,
            cursor: 0e0,
            web: 1e0,
            hd: 1e0
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              Accept: 'application/json, text/javascript, */*; q=0.01',
              'X-Requested-With': 'XMLHttpRequest',
              'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
              Referer: 'https://tikwm.com/'
            }
          }
        )

        if (data.code !== 0e0) throw new Error('Gagal mengambil data dari TikTok')

        const res = data.data,
              cap = `TIKTOK DOWNLOAD

  Title: ${res.title}
  User: ${res.author.nickname} (@${res.author.unique_id})
  Durasi: ${res.duration}s
  Likes: ${res.digg_count}
  Views: ${res.play_count}
  Comments: ${res.comment_count}`

        await xp.sendMessage(chat.id, {
          video: { url: 'https://tikwm.com' + res.play },
          caption: cap
        }, { quoted: m })

        await xp.sendMessage(chat.id, {
          audio: { url: 'https://tikwm.com' + res.music },
          mimetype: 'audio/mpeg'
        }, { quoted: m })

      } catch (e) {
        err('error pada tiktok', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'ytdl',
    cmd: ['yt', 'ytdl'],
    tags: 'Download Menu',
    desc: 'download youtube mp4/mp3',
    owner: !1,
    prefix: !0,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        if (!args[0]) 
          return xp.sendMessage(chat.id, { text: 'Masukan link YouTube-nya' }, { quoted: m })

        const url = args[0],
              format = ['mp4','mp3'].includes(args[1]) ? args[1] : 'mp4',
              api = `${termaiWeb}/api/downloader/youtube?type=${format}&url=${encodeURIComponent(url)}&key=${termaiKey}`,
              res = await fetch(api),
              dl = await res.json()

        if (!dl.status || !dl.data?.downloads?.length)
          return xp.sendMessage(chat.id, { text: 'Gagal mengambil link download.' }, { quoted: m })

        const file = dl.data.downloads[0]
        await xp.sendMessage(chat.id, { 
          [format === 'mp3' ? 'audio' : 'video']: { url: file.dlink }, 
          mimetype: format === 'mp3' ? 'audio/mpeg' : 'video/mp4' 
        }, { quoted: m })
      } catch (e) {
        err('error pada ytdl', e)
      }
    }
  })
}