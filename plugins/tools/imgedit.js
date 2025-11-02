import { downloadMediaMessage } from '@whiskeysockets/baileys'

export default {
  name: 'img2img',
  command: ['i2i', 'img2img'],
  tags: 'Tools Menu',
  desc: 'Ubah gambar dengan prompt menggunakan img2img API',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo,
          prompt = args.join(' '),
          quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage,
          isImg = quoted?.imageMessage || msg.message?.imageMessage
    if (!isImg || !prompt)
      return conn.sendMessage(chatId, { text: !isImg ? 'Balas atau kirim gambar dengan caption i2i' : 'Harap tulis prompt!\nContoh: .i2i ubah kulitnya jadi hitam' }, { quoted: msg })

    try {
      const media = await downloadMediaMessage({ message: quoted || msg.message }, 'buffer')
      if (!media) throw new Error('Media tidak terunduh')
      const res = await fetch(`${termaiWeb}/api/img2img/edit?key=${termaiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt, image: media })
            })
      if (!res.ok) throw new Error(`API Error: ${res.statusText} (${res.status})`)
      const buf = Buffer.from(await res.arrayBuffer())
      await conn.sendMessage(chatId, { image: buf, caption: `Hasil edit untuk prompt: ${prompt}` }, { quoted: msg })
    } catch (e) {
      await conn.sendMessage(chatId, { text: `Terjadi kesalahan: ${e.message}` }, { quoted: msg })
    }
  }
}