import fetch from 'node-fetch'

export default {
  name: 'fakestory',
  command: ['fakestory', 'story'],
  tags: 'Fun Menu',
  desc: 'generate story fake',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    try {
      const chatId = msg.from || msg.key?.remoteJid,
            sender = msg.sender || msg.key?.participant || chatId,
            username = args?.[0] || null;

      if (!username) return conn.sendMessage(chatId, { text: 'Usage: .story <username> <caption>\nContoh: .story juicee90 ndul cantik' }, { quoted: msg });

      const caption = args.length > 1 ? args.slice(1).join(' ') : ' ',
            apiBase = 'https://api.deline.web.id/maker/fakestory',
            fallback = `${thumbnail}`;
      let avatarUrl = fallback;

      try {
        if (typeof conn.profilePictureUrl == 'function') {
          const pp = await conn.profilePictureUrl(sender, 'image').catch(() => null);
          if (pp) avatarUrl = pp;
        } else if (conn.getProfilePicture) {
          const pp = await conn.getProfilePicture(sender).catch(() => null);
          if (pp) avatarUrl = pp;
        }
      } catch {}

      const apiUrl = `${apiBase}?username=${encodeURIComponent(username)}&caption=${encodeURIComponent(caption)}&avatar=${encodeURIComponent(avatarUrl)}`,
            res = await fetch(apiUrl);
      if (!res.ok) return conn.sendMessage(chatId, { text: `Gagal memanggil API (status ${res.status})` }, { quoted: msg });

      const cType = res.headers.get('content-type') || '';
      if (cType.includes('application/json')) {
        const j = await res.json().catch(() => null),
              errMsg = j?.error || 'API mengembalikan JSON, bukan gambar.';
        return conn.sendMessage(chatId, { text: `Error dari API: ${errMsg}` }, { quoted: msg });
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      await conn.sendMessage(chatId, { image: buffer, caption: `Fakestory • ${username}\n${caption}` }, { quoted: msg });
    } catch (err) {
      console.error(err);
      const chatId = msg.from || msg.key?.remoteJid;
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat membuat fakestory.' }, { quoted: msg });
    }
  }
};