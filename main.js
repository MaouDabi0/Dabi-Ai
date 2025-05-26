/*
 * Create By Dabi
 * © 2025
 */

const settingModule = require('./toolkit/setting');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const chalk = require('chalk');
const readline = require('readline');
const { makeWASocket, useMultiFileAuthState, downloadMediaMessage } = require('@whiskeysockets/baileys');
const { isPrefix } = settingModule;
const { loadPlug } = require('./toolkit/helper');

const logger = pino({ level: 'silent' });

const folderName = 'temp';
fs.mkdir(folderName, (err) => {
  if (!err) console.log(chalk.green.bold('Berhasil membuat folder :', folderName));
});

global.plugins = {};
global.categories = {};

intDB();

let counter = 0;

setInterval(() => {
  const db = readDB();

  Object.keys(db.Private).forEach((key) => {
    const user = db.Private[key];
    if (user.afk && typeof user.afk.afkTime === 'number') {
      if (user.afk.Afk === true) {
        user.afk.afkTime += 1000;
      }
    }
  });

  if (counter % 60 === 0) {
    Object.keys(db.Private).forEach((key) => {
      const user = db.Private[key];
      if (user.isPremium?.isPrem && user.isPremium.time > 0) {
        user.isPremium.time -= 60000;
        if (user.isPremium.time <= 0) {
          user.isPremium.isPrem = false;
          user.isPremium.time = 0;
        }
      }
    });
  }

  saveDB(db);
  counter++;
}, 1000);

const configPath = path.join(__dirname, './toolkit/set/config.json');
fs.watchFile(configPath, () => {
  try {
    delete require.cache[require.resolve(configPath)];
    global.setting = require(configPath);
  } catch (err) {
    console.error(chalk.red('❌ Gagal memuat ulang config.json:'), err);
  }
});

const mute = async (chatId, senderId, conn) => {
  const db = readDB();
  const groupData = Object.values(db.Grup).find((g) => g.Id === chatId);

  if (groupData?.mute) {
    const groupMetadata = await conn.groupMetadata(chatId);
    const groupAdmins = groupMetadata.participants.filter((p) => p.admin);
    const isAdmin = groupAdmins.some((admin) => admin.id === senderId);

    if (!isAdmin) return true;
  }

  return false;
};

const modePublic = (senderId) => {
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
    const conn = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      syncFullHistory: false,
      markOnlineOnConnect: false,
      logger: logger,
      browser: ['Ubuntu', 'Chrome', '20.0.04'],
    });

    if (!state.creds?.me?.id) {
      console.log(chalk.blue('📱 Masukkan nomor bot WhatsApp Anda:'));
      let phoneNumber = await question('> ');

      phoneNumber = await global.calNumber(phoneNumber);

      const code = await conn.requestPairingCode(phoneNumber);
      console.log(chalk.green('🔗 Kode Pairing:'), code?.match(/.{1,4}/g)?.join('-') || code);
    }

    if (!conn.reactionCache) conn.reactionCache = new Map();

    conn.ev.on('connection.update', ({ connection }) => {
      const messages = {
        open: () => {
          console.log(chalk.green.bold('✅ Bot online!'));
          global.autoBio && updateBio(conn);
        },
        connecting: () => console.log(chalk.yellow('🔄 Menghubungkan kembali...')),
        close: () => {
          console.log(chalk.red('❌ Koneksi terputus, mencoba menyambung ulang...'));
          startBot();
        }
      };
      messages[connection]?.();
    });

    conn.ev.on('messages.upsert', async ({ messages }) => {
      if (!messages?.length) return;
      const message = messages[0];
      if (!message?.message) return;

      const msgType = message.message;
      if (
        msgType?.conversation ||
        msgType?.extendedTextMessage ||
        msgType?.imageMessage ||
        msgType?.videoMessage
      ) {
        conn.reactionCache.set(message.key.id, message);
        setTimeout(() => conn.reactionCache.delete(message.key.id), 3 * 60 * 1000);
      }

      const { chatId, isGroup, senderId, pushName } = exCht(message);
      const time = Format.time();
      let displayName = pushName || 'Pengguna';

      if (isGroup && chatId.endsWith('@g.us')) {
        const metadata = await mtData(chatId, conn);
        displayName = metadata ? `${metadata.subject} | ${displayName}` : `Grup Tidak Dikenal | ${displayName}`;
      } else if (chatId === 'status@broadcast') {
        displayName = `${displayName} | Status`;
      }

      let textMessage = '';
      let mediaInfo = '';

      if (message.message.groupStatusMentionMessage) {
        mediaInfo = '[ Status Grup ]';
        textMessage = 'Grup ini disebut dalam status';
      }

      if (message.message.conversation) {
        textMessage = message.message.conversation;
      } else if (message.message.extendedTextMessage?.text) {
        textMessage = message.message.extendedTextMessage.text;
      } else if (message.message.imageMessage?.caption) {
        textMessage = message.message.imageMessage.caption;
      } else if (message.message.videoMessage?.caption) {
        textMessage = message.message.videoMessage.caption;
      } else if (message.message.reactionMessage) {
        const reactedText = message.message.reactionMessage.text;
        textMessage = `Memberi reaksi ${reactedText}`;
      } else if (message.message.protocolMessage?.type === 14) {
        textMessage = `Pesan Diedit ${textMessage}`;
      } else if (message.message.protocolMessage?.type === 0) {
        textMessage = 'Pesan Dihapus';
      } else if (message.message.ephemeralMessage?.message?.conversation) {
        textMessage = message.message.ephemeralMessage.message.conversation;
      } else if (message.message.ephemeralMessage?.message?.extendedTextMessage?.text) {
        textMessage = message.message.ephemeralMessage.message.extendedTextMessage.text;
      }

      const mediaTypes = {
        imageMessage: '[ Gambar ]',
        videoMessage: '[ Video ]',
        audioMessage: '[ Audio ]',
        documentMessage: '[ Dokumen ]',
        stickerMessage: '[ Stiker ]',
        locationMessage: '[ Lokasi ]',
        contactMessage: '[ Kontak ]',
        pollCreationMessage: '[ Polling ]',
        liveLocationMessage: '[ Lokasi Live ]',
        reactionMessage: '[ Reaksi ]',
        protocolMessage: '[ Sistem ]',
        ephemeralMessage: '[ Sekali Lihat ]'
      };

      for (const [key, value] of Object.entries(mediaTypes)) {
        if (message.message[key]) mediaInfo = value;
        if (key === 'ephemeralMessage' && message.message.ephemeralMessage?.message) {
          const nestedKey = Object.keys(message.message.ephemeralMessage.message)[0];
          if (nestedKey && mediaTypes[nestedKey]) mediaInfo = mediaTypes[nestedKey];
        }
      }

      console.log(chalk.yellow.bold(`【 ${displayName} 】:`) + chalk.cyan.bold(` [ ${time} ]`));
      if (mediaInfo && textMessage) console.log(chalk.white(`  ${mediaInfo} | [ ${textMessage} ]`));
      else if (mediaInfo) console.log(chalk.white(`  ${mediaInfo}`));
      else if (textMessage) console.log(chalk.white(`  [ ${textMessage} ]`));

      if (global.setting?.botSetting?.Mode === 'group' && !isGroup) return;
      if (global.setting?.botSetting?.Mode === 'private' && isGroup) return;

      const flter = await gcFilter(conn, message, chatId, senderId, isGroup);
      if (flter) return;

      const bd = await bdWrd(conn, message, chatId, senderId, isGroup);
      if(bd) return;

      const { ownerSetting } = setting;
      global.lastGreet = global.lastGreet || {};
      const senderNumber = senderId?.split('@')[0];
      if (!senderNumber) {
        console.error('Gagal mendapatkan nomor pengirim.');
        return;
      }

      if (
        chatId.endsWith('@g.us') &&
        ownerSetting.forOwner &&
        ownerSetting.ownerNumber.includes(senderNumber) &&
        Date.now() - (global.lastGreet[senderId] || 0) > 5 * 60 * 1000
      ) {
        global.lastGreet[senderId] = Date.now();
        const greetText = setting?.msg?.rejectMsg?.forOwnerText || "Selamat datang owner ku";

        await conn.sendMessage(chatId, {
          text: greetText,
          mentions: [senderId]
        }, { quoted: message });
      }

      if (await mute(chatId, senderId, conn)) return;
      if (modePublic(senderId)) return;

      if (message.message.reactionMessage) {
        await rctKey(message, conn);
      }

      if ((isGroup && global.readGroup) || (!isGroup && global.readPrivate)) {
        await conn.readMessages([message.key]);
      }

      if ((isGroup && global.autoTyping) || (!isGroup && global.autoTyping)) {
        await conn.sendPresenceUpdate("composing", chatId);
        setTimeout(async () => await conn.sendPresenceUpdate("paused", chatId), 3000);
      }

      await afkCencel(senderId, chatId, message, conn);

      if (await global.chtEmt(textMessage, message, senderId, chatId, conn)) return;

      const parsedPrefix = parseMessage(message, isPrefix);
      const parsedNoPrefix = parseNoPrefix(message);

      if (!parsedPrefix && !parsedNoPrefix) return;

      const runPlugin = async (parsed, prefixUsed) => {
        const { commandText, chatInfo } = parsed;
        const sender = chatInfo.senderId;
      
        for (const [file, plugin] of Object.entries(global.plugins)) {
          if (!plugin?.command?.includes(commandText)) continue;

          const exPrx = plugin.prefix;
          const allowRun =
            exPrx === 'both' ||
            (exPrx === false && !prefixUsed) ||
            ((exPrx === true || exPrx === undefined) && prefixUsed);

          if (!allowRun) continue;

          try {
            await plugin.run(conn, message, { ...parsed, isPrefix });

            const db = readDB();
            const user = getUser(db, sender);

            if (user) {
              db.Private[user.key].cmd = (db.Private[user.key].cmd || 0) + 1;
              saveDB(db);
            }

          } catch (err) {
            console.log(chalk.red(`❌ Error pada plugin: ${file}\n${err.message}`));
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
        if (enGcW(chatId) && action === 'add') {
          const welcomeText = getWlcTxt(chatId);

          for (const participant of participants) {
            const userTag = `@${participant.split('@')[0]}`;
            const text = welcomeText
              .replace(/@user/g, userTag)
              .replace(/%user/g, userTag);

            await conn.sendMessage(chatId, {
              text,
              mentions: [participant]
            });
          }
        }

        if (enGcL(chatId) && (action === 'remove' || action === 'leave')) {
          const leftText = getLftTxt(chatId);

          for (const participant of participants) {
            const userTag = `@${participant.split('@')[0]}`;
            const text = leftText
              .replace(/@user/g, userTag)
              .replace(/%user/g, userTag);

            await conn.sendMessage(chatId, {
              text,
              mentions: [participant]
            });
          }
        }
      } catch (error) {
        console.error('❌ Error saat kirim pesan masuk/keluar grup:', error);
      }
    });

    conn.ev.on('creds.update', saveCreds);

      } catch (error) {
        console.error(chalk.red('❌ Error saat menjalankan bot:'), error);
      }
    };

console.log(chalk.cyan.bold('Create By Dabi\n'));
loadPlug();
startBot();

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  console.log(chalk.yellow(`[PERUBAHAN TERDETEKSI] ${__filename}, harap restart bot manual.`));
});