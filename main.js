/*  
 * Create By Dabi  
 * © 2025  
 */

import fs from "fs";
import path from "path";
import pino from "pino";
import chalk from "chalk";
import { Boom } from "@hapi/boom";
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import { fileURLToPath } from "url";

import stg from "./toolkit/setting.js";
import makeInMemoryStore from "./toolkit/store.js";
import Cc from "./session/setCfg.js";
import { cekSholat } from "./toolkit/pengingat.js";
import emtData from "./toolkit/transmitter.js";
import { evConnect, handleSessionIssue } from './toolkit/connect.js'

const { reset, timer, labvn, saveLidCache, messageContent, checkSpam } = emtData,
      { isPrefix } = stg;

const logger = pino({ level: "silent" }),
      store = makeInMemoryStore();

let conn;

global.plugins = {};
global.categories = {};
global.lidCache = {};
global.initDB();

setInterval(async () => {
  const now = Date.now(),
        db = getDB();

  for (const u of Object.values(db.Private)) {
    const prem = u.isPremium;
    if (prem?.isPrem && (prem.time = Math.max(prem.time - 6e4, 0)) === 0)
      prem.isPrem = !1;
  }

  for (const g of Object.values(db.Grup || {})) {
    const gf = g.gbFilter || {};
    for (const [type, mode] of Object.entries({
      close: "announcement",
      open: "not_announcement"
    })) {
      const t = gf[type];
      if (t?.active && now >= t.until) {
        try {
          await conn.groupSettingUpdate(g.Id, mode);
          delete gf[type];
          await conn.sendMessage(g.Id, {
            text: `Grup telah *di${mode === "announcement" ? "tutup" : "buka"}* otomatis.`
          });
        } catch (err) {
          console.error(`error update setting:`, err);
        }
      }
    }
  }

  saveDB();

  global.lastBackup = global.lastBackup || 0
  const diff = now - global.lastBackup

  if (global.autoBackup) {
    if (diff >= 144e5) try {
      const { default: backup } = await import(`./plugins/owner/backup.js?update=${Date.now()}`),
            owners = (Array.isArray(global.ownerNumber) ? global.ownerNumber : [global.ownerNumber])
              .map(n => n.replace(/\D/g, "") + "@s.whatsapp.net")
      await backup.run(conn, {}, { chatInfo: { chatId: owners[0] } })
      global.lastBackup = now
    } catch (err) {}
  }
}, 6e4);

const xp = async (conn, msg, chatId, senderId, isGroup) => {
  const groupData = getGc(chatId)
  if (groupData?.mute) {
    const meta = await conn.groupMetadata(chatId),
          isAdmin = meta.participants.some(p => p.admin && p.id === senderId)
    return !1
  }
  if (!global.public) {
    const senderNumber = (senderId || "").replace(/\D/g, "")
    if (!global.ownerNumber.includes(senderNumber)) return !0
  }
  return !1
}

const startBot = async () => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("./session");
    conn = makeWASocket({
      auth: state,
      version: [2e0, 3e3, 1.025150051e9],
      printQRInTerminal: !1,
      syncFullHistory: !1,
      markOnlineOnConnect: !1,
      messageCache: 3.75e3,
      logger,
      browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    conn.ev.on("creds.update", saveCreds);
    store.bind(conn.ev);

    if (!state.creds?.me?.id) {
      try {
        await new Promise(r => setTimeout(r, 10))
    
        console.log(chalk.blueBright.bold('Masukkan Nomor:'));
        const num = await q('> '),
              code = await conn.requestPairingCode(await normalizeNumber(num)),
              show = (code || '').match(/.{1,4}/g)?.join('-') || ''

        console.log(chalk.greenBright.bold('Pairing Code:'), chalk.cyanBright.bold(show))
      } catch (e) {
        if (e?.output?.statusCode === 428 || /Connection Closed/i.test(e?.message || ''))
          return handleSessionIssue('Pairing timeout', startBot)
        throw e
      }
    }

    conn.reactionCache ??= new Map();
    rl.close();
    evConnect(conn, startBot);

    conn.ev.on("messages.upsert", async ({ messages }) => {
      const msg = messages?.[0]
      if (!msg?.message) return

      const { chatId, isGroup, senderId, pushName } = exCht(msg)

      let groupMeta = null
      if (isGroup) {
        groupMeta = await getMetadata(chatId, conn)
        if (groupMeta) await saveLidCache(groupMeta)
      }

      replaceLid(msg)

      const { textMessage, mediaInfo } = messageContent(msg)
      if (!textMessage && !mediaInfo) return

      const msgId = msg.key?.id
      if (["conversation", "extendedTextMessage", "imageMessage", "videoMessage"].some(t => msg.message?.[t])) {
        conn.reactionCache.set(msgId, msg)
        setTimeout(() => conn.reactionCache.delete(msgId), 1.8e5)
      }

      const time = Format.indoTime("Asia/Jakarta", "HH:mm"),
            senderNumber = senderId?.split("@")[0]
      if (!senderNumber) return console.error(chalk.redBright.bold("gagal mendapatkan nomor pengirim", senderNumber))

      const userDb = getUser(senderId),
            isPrem = userDb?.value?.isPremium?.isPrem || !1

      let displayName = pushName || "Pengguna"
      if (isGroup) {
        displayName = groupMeta
          ? `${groupMeta.subject} | ${displayName}`
          : `Grup Tidak Dikenal | ${displayName}`
      }

      console.log(chalk.yellowBright.bold(`【 ${displayName} 】:`) + chalk.cyanBright.bold(` [ ${time} ]`))
      const infoLog = [mediaInfo, textMessage].filter(Boolean).join(" | ")
      if (infoLog) console.log(chalk.whiteBright.bold(`  [ ${infoLog} ]`))

      if (banned(senderId)) return console.log(`⚠️ User ${senderId} dibanned`)

      const parallel = (...tasks) => Promise.all(tasks.map(t => t()))

      await parallel(
        () => cekSholat(conn, msg, { chatId }),
        () => labvn(textMessage, msg, conn, chatId),
        () => Cc(conn, msg, textMessage)
      )

      for (const f of [groupFilter, badwordFilter, xp])
        if (await f(conn, msg, chatId, senderId, isGroup)) return

      if (msg.message.reactionMessage) await rctKey(msg, conn)

      const { ownerSetting } = setting
      global.lastGreet ??= {}

      if (
        isGroup &&
        ownerSetting.forOwner &&
        ownerSetting.ownerNumber.includes(senderNumber) &&
        Date.now() - (global.lastGreet[senderId] || 0) > 3e5
      ) {
        global.lastGreet[senderId] = Date.now()
        await conn.sendMessage(
          chatId,
          { text: setting?.msg?.rejectMsg?.forOwnerText || "Selamat datang owner ku", mentions: [senderId] },
          { quoted: msg }
        )
      }

      if ((isGroup && global.readGroup) || (!isGroup && global.readPrivate)) {
        await conn.readMessages([msg.key])
      }

      if (global.autoTyping) {
        await conn.sendPresenceUpdate("composing", chatId)
        setTimeout(() => conn.sendPresenceUpdate("paused", chatId), 3e3)
      }

      await parallel(
        () => cancelAfk(senderId, chatId, msg, conn),
        () => afkTag(msg, conn),
        () => shopHandle(conn, msg, textMessage, chatId, senderId),
        () => handleGame(conn, msg, chatId, textMessage)
      )

      if (await global.chtEmt(textMessage, msg, senderId, chatId, conn)) return

      if (!isPrem) {
        const mode = global.setting?.botSetting?.Mode || "private"
        if ((mode === "group" && !isGroup) || (mode === "private" && isGroup)) return
      }

      const runPlugin = async (parsed, prefixUsed) => {
        const { commandText, chatInfo } = parsed
        for (const [fileName, plugin] of Object.entries(global.plugins)) {
          if (!plugin?.command?.includes(commandText)) continue
          if (prefixUsed) {
            authUser(msg, chatInfo)
            if (await checkSpam(chatInfo.senderId, conn, chatInfo.chatId)) return
          }
          const userData = getUser(chatInfo.senderId)
          if (
            (plugin.premium && !(await global.isPrem(plugin, conn, msg))) ||
            (plugin.owner && !(await global.isOwner(plugin, conn, msg)))
          ) continue
          const allowRun =
            plugin.prefix === "both" ||
            (plugin.prefix === !1 && !prefixUsed) ||
            ((plugin.prefix !== "both" && plugin.prefix !== !1) && prefixUsed)
          if (!allowRun) continue
          try {
            await plugin.run(conn, msg, { ...parsed, isPrefix, store })
            if (userData) {
              userData.data.cmd = (userData.data.cmd || 0) + 1
              saveDB(getDB())
            }
          } catch (err) {
            console.log(chalk.redBright.bold(`❌ Error plugin: ${fileName}\n${err.stack}`))
          }
          break
        }
      }

      for (const [parsed, prefixUsed] of [
        [parseMessage(msg, isPrefix), !0],
        [parseNoPrefix(msg), !1]
      ]) {
        if (parsed) await runPlugin(parsed, prefixUsed)
      }
    })

    conn.ev.on('group-participants.update', async ({ id: chatId, participants, action }) => {
      try {
        const w = enWelcome(chatId) && action === 'add',
              l = enLeft(chatId) && ['remove','leave'].includes(action)
        if (!w && !l || !Array.isArray(participants)) return
    
        const { text, media } = w ? getWelTxt(chatId) : getLeftTxt(chatId)
    
        for (const p of participants) {
          const jid = typeof p === 'string' ? p : (p?.phoneNumber || p?.id || p?.participant || p?.jid || '')
          if (!jid) continue
    
          const t = `@${jid.split('@')[0]}`,
                finalText = text.replace(/@user|%user/g, t).replace(/%time/g, Format.time())
    
          if (media) {
            const pth = `./temp/${media}`,
                  ext = path.extname(media).toLowerCase(),
                  type = ext === '.mp4' || ext === '.gif' ? 'video'
                       : ext === '.mp3' || ext === '.aac' || ext === '.ogg' ? 'audio'
                       : 'image'
    
            if (fs.existsSync(pth)) {
              if (type === 'audio') {
                const buffer = fs.readFileSync(pth)
                await vn(conn, chatId, buffer, null)
              } else {
                await conn.sendMessage(chatId, { [type]: { url: pth }, caption: finalText, mentions: [jid] })
              }
            } else {
              await conn.sendMessage(chatId, { text: finalText, mentions: [jid] })
            }
          } else {
            await conn.sendMessage(chatId, { text: finalText, mentions: [jid] })
          }
        }
    
        ['promote','demote'].includes(action) && (global.groupCache = global.groupCache || new Map(), global.groupCache.delete(chatId), await getMetadata(chatId, conn))
      } catch (e) {
        console.log('Error welcome/left:', e)
      }
    })
  } catch (error) {
    console.error(chalk.redBright.bold('❌ Error saat menjalankan bot:'), error);
  }
};

console.log(chalk.cyanBright.bold('Create By Dabi\n'));
loadPlug();
startBot();

let file = filename;
fs.watchFile(file, () => {
  console.log(chalk.yellowBright.inverse.italic(`[ PERUBAHAN TERDETEKSI ] ${filename}, harap restart bot manual.`));
});