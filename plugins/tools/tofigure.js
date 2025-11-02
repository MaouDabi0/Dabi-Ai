import { downloadMediaMessage } from '@whiskeysockets/baileys'

export default {
  name: 'tofigure',
  command: ['tofigur', 'tofigure'],
  tags: 'Tools Menu',
  desc: 'Ubah gambar jadi figurine 3D realistis',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo,
          quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage,
          isImg = quoted?.imageMessage || msg.message?.imageMessage,
          prompt = `Using the nano-banana model, a commercial 1/7 scale figurine of the character in the picture was created, depicting a realistic style and a realistic environment. The figurine is placed on a computer desk with a round transparent acrylic base. There is no text on the base. The computer screen shows the Zbrush modeling process of the figurine. Next to the computer screen is a BANDAI-style toy box with the original painting printed on it.`
    if (!isImg) return conn.sendMessage(chatId, { text: 'Balas atau kirim gambar dengan caption tofigure' }, { quoted: msg })
    await conn.sendMessage(chatId, { text: 'Sedang memproses gambar...' }, { quoted: msg })

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
      await conn.sendMessage(chatId, { image: buf, caption: 'Figurine selesai dibuat' }, { quoted: msg })
    } catch (e) {
      await conn.sendMessage(chatId, { text: `Terjadi kesalahan: ${e.message}` }, { quoted: msg })
    }
  }
}