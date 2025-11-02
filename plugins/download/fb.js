import facebook from "../../toolkit/scrape/facebook.js";

export default {
  name: 'facebook',
  command: ['fb', 'fbdl', 'facebook'],
  tags: 'Download Menu',
  desc: 'Download video dari Facebook',
  prefix: !0,
  premium: !0,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo, url = args[0];
    if (!url || !/^https?:\/\/(www\.)?facebook\.(com|watch)\/.+/.test(url))
      return conn.sendMessage(chatId, { text: !url ? `Format salah. Gunakan: ${prefix}${commandText} <url>` : `URL Facebook tidak valid.` }, { quoted: msg });

    try {
      await conn.sendMessage(chatId, { react: { text: "⏳", key: msg.key } });
      const data = await facebook(url),
            { url: videoUrl, resolution = "Tidak diketahui", format = "Tidak diketahui" } = data?.video?.[0] || {},
            caption = `Video ditemukan:\nResolusi: ${resolution}\nFormat: ${format}`;
      return !data?.status || !data.video?.length
        ? conn.sendMessage(chatId, { text: "Gagal mengambil video. Pastikan link valid dan publik." }, { quoted: msg })
        : conn.sendMessage(chatId, { caption, video: { url: videoUrl } }, { quoted: msg });
    } catch (err) {
      console.error(err), await conn.sendMessage(chatId, { text: "Terjadi kesalahan. Coba lagi nanti." }, { quoted: msg });
    }
  },
};