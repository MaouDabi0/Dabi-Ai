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
    money: 0,
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

        if (!txt || !/facebook\.com|fb\.watch/i.test(txt)) return xp.sendMessage(chat.id, { text: !txt ? `reply/masukan link fb\ncontoh: ${prefix}${cmd} https://www.facebook.com/share/v/1Dm66ZGfSY/` : 'link tidak valid' }, { quoted: m })

        await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })

        const url = await fetch(`https://api.danzy.web.id/api/download/facebook?url=${encodeURIComponent(txt)}`).then(r => r.json())

        if (!url.status || !url.data) return xp.sendMessage(chat.id, { text: 'video tidak ditemukan' }, { quoted: m })

        const res = url.data,
              videoUrl = res.hd || res.sd

        let teks = `${head} ${opb} *F A C E B O O K* ${clb}\n`
            teks += `${body} ${btn} *Title:* ${res.title}\n`
            teks += `${body} ${btn} *Deskripsi:* ${res.description}\n`
            teks += `${foot}${line}`

        await xp.sendMessage(chat.id, {
          video: { url: videoUrl },
          caption: teks
        }, { quoted: m })
      } catch (e) {
        err('error pada fb', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'igdl',
    cmd: ['ig'],
    tags: 'Download Menu',
    desc: 'mendownload video instagram',
    owner: !1,
    prefix: !0,
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        const q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              txt = q?.conversation || args.join(' ')

        if (!txt || !/instagram\.com/i.test(txt)) return xp.sendMessage(chat.id, { text: !txt ? `reply/masukan link ig\ncontoh: ${prefix}${cmd} https://www.instagram.com/reel/DN98f8iE53D/?igsh=MTc4bjE0YmdmcXRkNw==` : `link tidak valid` }, { quoted: m })

        await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })

        const url = await fetch(`https://api.danzy.web.id/api/download/instagram?url=${encodeURIComponent(txt)}`).then(r => r.json())

        if (!url.status || !url.result) return xp.sendMessage(chat.id, { text: 'data tidak ditemukan' }, { quoted: m })

        const res = url.result,
              vid = res.url || res.download_url

        let teks = `${head} ${opb} *I N S T A G R A M* ${clb}\n`
            teks += `${body} ${btn} *Type:* ${res.type}\n`
            teks += `${foot}${line}`

        await xp.sendMessage(chat.id, {
          video: { url: vid },
          caption: teks
        }, { quoted: m })
      } catch (e) {
        err('error pada igdl', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'gitclone',
    cmd: ['git', 'clone', 'gitclone'],
    tags: 'Download Menu',
    desc: 'Download repository GitHub dalam bentuk zip',
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
    name: 'pindl',
    cmd: ['pindl', 'pin'],
    tags: 'Download Menu',
    desc: 'mendownload video dari pin',
    owner: !1,
    prefix: !0,
    money: 1000,
    exp: 0.3,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        const url = args.join(' ') || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation,
              match = url?.match(/pin\.it/)

        if (!url || !url.includes('pin.it')) return xp.sendMessage(chat.id, { text: `reply/kirim link pin nya contoh:\n${prefix}${cmd} https://pin.it/1YNzogEJv` }, { quoted: m })

        await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })

        const api = await fetch(`https://api.deline.web.id/downloader/pinterest?url=${encodeURIComponent(url)}`).then(r => r.json())

        if (!api.status) return xp.sendMessage(chat.id, { text: 'status api false' }, { quoted: m })

        const res = api?.result,
              type = res.video ? 'Video' : (res.image && res.image !== 'Tidak ada' ? 'Image' : '-'),
              valid = v => typeof v === 'string' && v !== 'Tidak ada'

        let txt = `${head}${opb} *P I N  D L* ${clb}\n`
            txt += `${body} ${btn} *Link:* ${res.original_url}\n`
            txt += `${body} ${btn} *Type:* ${type}\n`
            txt += `${foot}${line}`

        if (valid(res?.video) || valid(res?.image)) {
          await xp.sendMessage(chat.id, valid(res?.video)
            ? { video: { url: res.video }, caption: txt }
            : { image: { url: res.image }, caption: txt }, { quoted: m })
        } else {
          return xp.sendMessage(chat.id, { text: 'media tidak ditemukan' }, { quoted: m })
        }
      } catch (e) {
        err('error pada pindl', e)
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
              rawSize = res.hd_size || res.size || 0,
              sizeText = rawSize >= 1024 * 1024
                ? (rawSize / 1024 / 1024).toFixed(2) + ' MB'
                : (rawSize / 1024).toFixed(2) + ' KB'

        let cap = `${head} ${opb} *T I K T O K* ${clb}\n`
            cap += `${body} ${btn} *Title:* ${res.title}\n`
            cap += `${body} ${btn} *Region:* ${res.region}\n`
            cap += `${body} ${btn} *Duration:* ${res.duration}\n`
            cap += `${body} ${btn} *Size:* ${sizeText}\n`
            cap += `${body} ${btn} *Author:* ${res.author.nickname}\n`
            cap += `${body} ${btn} *Tag:* ${res.author.unique_id}\n`
            cap += `${foot}${line}`

        await xp.sendMessage(chat.id, {
          video: { url: 'https://tikwm.com' + res.hdplay },
          caption: cap
        }, { quoted: m })
        
        await xp.sendMessage(chat.id, {
          audio: { url: res.music_info.play },
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
    money: 0,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        if (!args[0]) return xp.sendMessage(chat.id, { text: `Masukan link YouTube-nya\ncontoh: ${prefix}${cmd} mp4 <url> 1080p` }, { quoted: m })

        const url = args[1],
              fmt = (args[0] || 'mp4').toLowerCase(),
              mp3 = fmt === 'mp3',
              q = args[2] || '1080p',
              api = `https://api.danzy.web.id/api/download/${mp3 ? 'ytmp3' : 'ytmp4'}?url=${encodeURIComponent(url)}`

        await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })

        const dl = await (await fetch(api)).json()

        if (!dl.status)
          return xp.sendMessage(chat.id, { text: 'Gagal mengambil data dari API.' }, { quoted: m })

        if (mp3 || !mp3) {
          mp3
            ? !dl.url
              ? xp.sendMessage(chat.id, { text: 'Link audio tidak tersedia.' }, { quoted: m })
              : xp.sendMessage(chat.id, { audio: { url: dl.url }, mimetype: 'audio/mpeg', caption: dl.title }, { quoted: m })
            : (() => {
                const ql = dl.quality_list || {},
                      available = Object.keys(ql)
                        .filter(k =>
                          ql[k]?.url &&
                          typeof ql[k].url === 'string' &&
                          !ql[k].url.includes('Failed')
                        )
                        .sort((a, b) => parseInt(b) - parseInt(a))

                if (!ql[q] || !ql[q].url || String(ql[q].url).includes('Failed')) {
                  if (!available.length)
                    return xp.sendMessage(chat.id, { text: 'Tidak ada quality video yang tersedia.' }, { quoted: m })

                  return xp.sendMessage(chat.id, { text: `Quality ${q} tidak tersedia.\n\nQuality yang tersedia:\n${available.map(v => `• ${v}`).join('\n')}\nGunakan:\n${prefix}${cmd} mp4 ${url} <quality>` }, { quoted: m })
                }

                return xp.sendMessage(chat.id, { video: { url: ql[q].url }, mimetype: 'video/mp4', caption: `${dl.title}\nQuality: ${q}` }, { quoted: m })
              })()
        }
      } catch (e) {
        err('error pada ytdl', e)
        call(xp, e, m)
      }
    }
  })
}