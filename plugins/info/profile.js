export default {
  name: "profile",
  command: ["profile", "profil", "me", "claim"],
  tags: "Info Menu",
  desc: "Menampilkan informasi profil.",
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText
  }) => {
    const { chatId, senderId, pushName } = chatInfo;
    const targetId = target(msg, senderId);
    const mention = `${targetId}@s.whatsapp.net`;

    try {
      initDB();
      const db = getDB();
      const userEntry = getUser(mention);

      if (!userEntry) {
        return conn.sendMessage(
          chatId,
          { text: `Kamu belum terdaftar di database!\n\nKetik ${prefix}daftar untuk mendaftar.` },
          { quoted: msg }
        );
      }

      const user = userEntry.data;
      const username = userEntry.key;

      if (commandText.toLowerCase() === "claim") {
        const result = await claimTrial(mention);
        return conn.sendMessage(chatId, { text: result.message }, { quoted: msg });
      }

      const isPrem = user.isPremium?.isPrem;
      const premTime = user.isPremium?.time || 0;
      const isPremiumText = isPrem
        ? premTime > 0
          ? Format.duration(0, premTime).trim()
          : "Kadaluarsa"
        : "Tidak";

      if (!user.money) {
        user.money = { amount: 300000 };
        saveDB();
      }

      const moneyAmount = user.money?.amount || 0;
      const formattedMoney = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(moneyAmount);

      const claimText = user.claim
        ? "Kamu sudah claim trial"
        : `Kamu bisa claim trial premium dengan ${prefix}claim`;

      const profileText =
        `${head} ${Obrack} Profil @${targetId} ${Cbrack}\n` +
        `${side} ${btn} *Nama:* ${username || "Pengguna"}\n` +
        `${side} ${btn} *Nomor:* ${user.Nomor.replace(/@s\.whatsapp\.net$/, "")}\n` +
        `${side} ${btn} *Auto AI:* ${user.autoai ? "Aktif ✅" : "Nonaktif ❌"}\n` +
        `${side} ${btn} *Private Cmd:* ${user.cmd || 0}\n` +
        `${side} ${btn} *Uang:* ${formattedMoney}\n` +
        `${side} ${btn} *Status Premium:* ${isPrem ? "Ya ✅" : "Tidak ❌"}\n` +
        `${side} ${btn} *Premium Time:* ${isPremiumText}\n` +
        `${side} ${btn} *Nomor Id:* ${user.noId || "Tidak ada"}\n` +
        `${side} ${btn} *Di Penjara:* ${user.jail ? "Iya" : "Tidak"}\n` +
        `${foot}${garis}\n\n${claimText}`;

      const defaultThumb = "https://files.catbox.moe/6ylerz.jpg";
      let thumbPp = defaultThumb;

      try {
        thumbPp = await conn.profilePictureUrl(mention, "image");
      } catch {
        thumbPp = defaultThumb;
      }

      await conn.sendMessage(
        chatId,
        {
          text: profileText,
          mentions: [mention],
          contextInfo: {
            externalAdReply: {
              title: "Profile Info",
              body: `Ini Adalah Profile ${pushName}`,
              thumbnailUrl: thumbPp,
              mediaType: 1,
              renderLargerThumbnail: true,
            },
            mentionedJid: [mention],
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: idCh,
            },
          },
        },
        { quoted: msg }
      );
    } catch (err) {
      console.error("Error di plugin profile.js:", err);
      conn.sendMessage(chatId, { text: "Terjadi kesalahan saat mengambil profil." }, { quoted: msg });
    }
  },
};