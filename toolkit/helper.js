import fs from "fs";
import path from "path";
import moment from "moment-timezone";
import { exec } from "child_process";
import axios from "axios";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const plugDir = path.join(__dirname, "../plugins");
const dbDir = path.join(__dirname, "./db");
const dbFile = path.join(dbDir, "database.json");

const loadPlug = async () => {
  if (!fs.existsSync(plugDir)) return;

  let ok = 0, fail = 0;
  const logs = [];

  global.plugins = {};
  global.categories = {};

  for (const folder of fs.readdirSync(plugDir)) {
    const fPath = path.join(plugDir, folder);
    if (!fs.statSync(fPath).isDirectory()) continue;

    for (const file of fs.readdirSync(fPath).filter(f => f.endsWith(".js"))) {
      const fullPath = path.join(fPath, file);

      try {
        const plug = (await import(`${fullPath}?update=${Date.now()}`)).default;

        if (plug?.run) {
          const name = path.basename(file, ".js");
          plug.__path = fullPath;
          global.plugins[name] = plug;

          const tag = plug.tags || "Uncategorized";
          global.categories[tag] ??= [];
          global.categories[tag].push(plug.command);

          ok++;
        }
      } catch (e) {
        fail++;
        logs.push(`❌ ${file}: ${e.message}`);
      }
    }
  }

  if (!fail) {
    console.log(chalk.greenBright.bold(`✅ ${ok} plugin dimuat.`));
  } else {
    logs.forEach(msg => console.log(chalk.redBright.bold(msg)));
    console.log(chalk.yellowBright.bold(`⚠️ ${ok} plugin dimuat, ${fail} gagal.`));
  }

  return { ok, fail, logs };
};

let db = { Private: {}, Grup: {} };

const initDB = () => {
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
  } else {
    try {
      const raw = fs.readFileSync(dbFile, "utf-8");
      db = raw ? JSON.parse(raw) : db;
    } catch (e) {
      console.error("[DB] Gagal membaca file:", e);
    }
  }
};

const getDB = () => db;

const saveDB = () => {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error("[DB] Gagal simpan:", e);
  }
};

const getUser = (id) => {
  const db = getDB();
  const { Private } = db;
  if (!Private) return null;
  const key = Object.keys(Private).find(k => Private[k]?.Nomor === id);
  return key ? { key, data: Private[key] } : null;
};

const getGc = (db, chatId) => db?.Grup && Object.values(db.Grup).find(g => String(g?.Id) === String(chatId)) || null;

const enWelcome = id => getGc(db, id)?.gbFilter?.Welcome?.welcome === true;
const getWelTxt = id => getGc(db, id)?.gbFilter?.Welcome?.welcomeText?.trim() || "👋 Selamat datang @user di grup!";
const enLeft = id => getGc(db, id)?.gbFilter?.Left?.gcLeft === true;
const getLeftTxt = id => getGc(db, id)?.gbFilter?.Left?.leftText?.trim() || "👋 Selamat tinggal @user!";

const ensureGc = (id) => {
  db.Grup[id] ??= { id, gbFilter: {} };
  return db.Grup[id];
};

const setWelcome = (id, on, txt) => {
  const gc = ensureGc(id);
  gc.gbFilter.Welcome = { ...(gc.gbFilter.Welcome || {}), welcome: on };
  if (txt) gc.gbFilter.Welcome.welcomeText = txt;
  saveDB();
};

const setLeft = (id, on, txt) => {
  const gc = ensureGc(id);
  gc.gbFilter.Left = { ...(gc.gbFilter.Left || {}), gcLeft: on };
  if (txt) gc.gbFilter.Left.leftText = txt;
  saveDB();
};

const exGrup = async (conn, chatId, senderId) => {
  const meta = await getMetadata(chatId, conn);
  if (!meta) return {};

  const admins = (meta.participants || []).filter(p => p.admin).map(p => p.phoneNumber);
  const botId = `${conn.user?.id?.split(":")[0]}@s.whatsapp.net`;

  return {
    meta,
    groupName: meta.subject,
    botId,
    botAdmin: admins.includes(botId),
    userAdmin: admins.includes(senderId),
    admins
  };
};

const Format = {
  time: () => moment().format("HH:mm"),
  realTime: () => moment().tz("Asia/Jakarta").format("HH:mm:ss DD-MM-YYYY"),
  date: ts => moment(ts * 1000).format("DD-MM-YYYY"),
  uptime: () => {
    const s = process.uptime();
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  },
  duration: (s, e) => {
    const d = e - s;
    const day = Math.floor(d / 86400000);
    const h = Math.floor((d % 86400000) / 3600000);
    const m = Math.floor((d % 3600000) / 60000);
    return `${day ? day + " Hari " : ""}${h ? h + " Jam " : ""}${m ? m + " Menit" : ""}`.trim();
  },
  toTime: ms => {
    if (!ms || typeof ms !== "number") return "-";
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${d ? d + " Hari " : ""}${h ? h + " Jam " : ""}${m ? m + " Menit " : ""}${s ? s + " Detik" : ""}`.trim();
  },
  parseDur: str => {
    const [, n, u] = /^(\d+)([smhd])$/i.exec(str) || [];
    const map = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return map[u?.toLowerCase()] ? parseInt(n) * map[u.toLowerCase()] : null;
  },
  toNum: n => typeof n === "number" ? n.toLocaleString("id-ID") : "-",
  indoTime: (zone = "Asia/Jakarta", fmt = "HH:mm:ss DD-MM-YYYY") => moment().tz(zone).format(fmt)
};

const target = (msg, sender) => {
  const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
  const clean = jid => jid?.replace(/@s\.whatsapp\.net$/i, "").replace(/\D/g, "");

  if (ctx.quotedMessage && ctx.participant) return clean(ctx.participant);
  if (ctx.mentionedJid?.length) return clean(ctx.mentionedJid[0]);
  if (msg.key?.participant) return clean(msg.key.participant);

  return clean(sender);
};

const getSender = (msg) => {
  const chatId = msg?.key?.remoteJid;
  const isGc = chatId?.endsWith("@g.us");
  const senderId = isGc ? msg.key.participant : chatId;
  return { chatId, senderId };
};

const isOwner = async (plugin, conn, msg) => {
  try {
    if (plugin.owner) {
      const { chatId, senderId } = getSender(msg);
      const num = senderId.replace(/\D/g, "");

      if (!global.ownerNumber.includes(num)) {
        await conn.sendMessage(chatId, { text: owner }, { quoted: msg });
        return false;
      }
    }
    return true;
  } catch (err) {
    return false;
  }
};

const isPrem = async (plugin, conn, msg) => {
  if (plugin.premium) {
    const { chatId, senderId } = getSender(msg);
    const usr = global.getUserData(senderId);
    if (!usr?.isPremium?.isPrem) {
      await conn.sendMessage(chatId, {
        text: prem,
        contextInfo: {
          externalAdReply: {
            title: "Stop",
            body: "Hanya Untuk Pengguna Premium",
            thumbnailUrl: "https://c.termai.cc/i56/Fg50KYE.jpg",
            mediaType: 1,
            renderLargerThumbnail: true,
          },
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: { newsletterJid: idCh }
        }
      }, { quoted: msg });
      return false;
    }
  }
  return true;
};

const updateBio = async conn => {
  clearInterval(global.bioInterval);

  global.bioInterval = setInterval(async () => {
    if (!global.autoBio) return clearInterval(global.bioInterval);

    try {
      const bio = global.bioText
        .replace(/<waktu>|<time>/gi, Format.uptime())
        .replace(/<botName>/gi, global.botName);

      await conn.updateProfileStatus(bio);
    } catch (err) {
      console.error(chalk.redBright.bold('❌ Bio gagal diperbarui:'), err);
    }
  }, 60_000);
};

const getDBFlag = (userId, chatId, key) => {
  const db = getDB();
  const isPrivate = chatId.endsWith('@s.whatsapp.net');
  const source = isPrivate ? db.Private : db.Grup;

  return Object.values(source || {}).some(entry =>
    (isPrivate ? entry.Nomor === userId : entry.Id === chatId) && entry[key] === true
  );
};

const chtEmt = async (txt, msg, userId, chatId, conn) => {
  const botId   = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';
  const botName = global.botName?.toLowerCase();
  const prefixes = [].concat(global.setting?.isPrefix || '.');

  if (prefixes.some(p => txt?.startsWith(p))) return false;
  if (userId === conn.user?.id || msg.key.fromMe) return false;

  const ctx = msg.message?.extendedTextMessage?.contextInfo ?? {};
  const { mentionedJid = [], participant = '' } = ctx;

  const isReplyBot   = participant === botId;
  const isMentionBot = mentionedJid.includes(botId);

  if (ctx && participant && !isReplyBot && !isMentionBot) return false;

  const ai   = getDBFlag(userId, chatId, 'autoai');
  const bell = getDBFlag(userId, chatId, 'bell');
  if (!ai && !bell) return false;

  const triggered = txt?.toLowerCase().includes(botName) || isReplyBot || isMentionBot;
  if (!triggered) return false;

  if (ai) {
    const res = await global.ai(txt, msg, userId);
    await conn.sendMessage(
      chatId,
      { text: res || 'Maaf, saya tidak mengerti.' },
      { quoted: msg }
    );
  }

  if (bell) {
    const res = await Bella(txt, msg, userId, conn, chatId);
    if (res.cmd === 'voice' && res.audio) {
      await conn.sendMessage(
        chatId,
        { audio: Buffer.from(res.audio), mimetype: 'audio/mpeg', ptt: true },
        { quoted: msg }
      );
    } else if (res.msg) {
      await conn.sendMessage(chatId, { text: res.msg }, { quoted: msg });
    }
  }

  return true;
};

const exCht = (msg = {}) => {
  let chatId = msg?.key?.remoteJid ?? '';
  const isGroup = chatId.endsWith('@g.us');

  let senderId = msg?.key?.fromMe ? chatId : msg?.key?.participant || chatId;
  const pushName = (msg?.pushName || global.botName || 'User').trim();

  chatId = replaceLid(chatId);
  senderId = replaceLid(senderId);

  return { chatId, isGroup, senderId, pushName };
};

const exTxtMsg = msg =>
  msg.body ||
  msg.message?.conversation ||
  msg.message?.extendedTextMessage?.text ||
  msg.message?.imageMessage?.caption ||
  msg.message?.videoMessage?.caption ||
  msg.message?.documentMessage?.fileName ||
  msg.message?.locationMessage?.name ||
  msg.message?.locationMessage?.address ||
  msg.message?.contactMessage?.displayName ||
  msg.message?.pollCreationMessage?.name ||
  msg.message?.reactionMessage?.text ||
  '';

const parseMessage = (msg, prefixes) => {
  const chatInfo = exCht(msg);
  const txt = exTxtMsg(msg);
  if (!txt) return null;

  const prefix = prefixes.find(p => txt.startsWith(p));
  if (!prefix) return null;

  const args = txt.slice(prefix.length).trim().split(/\s+/);
  const commandText = args.shift()?.toLowerCase();

  return { chatInfo, textMessage: txt, prefix, commandText, args };
};

const parseNoPrefix = msg => {
  const chatInfo = exCht(msg);
  const txt = exTxtMsg(msg);
  if (!txt) return null;

  const args = txt.trim().split(/\s+/);
  const commandText = args.shift()?.toLowerCase();

  return { chatInfo, textMessage: txt, prefix: '', commandText, args };
};

const randomId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const randStr = [...Array(7)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  const randNum = Math.floor(Math.random() * 100) + 1;
  return randStr + randNum;
};

const authUser = (msg, chatInfo) => {
  const db = getDB();
  const { senderId, isGroup, chatId } = chatInfo;
  const nama = (msg.pushName || '-').trim().slice(0, 30);

  if (Object.values(db.Private || {}).some(u => u.Nomor === senderId)) return;

  const fromP = msg?.key?.participant || null;
  if (isGroup && fromP && senderId !== fromP) return;
  if (!isGroup && Object.values(db.Private || {}).some(u => u.Nomor === chatId)) return;

  db.Private ??= {};
  let finalName = nama, count = 1;
  while (db.Private[finalName]) finalName = `${nama}_${count++}`;

  db.Private[finalName] = {
    Nomor: senderId,
    noId: randomId(),
    autoai: false,
    bell: false,
    cmd: 0,
    claim: false,
    ban: false,
    money: { amount: 300000 },
    isPremium: { isPrem: false, time: 0 },
    afk: {}
  };

  saveDB();
};

const banned = userId => {
  let user = getUser(userId);

  if (!user) {
    const db = getDB();
    const cleanId = userId.replace(/\D/g, '');
    const found = Object.values(db.Private || {}).find(u => u?.Nomor?.replace(/\D/g, '').endsWith(cleanId));
    if (found) user = { value: found };
  }

  return user?.value?.ban === true;
};

async function shopHandle(conn, msg, txt, chatId, userId) {
  const quoted = msg.message?.extendedTextMessage?.contextInfo;
  if (!quoted || txt?.trim().toLowerCase() !== 'done') return;
  if (!global.ownerNumber.includes(userId.replace(/\D/g, ''))) return;

  const { stanzaId: qId, participant: qUser } = quoted;
  if (!fs.existsSync(dbPath)) return;

  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const orders = dbData.pendingOrders || [];
  const order = orders.find(o => o.userId === qUser && o.idChat === qId);
  if (!order) {
    return conn.sendMessage(chatId, { text: "Transaksi tidak ditemukan." }, { quoted: msg });
  }

  dbData.pendingOrders = orders.filter(o => o.userId !== qUser || o.idChat !== qId);
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));

  const res = `Pembelian dikonfirmasi\n\nUser: @${qUser.split('@')[0]}\nToko: ${order.toko}\nBarang: ${order.barang}\nHarga: Rp${parseInt(order.harga).toLocaleString()}`;
  await conn.sendMessage(chatId, { text: res, mentions: [qUser] }, { quoted: msg });
}

const Sys = {
  loadPlug,
  initDB,
  getDB,
  saveDB,
  getUser,
  getGc,
  enWelcome,
  getWelTxt,
  enLeft,
  getLeftTxt,
  ensureGc,
  setWelcome,
  setLeft,
  exGrup,
  Format,
  target,
  getSender,
  isOwner,
  isPrem,
  updateBio,
  getDBFlag,
  chtEmt,
  exCht,
  parseMessage,
  parseNoPrefix,
  authUser,
  shopHandle,
  banned,
};

export default Sys;