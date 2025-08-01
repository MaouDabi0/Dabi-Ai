/*
 * Create By Dabi
 * © 2025
 */

const globalSetting = require('./toolkit/setting');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const chalk = require('chalk');
const readline = require('readline');
const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { isPrefix } = globalSetting;
const { loadPlug, usrMsg, shopHandle } = require('./toolkit/helper');
const { makeInMemoryStore } = require('./toolkit/store.js')
const Cc = require('./temp/prgM.js');
const { handleGame } = require('./toolkit/funcGame');
const {
  set,
  get,
  delete: del,
  reset,
  timer,
  labvn,
  msgDate
} = require('./toolkit/transmitter.js');

const logger = pino({ level: 'silent' });
const store = makeInMemoryStore();
let conn;

global.plugins = {};
global.categories = {};

intDB();

setInterval(async () => {
  const now = Date.now();
  const db = getDB();

  for (const u of Object.values(db.Private)) {
    const p = u.isPremium;
    if (p?.isPrem && (p.time = Math.max(p.time - 60000, 0)) === 0) p.isPrem = false;
  }

  for (const g of Object.values(db.Grup || {})) {
    const gf = g.gbFilter || {}, id = g.Id;
    for (const [type, mode] of Object.entries({ closeTime: 'announcement', openTime: 'not_announcement' })) {
      const t = gf[type];
      if (t?.active && now >= t.until) {
        try {
          await conn.groupSettingUpdate(id, mode);
          t.active = false;
          delete gf[type];
          await conn.sendMessage(id, {
            text: `✅ Grup telah *di${mode === 'announcement' ? 'tutup' : 'buka'}* secara otomatis.`
          });
        } catch (e) {
          console.error(`❌ Gagal ${mode === 'announcement' ? 'menutup' : 'membuka'} grup: ${id}`, e);
        }
      }
    }
  }

  saveDB();
}, 60000);

const mute = async (chatId, senderId, conn) => {
  const db = getDB();
  const groupData = Object.values(db.Grup).find((g) => g.Id === chatId);

  if (groupData?.mute) {
    const groupMetadata = await conn.groupMetadata(chatId);
    const groupAdmins = groupMetadata.participants.filter((p) => p.admin);
    const isAdmin = groupAdmins.some((admin) => admin.id === senderId);

    if (!isAdmin) return true;
  }

  return false;
};

const Public = (senderId) => {
  if (!global.public) {
    const senderNumber = senderId.replace(/\D/g, '');
    return !global.ownerNumber.includes(senderNumber);
  }
  return false;
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const startBot = async () => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    conn = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      syncFullHistory: false,
      markOnlineOnConnect: false,
      messageCache: 3750,
      logger: logger,
      browser: ['Ubuntu', 'Chrome', '20.0.04'],
    });

    conn.ev.on('creds.update', saveCreds);
    store.bind(conn.ev);

    if (!state.creds?.me?.id) {
      console.log(chalk.blueBright.bold('📱 Masukkan nomor bot WhatsApp Anda:'));
      let phoneNumber = await question('> ');

      phoneNumber = await global.calNumber(phoneNumber);
 
      const code = await conn.requestPairingCode(phoneNumber);
      console.log(chalk.greenBright.bold('🔗 Kode Pairing:'), code?.match(/.{1,4}/g)?.join('-') || code);
    }

    timer(conn);
    if (!conn.reactionCache) conn.reactionCache = new Map();

    conn.ev.on('connection.update', ({ connection }) => {
      const messages = {
        open: () => {
          console.log(chalk.greenBright.bold('✅ Bot online!'));
          global.autoBio && updateBio(conn);
        },
        connecting: () => console.log(chalk.yellowBright.bold('🔄 Menghubungkan kembali...')),
        close: () => {
          console.log(chalk.redBright.bold('❌ Koneksi terputus, mencoba menyambung ulang...'));
          startBot();
        }
      };
      messages[connection]?.();
    });

    conn.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages?.[0];
      if (!msg?.message) return;

      const { textMessage, mediaInfo } = msgDate(msg);
      if (!textMessage && !mediaInfo) return;

      const msgType = msg.message;
      const msgId = msg.key?.id;
      if (msgType?.conversation || msgType?.extendedTextMessage || msgType?.imageMessage || msgType?.videoMessage) {
        conn.reactionCache.set(msgId, msg);
        setTimeout(() => conn.reactionCache.delete(msgId), 180000);
      }

      const { chatId, isGroup, senderId, pushName } = exCht(msg);
      const time = Format.time();
      const senderNumber = senderId?.split('@')[0];
      if (!senderNumber) return console.error(chalk.redBright.bold('Gagal mendapatkan nomor pengirim.'));

      const db = getDB();
      const userDb = Object.values(db?.Private || {}).find(u => u.Nomor === senderId) || {};
      const isPrem = userDb.isPremium?.isPrem;

      let displayName = pushName || 'Pengguna';
      if (isGroup && chatId.endsWith('@g.us')) {
        const meta = await mtData(chatId, conn);
        displayName = meta ? `${meta.subject} | ${displayName}` : `Grup Tidak Dikenal | ${displayName}`;
      } else if (chatId === 'status@broadcast') {
        displayName += ' | Status';
      }

      console.log(chalk.yellowBright.bold(`【 ${displayName} 】:`) + chalk.cyanBright.bold(` [ ${time} ]`));
      if (mediaInfo && textMessage)
        console.log(chalk.whiteBright.bold(`  [ ${mediaInfo} ] | [ ${textMessage} ]`));
      else if (mediaInfo)
        console.log(chalk.whiteBright.bold(`  [ ${mediaInfo} ]`));
      else if (textMessage)
        console.log(chalk.whiteBright.bold(`  [ ${textMessage} ]`));

      await labvn(textMessage, msg, conn, chatId);
      await Cc(conn, msg, textMessage);

      if (
        await gcFilter(conn, msg, chatId, senderId, isGroup) ||
        await bdWrd(conn, msg, chatId, senderId, isGroup) ||
        await mute(chatId, senderId, conn) ||
        Public(senderId)
      ) return;

      if (msg.message.reactionMessage) await rctKey(msg, conn);

      const { ownerSetting } = setting;
      global.lastGreet ??= {};
      const last = global.lastGreet[senderId] || 0;
      if (
        isGroup &&
        ownerSetting.forOwner &&
        ownerSetting.ownerNumber.includes(senderNumber) &&
        Date.now() - last > 300000
      ) {
        global.lastGreet[senderId] = Date.now();
        await conn.sendMessage(chatId, {
          text: setting?.msg?.rejectMsg?.forOwnerText || "Selamat datang owner ku",
          mentions: [senderId]
        }, { quoted: msg });
      }

      if ((isGroup && global.readGroup) || (!isGroup && global.readPrivate)) {
        await conn.readMessages([msg.key]);
      }

      if (global.autoTyping) {
        await conn.sendPresenceUpdate("composing", chatId);
        setTimeout(() => conn.sendPresenceUpdate("paused", chatId), 3000);
      }

      await afkCencel(senderId, chatId, msg, conn);
      await afkTgR(msg, conn);
      await shopHandle(conn, msg, textMessage, chatId, senderId);
      const isGame = await handleGame(conn, msg, chatId, textMessage);

      if (await global.chtEmt(textMessage, msg, senderId, chatId, conn)) return;

      if (!isPrem) {
        const mode = global.setting?.botSetting?.Mode || 'private';
        if ((mode === 'group' && !isGroup) || (mode === 'private' && isGroup)) return;
      }

      const parsedPrefix = parseMessage(msg, isPrefix);
      const parsedNoPrefix = parseNoPrefix(msg);
      if (!parsedPrefix && !parsedNoPrefix) return;

      const runPlugin = async (parsed, prefixUsed) => {
        const { commandText, chatInfo } = parsed;
        const sender = chatInfo.senderId;

        for (const [fileName, plugin] of Object.entries(global.plugins)) {
          if (!plugin?.command?.includes(commandText)) continue;

          const userData = getUser(getDB(), senderId);
          const pluginPrefix = plugin.prefix;
          const allowRun =
            pluginPrefix === 'both' ||
            (pluginPrefix === false && !prefixUsed) ||
            ((pluginPrefix === true || pluginPrefix === undefined) && prefixUsed);

          if (!allowRun) continue;
          if (prefixUsed && !userData && !plugin.whiteLiss) {
            await conn.sendMessage(chatInfo.chatId, {
              text: '❌ Kamu belum terdaftar.\nKetik *.daftar* untuk mendaftar.'
            }, { quoted: msg });
            return;
          }

          try {
            await plugin.run(conn, msg, { ...parsed, isPrefix, store });
            if (userData) {
              const db = getDB();
              db.Private[userData.key].cmd = (db.Private[userData.key].cmd || 0) + 1;
              saveDB(db);
            }
          } catch (err) {
            console.log(chalk.redBright.bold(`❌ Error pada plugin: ${fileName}\n${err.message}`));
          }
          break;
        }
      };

      if (parsedPrefix) await runPlugin(parsedPrefix, true);
      if (parsedNoPrefix) await runPlugin(parsedNoPrefix, false);
    });

    conn.ev.on('group-participants.update', async (event) => {
      const { id: chatId, participants, action } = event;

      try {
        const isWelcome = enGcW(chatId) && action === 'add';
        const isLeave = enGcL(chatId) && (action === 'remove' || action === 'leave');

        let textTemplate = '';
        if (isWelcome) textTemplate = getWlcTxt(chatId);
        if (isLeave) textTemplate = getLftTxt(chatId);

        if (isWelcome || isLeave) {
          for (const participant of participants) {
            const userTag = `@${participant.split('@')[0]}`;
            const text = textTemplate.replace(/@user|%user/g, userTag);

            await conn.sendMessage(chatId, {
              text,
              mentions: [participant],
            });
          }
        }

        if (['promote', 'demote'].includes(action)) {
          global.groupCache = global.groupCache || new Map();
          global.groupCache.delete(chatId);
          await mtData(chatId, conn);
        }
      } catch (error) {
        console.error(chalk.redBright.bold('❌ Error saat menangani group-participants.update:'), error);
      }
    });
  } catch (error) {
    console.error(chalk.redBright.bold('❌ Error saat menjalankan bot:'), error);
  }
};

console.log(chalk.cyanBright.bold('Create By Dabi\n'));
loadPlug();
startBot();
watchCfg();

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  console.log(chalk.yellowBright.inverse.italic(`[ PERUBAHAN TERDETEKSI ] ${__filename}, harap restart bot manual.`));
});