export default {
  name: 'fontgenerator',
  command: ['gfont', 'fontgenerator'],
  tags: 'Tools Menu',
  desc: 'Generate text with fancy fonts',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo,
          fonts = {
            monoupper: { normal: "abcdefghijklmnopqrstuvwxyz1234567890@#$_&-+()/", fancy: "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890@#$_&-+()/" },
            manuscript: { normal: "abcdefghijklmnopqrstuvwxyz", fancy: "\uD835\uDCB6\uD835\uDCB7\uD835\uDCB8\uD835\uDCB9\uD835\uDCBA\uD835\uDCBB\uD835\uDCBC\uD835\uDCBD\uD835\uDCBE\uD835\uDCBF\uD835\uDCC0\uD835\uDCC1\uD835\uDCC2\uD835\uDCC3\uD835\uDCC4\uD835\uDCC5\uD835\uDCC6\uD835\uDCC7\uD835\uDCC8\uD835\uDCC9\uD835\uDCCA\uD835\uDCCB\uD835\uDCCC\uD835\uDCCD\uD835\uDCCE" },
            handwriting: { normal: "abcdefghijklmnopqrstuvwxyz", fancy: "\u1D43\u1D47\u1D9C\u1D48\u212F\u1DA0\u1D4D\u02B0\u1D62\u2C7C\u1D4F\u02E1\u1D50\u1D58\u1D52\u1D56\u1D60\u1D63\u1D64\u1D57\u1D1C\u1D5B\u1D21\u02E3\u02B8\u1D22" }
          },
          convert = (txt, font) => {
            const f = fonts[font]
            return !f ? null : [...txt.toLowerCase()].map(ch => {
              let i = f.normal.indexOf(ch)
              return i >= 0 ? f.fancy[i] : ch
            }).join("")
          }

    try {
      if (!args.length || args.length < 2) {
        const text = !args.length
          ? `Daftar font tersedia:\n- ${Object.keys(fonts).join("\n- ")}\n\nUsage: .gfont <fontname> <text>`
          : `Usage: .gfont <fontname> <text>`
        return await conn.sendMessage(chatId, { text }, { quoted: msg })
      }

      const res = convert(args.slice(1).join(" "), args[0].toLowerCase())
      await conn.sendMessage(chatId, { text: res || `Font "${args[0]}" tidak tersedia.` }, { quoted: msg })
    } catch (e) {
      await conn.sendMessage(chatId, { text: `Error: ${e.message}` }, { quoted: msg })
    }
  }
}