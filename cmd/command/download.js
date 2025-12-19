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
    money: 500,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              txt = quoted?.conversation || args.join(' ')

        if (!txt || !/facebook\.com|fb\.watch/i.test(txt)) {
          return xp.sendMessage(chat.id, { text: !txt ? `reply/masukan link fb\ncontoh: ${prefix}${cmd} https://www.facebook.com/share/v/1Dm66ZGfSY/` : 'link tidak valid' }, { quoted: m })
        }

        await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })

        const url = await fetch(`${termaiWeb}/api/downloader/facebook?url=${encodeURIComponent(txt)}&key=${termaiKey}`).then(r => r.json())

        if (!url.status || !url.data?.urls) {
          return xp.sendMessage(chat.id, { text: 'video tidak ditemukan' }, { quoted: m })
        }

        const res = url.data,
              videoUrl = res.urls.hd || res.urls.sd

        let teks = `${head} ${opb} *F A C E B O O K* ${clb}\n`
            teks += `${body} ${btn} *Deskripsi:* ${res.description}\n`
            teks += `${body} ${btn} *Durasi:* ${res.time}\n`
            teks += `${foot}${line}`

        await xp.sendMessage(chat.id, {
          text: teks,
          contextInfo: {
            externalAdReply: {
              body: 'D O W N L O A D I NG . . .',
              thumbnailUrl: thumbnail,
              mediaType: 1,
              renderLargerThumbnail: !0,
              sourceUrl: videoUrl
            }
          },
          forwardingScore: 1,
          isForwarded: !0,
          forwardedNewsletterMessageInfo: {
            newsletterJid: idCh,
            newsletterName: footer
          }
        })

        await xp.sendMessage(chat.id, {
          video: { url: videoUrl }
        })

      } catch (e) {
        err('error pada fb', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'gitclone',
    cmd: ['git', 'clone', 'gitclone'],
    tags: 'Download Menu',
    desc: 'Download repository GitHub dalam bentuk .zip',
    owner: !1,
    prefix: !0,
    money: 500,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        const url = args.join(' '),
              match = url.match(/github\.com\/([^\/]+)\/([^\/\s]+)/)

        if (!url || !url.includes('github.com')) {
          return xp.sendMessage(chat.id, { text: !url ? `contoh: ${prefix}${cmd} https://github.com/MaouDabi0/Dabi-Ai` : `link tidak valid` }, { quoted: m })
        }

        await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })

        if (!match) return xp.sendMessage(chat.id, { text: 'Invalid GitHub link.' }, { quoted: m })

        const [_, user, repoRaw] = match,
            repo = repoRaw.replace(/\.git$/, ''),
            zipUrl = `https://api.github.com/repos/${user}/${repo}/zipball`,
            head = await fetch(zipUrl, { method: 'HEAD' }),
            fileName = head.headers.get('content-disposition')?.match(/filename=(.*)/)?.[1]

        return fileName
          ? await xp.sendMessage(chat.id, {
              document: { url: zipUrl },
              fileName: fileName + '.zip',
              mimetype: 'application/zip'
            }, { quoted: m })
          : xp.sendMessage(chat.id, { text: 'Failed to get file info.' }, { quoted: m })
      } catch (e) {
        err('error pada gitclone', e)
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
    money: 500,
    exp: 0.1,

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
    money: 500,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              text = quoted?.conversation || args.join(' ')

        if (!text)
          return xp.sendMessage(chat.id, { text: `reply/kirim link tiktok nya\ncontoh: ${prefix}${cmd} https://vt.tiktok.com/7494086723190721798/` }, { quoted: m })

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
    money: 500,
    exp: 0.1,

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

        await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })

        if (!dl.status || !dl.data?.downloads?.length)
          return xp.sendMessage(chat.id, { text: 'Gagal mengambil link download.' }, { quoted: m })

        const file = dl.data.downloads[0]
        await xp.sendMessage(chat.id, { 
          [format === 'mp3' ? 'audio' : 'video']: { url: file.dlink }, 
          mimetype: format === 'mp3' ? 'audio/mpeg' : 'video/mp4' 
        }, { quoted: m })
      } catch (e) {
        err('error pada ytdl', e)
        call(xp, e, m)
      }
    }
  })
}