import fs from "fs";
import axios from "axios";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

export default {
  name: "setpp",
  command: ["setpp", "setprofile"],
  tags: "Owner Menu",
  desc: "Ubah foto profil bot",
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;
    let img;

    try {
      if (msg.message?.imageMessage) {
        img = await downloadMediaMessage(msg, "buffer", {}, { reuploadRequest: conn.waUploadToServer });
      } else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
        img = await downloadMediaMessage(
          { message: msg.message.extendedTextMessage.contextInfo.quotedMessage },
          "buffer",
          {},
          { reuploadRequest: conn.waUploadToServer }
        );
      } else if (args[0] && /https?:\/\/.+\.(jpe?g|png|webp)/i.test(args[0])) {
        img = (await axios.get(args[0], { responseType: "arraybuffer" })).data;
      } else {
        return conn.sendMessage(
          chatId,
          { text: `Kirim/reply foto dgn caption:\n${prefix}${commandText} atau pakai URL` },
          { quoted: msg }
        );
      }

      await conn.updateProfilePicture(conn.user.id, img);
      await conn.sendMessage(chatId, { text: "✅ Foto profil berhasil diubah!" }, { quoted: msg });
    } catch (e) {
      console.error("Err setpp:", e);
      await conn.sendMessage(chatId, { text: "❌ Gagal mengubah foto profil." }, { quoted: msg });
    }
  },
};