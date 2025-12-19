import axios from 'axios'
import fetch from 'node-fetch'
import { downloadMediaMessage } from 'baileys'

export default function ai(ev) {
  ev.on({
    name: 'bell',
    cmd: ['ai', 'bell'],
    tags: 'Ai Menu',
    desc: 'Fitur open ai',
    owner: !1,
    prefix: !0,
    money: 500,
    exp: 0.2,

    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        const { id, group, sender } = chat,
              val = args[0]?.toLowerCase();

        if (!['on', 'off'].includes(val)) 
          return xp.sendMessage(id, { text: `Gunakan perintah ${prefix}${cmd} on/off` }, { quoted: m });

        const value = val === 'on',
              key = Object.keys(db().key).find(k => db().key[k].jid === (group ? sender : id));

        if (!key) return;

        db().key[key].ai.bell = value;
        saveDb();

        xp.sendMessage(id, { text: `ai telah ${value ? 'diaktifkan' : 'dinonaktifkan'}.` }, { quoted: m });
      } catch (e) {
        err('error pada bell', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'resetbell',
    cmd: ['resetbell', 'reset'],
    tags: 'Ai Menu',
    desc: 'Reset sesi AI Bell',
    owner: !1,
    prefix: !0,
    money: 500,
    exp: 0.1,

    run: async (xp, m, {
      args,
      chat
    }) => {
      try {
        const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
          || m.message?.extendedTextMessage?.contextInfo?.participant
          || chat.sender

        if (!target) 
          return await xp.sendMessage(chat.id, { text: 'Target tidak ditemukan.' }, { quoted: m })

        const res  = await fetch(`${termaiWeb}/api/chat/logic-bell/reset?id=${target}&key=${termaiKey}`),
              json = await res.json()

        await xp.sendMessage(chat.id, { text: json.m || json.msg || 'Terjadi error saat reset sesi Bell.' }, { quoted: m })
      } catch (e) {
        err('error pada resetbell', e)
        call(xp, e, m)
      }
    }
  })

  ev.on({
    name: 'cekkey',
    cmd: ['cekkey', 'key'],
    tags: 'Ai Menu',
    desc: 'cek key termai',
    owner: !1,
    prefix: !0,
    money: 500,
    exp: 0.1,

    run: async (xp, m, {
      chat
    }) => {
      try {
        const res = await fetch(`${termaiWeb}/api/tools/key-checker?key=${termaiKey}`),
              json = await res.json();

        if (!json.status) {
          return xp.sendMessage(chat.id, { text: `gagal mengambil data api ${json.data}` }, { quoted: m })
        }

        const d = json.data,
              formatTime = ({ days, hours, minutes, seconds }) =>
              [days && `${days} hari`, hours && `${hours} jam`, minutes && `${minutes} menit`, seconds && `${seconds} detik`]
                .filter(Boolean)
                .join(", ");

        let txt = `${head}${opb} *Info API Key* ${clb}\n` +
          `${body} ${btn} *Plan:* ${d.plan}\n` +
          `${body} ${btn} *Limit:* ${d.limit}\n` +
          `${body} ${btn} *Usage:* ${d.usage}\n` +
          `${body} ${btn} *Total Hit:* ${d.totalHit}\n` +
          `${body} ${btn} *Remaining:* ${d.remaining}\n` +
          `${body} ${btn} *Reset:* ${d.reset}\n` +
          `${body} ${btn} *Reset Dalam:* ${formatTime(d.resetEvery.format)}\n` +
          `${body} ${btn} *Expired:* ${d.expired}\n` +
          `${body} ${btn} *Expired?:* ${d.isExpired ? "Ya" : "Tidak"}\n` +
          `${foot}${line}\n\n` +
          `${head} *Fitur & Pemakaian:*\n`;

        for (const [fitur, detail] of Object.entries(d.features)) {
          if (typeof detail !== "object") continue;
          txt += `${body} ${btn} ${fitur}:\n` +
            `${body} ${btn} *Max:* ${detail.max ?? "-"}\n` +
            `${body} ${btn} *Use:* ${detail.use ?? "-"}\n` +
            `${body} ${btn} *Hit:* ${detail.hit ?? "-"}\n` +
            (detail.lastReset ? `${body} ${btn} *Last Reset:* ${new Date(detail.lastReset).toLocaleString("id-ID")}\n` : "") +
            `${body} ${line}\n`;
        }

        txt += `${body} Api Dari ${termaiWeb}\n${foot}${line}\n`;

        xp.sendMessage(chat.id, { text: txt.trim() }, { quoted: m })
      } catch (e) {
        err('error pada cekkey', e)
      }
    }
  })

  ev.on({
    name: 'img2img',
    cmd: ['img2img', 'i2i'],
    tags: 'Ai Menu',
    desc: 'edit gambar dengan generatif ai',
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
        const prompt = args.join(" "),
              q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              quotedKey = m.message?.extendedTextMessage?.contextInfo,
              image = q?.imageMessage || m.message?.imageMessage

        if (!image && !prompt) {
          return xp.sendMessage(chat.id, { text: !image ? `reply/kirim gambar dengan caption ${prefix}${cmd} prompt` : `sertakan prompt\ncontoh prompt: ${prefix}${cmd} ubah kulitnya jadi hitam` }, { quoted: m })
        }

        await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })

        let media
        try {
          if (q?.imageMessage) {
            media = await downloadMediaMessage({ key: quotedKey, message: q }, 'buffer')
          } else if (m.message?.imageMessage) {
            media = await downloadMediaMessage(m, 'buffer')
          }
          if (!media) throw new Error('media tidak terunduh')
        } catch (e) {
          err('gagal mengunduh media', e)
        }

        const res = await fetch(`${termaiWeb}/api/img2img/edit?key=${termaiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, image: media })
        })

        if (!res.ok) throw new Error(`API Error: ${res.statusText} (${res.status})`)

        const array = await res.arrayBuffer(),
              imgBuffer = Buffer.from(array)

        await xp.sendMessage(chat.id, { image: imgBuffer, caption: `hasil dengan prompt: ${prompt}` }, { quoted: m })
      } catch (e) {
        err('error pada img2img', e)
      }
    }
  })

  ev.on({
    name: 'img2vid',
    cmd: ['i2v', 'img2vid'],
    tags: 'Ai Menu',
    desc: 'ubah gambar jadi video',
    owner: !1,
    prefix: !0,
    money: 1500,
    exp: 0.2,
  
    run: async (xp, m, {
      args,
      chat,
      cmd,
      prefix
    }) => {
      try {
        const q = m.message?.extendedTextMessage?.contextInfo,
              mediaMessage = q?.quotedMessage?.imageMessage || m.message?.imageMessage,
              prompt = args.join(' ')

        if (!mediaMessage || !prompt)
          return xp.sendMessage(chat.id, { text: `mana gambar nya?\ncontoh: ${prefix}${cmd} perhalus gerakannya` }, { quoted: m })

        await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })

        const media = await downloadMediaMessage({ message: { imageMessage: mediaMessage } }, 'buffer')
        if (!media) throw new Error('gagal mengunduh gambar')

        const response = await axios.post(
          `${termaiWeb}/api/img2video/luma?key=${termaiKey}&prompt=${encodeURIComponent(prompt)}`,
          media, {
            headers: { "Content-Type": "application/octet-stream" },
            responseType: "stream"
          })

        let lastUrl = null,
            finished = !1

        response.data.on('data', chunk => {
          if (finished) return

          try {
            const lines = chunk.toString()
                               .split('\n')
                               .filter(v => v.startsWith('data: '))

            for (const line of lines) {
              const data = JSON.parse(line.slice(6))

              if (data.url) lastUrl = data.url

              if (data.status === 'failed') {
                finished = !0
                response.data.destroy()
                return call(xp, new Error('gagal generate video'), m)
              }

              if (data.status === 'completed') {
                finished = !0
                response.data.destroy()

                const videoUrl = data?.video?.url || data?.url || lastUrl
                if (!videoUrl)
                  return call(xp, new Error('video tidak ditemukan'), m)

                return xp.sendMessage(chat.id, { video: { url: videoUrl }, caption: 'berhasil convert gambar ke video' }, { quoted: m })
              }
            }
          } catch (e) {
            finished = !0
            response.data.destroy()
            call(xp, e, m)
          }
        })

        response.data.on('error', e => {
          if (finished) return
          finished = !0
          call(xp, e, m)
        })
      } catch (e) {
        err('error pada img2video', e)
        call(xp, e, m)
      }
    }
  })
}