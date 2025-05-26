module.exports = {
  name: 'profile',
  command: ['profile', 'profil', 'me', 'claim'],
  tags: 'Info Menu',
  desc: 'Menampilkan informasi profil.',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, pushName } = chatInfo;
    try {
      const targetId = target(message, senderId);
      const mentionTarget = `${targetId}@s.whatsapp.net`;

      intDB();
      const db = readDB();

      const userData = getUser(db, mentionTarget);
      if (!userData) {
        return conn.sendMessage(chatId, {
          text: `⚠️ Kamu belum terdaftar di database!\n\nKetik *${prefix}daftar* untuk mendaftar.`,
        }, { quoted: message });
      }

      const user = userData.value;

      if (commandText.toLowerCase() === 'claim') {
        const result = await tryFree(mentionTarget);
        return conn.sendMessage(chatId, {
          text: result.message
        }, { quoted: message });
      }

      let isPremiumText = "Tidak ❌";
      if (user.isPremium?.isPrem) {
        const now = Math.floor(Date.now() / 1000);
        const activated = Math.floor((user.isPremium.activatedAt || Date.now()) / 1000);
        const expired = activated + Math.floor(user.isPremium.time / 1000);

        if (expired > now) {
          const remaining = Format.duration(now, expired);
          isPremiumText = remaining.trim();
        } else {
          isPremiumText = "Kadaluarsa ❗";
        }
      }

      const claimText = !user.claim
        ? `Kamu bisa claim trial premium dengan *${prefix}claim*`
        : `Kamu sudah claim trial`;

      let profileText = `${head} ${Obrack} Profil @${targetId} ${Cbrack}\n`;
      profileText += `${side} ${btn} *Nomor:* ${user.Nomor.replace(/@s\.whatsapp\.net$/, "")}\n`;
      profileText += `${side} ${btn} *Auto AI:* ${user.autoai ? "Aktif ✅" : "Nonaktif ❌"}\n`;
      profileText += `${side} ${btn} *Private Cmd:* ${user.cmd || 0}\n`;
      profileText += `${side} ${btn} *Umur:* ${user.umur || "Tidak diatur"}\n`;
      profileText += `${side} ${btn} *Status Premium:* ${user.isPremium?.isPrem ? "Ya ✅" : "Tidak ❌"}\n`;
      profileText += `${side} ${btn} *Premium Tersisa:* ${isPremiumText}\n`;
      profileText += `${side} ${btn} *Nomor Id:* ${user.noId || "Tidak ada"}\n`;
      profileText += `${foot}${garis}\n\n`;
      profileText += `${claimText}`;

      await conn.sendMessage(chatId, {
        text: profileText,
        mentions: [mentionTarget],
        contextInfo: {
          externalAdReply: {
            title: pushName,
            body: `Ini adalah Profile ${pushName}`,
            thumbnailUrl: thumbnail,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
          mentionedJid: [mentionTarget],
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363310100263711@newsletter'
          }
        }
      }, { quoted: message });

    } catch (error) {
      console.error("Error di plugin profile.js:", error);
      await conn.sendMessage(chatInfo.chatId, {
        text: "⚠️ Terjadi kesalahan saat mengambil profil!"
      }, { quoted: message });
    }
  },
};