/*  
 * Create By Dabi  
 * © 2025  
 */

import fs from "fs";
import path from "path";
import pino from "pino";
import chalk from "chalk";
import readline from "readline";
import { Boom } from "@hapi/boom";
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import { fileURLToPath } from "url";

import stg from "./toolkit/setting.js";
import makeInMemoryStore from "./toolkit/store.js";
import Cc from "./session/setCfg.js";
import { cekSholat } from "./toolkit/pengingat.js";
import emtData from "./toolkit/transmitter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { reset, timer, labvn, saveLidCache, messageContent, checkSpam } = emtData;
const { isPrefix } = stg;

const logger = pino({ level: "silent" });
const store = makeInMemoryStore();

let conn;

global.plugins = {};
global.categories = {};
global.lidCache = {};
global.initDB();

setInterval(async () => {
  const now = Date.now()
  const db = getDB()

  for (const u of Object.values(db.Private)) {
    const prem = u.isPremium
    if (prem?.isPrem && (prem.time = Math.max(prem.time - 60000, 0)) === 0) prem.isPrem = false
  }

  for (const g of Object.values(db.Grup || {})) {
    const gf = g.gbFilter || {}
    for (const [type, mode] of Object.entries({ closeTime: "announcement", openTime: "not_announcement" })) {
      const t = gf[type]
      if (t?.active && now >= t.until) {
        try {
          await conn.groupSettingUpdate(g.Id, mode)
          delete gf[type]
          await conn.sendMessage(g.Id, { text: `✅ Grup telah *di${mode === "announcement" ? "tutup" : "buka"}* otomatis.` })
        } catch (err) {
          console.error(`[AutoGroup] Error update setting:`, err)
        }
      }
    }
  }

  saveDB()

  if (global.autoBackup && now % (24 * 60 * 60 * 1000) < 60000) {
    try {
      const { default: backup } = await import(`./plugins/owner/backup.js?update=${Date.now()}`)
      const owners = (Array.isArray(global.ownerNumber) ? global.ownerNumber : [global.ownerNumber])
        .map(n => n.replace(/\D/g, "") + "@s.whatsapp.net")
      await backup.run(conn, {}, { chatInfo: { chatId: owners[0] } })
    } catch (err) {
      console.error("[AutoBackup] Error:", err)
    }
  }
}, 60000)

const mute = async (chatId, senderId, conn) => {
  const groupData = getGc(chatId);
  if (!groupData?.mute) return false;

  const meta = await conn.groupMetadata(chatId);
  const isAdmin = meta.participants.some((p) => p.admin && p.id === senderId);
  return false;
};

const isPublic = (senderId) => {
  if (!global.public) {
    const senderNumber = senderId.replace(/\D/g, "");
    return !global.ownerNumber.includes(senderNumber);
  }
  return false;
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (q) => new Promise((res) => rl.question(q, res));

const startBot = async () => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("./session");
    conn = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      syncFullHistory: false,
      markOnlineOnConnect: false,
      messageCache: 3750,
      logger,
      browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    conn.ev.on("creds.update", saveCreds);
    store.bind(conn.ev);

    if (!state.creds?.me?.id) {
      console.log(chalk.blueBright.bold("📱 Masukkan nomor bot WhatsApp Anda:"));
      const phone = await normalizeNumber(await question("> "));
      const code = await conn.requestPairingCode(phone);
      console.log(chalk.greenBright.bold("🔗 Kode Pairing:"), code?.match(/.{1,4}/g)?.join("-") || code);
    }

    conn.reactionCache ??= new Map();
    rl.close();

    conn.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update

      ;({
        open: () => {
          console.log(chalk.greenBright.bold("✅ Bot online!"))
          global.autoBio && updateBio(conn)
        },

        connecting: () => {
          console.log(chalk.yellowBright.bold("🔄 Menghubungkan kembali..."))
        },

        close: () => {
          const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
          console.log(chalk.redBright.bold("❌ Koneksi terputus, mencoba ulang..."))

          if (reason === DisconnectReason.loggedOut) {
            console.log(chalk.redBright.bold("🚫 Session invalid / logout, hapus session lalu scan ulang."))
            startBot()
          } else {
            startBot()
          }
        },
      }[connection]?.())
    })

    conn.ev.on("messages.upsert", async ({ messages }) => {
      const msg = messages?.[0];

      if (!msg?.message) {
        return;
      }

      const { chatId, isGroup, senderId, pushName } = exCht(msg);

      if (isGroup) {
        const meta = await getMetadata(chatId, conn);
        if (meta) {
          await saveLidCache(meta);
        }
      }

      replaceLid(msg);
      const { textMessage, mediaInfo } = messageContent(msg);
      if (!textMessage && !mediaInfo) return;

      const msgId = msg.key?.id;
      if (["conversation", "extendedTextMessage", "imageMessage", "videoMessage"].some((t) => msg.message?.[t])) {
        conn.reactionCache.set(msgId, msg);
        setTimeout(() => conn.reactionCache.delete(msgId), 180000);
      }

      const time = Format.indoTime("Asia/Jakarta", "HH:mm");
      const senderNumber = senderId?.split("@")[0];
      if (!senderNumber) {
        console.error(chalk.redBright.bold("gagal mendapatkan nomor pengirim", senderNumber));
        return;
      }

      const db = getDB();
      const userDb = getUser(senderId);
      const isPrem = userDb?.value?.isPremium?.isPrem || false;

      let displayName = pushName || "Pengguna";
      if (isGroup) {
        const meta = await getMetadata(chatId, conn);
        displayName = meta ? `${meta.subject} | ${displayName}` : `Grup Tidak Dikenal | ${displayName}`;
      }

      console.log(chalk.yellowBright.bold(`【 ${displayName} 】:`) + chalk.cyanBright.bold(` [ ${time} ]`));
      if (mediaInfo && textMessage) console.log(chalk.whiteBright.bold(`  [ ${mediaInfo} ] | [ ${textMessage} ]`));
      else if (mediaInfo) console.log(chalk.whiteBright.bold(`  [ ${mediaInfo} ]`));
      else if (textMessage) console.log(chalk.whiteBright.bold(`  [ ${textMessage} ]`));

      if (banned(senderId)) return console.log(`⚠️ User ${senderId} dibanned`);

      await Promise.all([
        cekSholat(conn, msg, { chatId }),
        labvn(textMessage, msg, conn, chatId),
        Cc(conn, msg, textMessage),
      ]);

      if (await groupFilter(conn, msg, chatId, senderId, isGroup)) {
        return;
      }
      if (await badwordFilter(conn, msg, chatId, senderId, isGroup)) {
        return;
      }
      if (await mute(chatId, senderId, conn)) {
        return;
      }
      if (isPublic(senderId)) {
        return;
      }

      if (msg.message.reactionMessage) {
        await rctKey(msg, conn);
      }

      const { ownerSetting } = setting;
      global.lastGreet ??= {};
      if (
        isGroup &&
        ownerSetting.forOwner &&
        ownerSetting.ownerNumber.includes(senderNumber) &&
        Date.now() - (global.lastGreet[senderId] || 0) > 300000
      ) {
        global.lastGreet[senderId] = Date.now();
          await conn.sendMessage(
           chatId,
          { text: setting?.msg?.rejectMsg?.forOwnerText || "Selamat datang owner ku", mentions: [senderId] },
          { quoted: msg }
        );
      }

      if ((isGroup && global.readGroup) || (!isGroup && global.readPrivate)) {
        await conn.readMessages([msg.key]);
      }

      if (global.autoTyping) {
        await conn.sendPresenceUpdate("composing", chatId);
        setTimeout(() => conn.sendPresenceUpdate("paused", chatId), 3000);
      }

      await Promise.all([
        cancelAfk(senderId, chatId, msg, conn),
        afkTag(msg, conn),
        shopHandle(conn, msg, textMessage, chatId, senderId),
        handleGame(conn, msg, chatId, textMessage),
      ]);

      if (await global.chtEmt(textMessage, msg, senderId, chatId, conn)) {
        return;
      }

      if (!isPrem) {
        const mode = global.setting?.botSetting?.Mode || "private";
        if ((mode === "group" && !isGroup) || (mode === "private" && isGroup)) {
          return;
        }
      }

      const parsedPrefix = parseMessage(msg, isPrefix);
      const parsedNoPrefix = parseNoPrefix(msg);
      if (!parsedPrefix && !parsedNoPrefix) {
        return;
      }

      const runPlugin = async (parsed, prefixUsed) => {
        const { commandText, chatInfo } = parsed;

        for (const [fileName, plugin] of Object.entries(global.plugins)) {
          if (!plugin?.command?.includes(commandText)) continue;

          if (prefixUsed) {
            authUser(msg, chatInfo);
            if (await checkSpam(chatInfo.senderId, conn, chatInfo.chatId)) return;
          }

          const userData = getUser(chatInfo.senderId);

          if (
            (plugin.premium && !(await global.isPrem(plugin, conn, msg))) ||
            (plugin.owner && !(await global.isOwner(plugin, conn, msg)))
          ) continue;

          const allowRun =
            plugin.prefix === "both" ||
            (plugin.prefix === false && !prefixUsed) ||
            ((plugin.prefix !== false && plugin.prefix !== "both") && prefixUsed);

          if (!allowRun) continue;

          try {
            await plugin.run(conn, msg, { ...parsed, isPrefix, store });

            if (userData) {
              userData.data.cmd = (userData.data.cmd || 0) + 1;
              saveDB(getDB());
            }
          } catch (err) {
            console.log(chalk.redBright.bold(`❌ Error plugin: ${fileName}\n${err.stack}`));
          }

          break;
        }
      };

      if (parsedPrefix) await runPlugin(parsedPrefix, true);
      if (parsedNoPrefix) await runPlugin(parsedNoPrefix, false);
    });

    conn.ev.on('group-participants.update', async ({ id: chatId, participants, action }) => {
      try {
        const isWelcome = enWelcome(chatId) && action === 'add';
        const isLeave = enLeft(chatId) && ['remove', 'leave'].includes(action);
        const textTemplate = isWelcome ? getWelTxt(chatId) : isLeave ? getLeftTxt(chatId) : '';

        if (textTemplate) {
          for (const participant of participants) {
            const userTag = `@${participant.split('@')[0]}`;
            const text = textTemplate
              .replace(/@user|%user/g, userTag)
              .replace(/%time/g, Format.time());

            await conn.sendMessage(chatId, { text, mentions: [participant] });
          }
        }

        if (['promote', 'demote'].includes(action)) {
          global.groupCache = global.groupCache || new Map();
          global.groupCache.delete(chatId);
          await getMetadata(chatId, conn);
        }
      } catch (error) {
        console.error('Error group-participants.update:', error);
      }
    });
  } catch (error) {
    console.error(chalk.redBright.bold('❌ Error saat menjalankan bot:'), error);
  }
};

console.log(chalk.cyanBright.bold('Create By Dabi\n'));
loadPlug();
startBot();

let file = __filename;
fs.watchFile(file, () => {
  console.log(chalk.yellowBright.inverse.italic(`[ PERUBAHAN TERDETEKSI ] ${__filename}, harap restart bot manual.`));
});