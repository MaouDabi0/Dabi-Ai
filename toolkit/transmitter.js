const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const groupCache = new Map();

async function mtData(id, conn) {
  if (!global.groupCache) global.groupCache = new Map();
  if (global.groupCache.has(id)) return global.groupCache.get(id);

  try {
    const metadata = await conn.groupMetadata(id);
    global.groupCache.set(id, metadata);
    setTimeout(() => global.groupCache.delete(id), 2 * 60 * 1000);
    return metadata;
  } catch (e) {
    console.error('Gagal ambil metadata grup:', e);
    return null;
  }
}

const sessionPath = path.join(__dirname, '../session/AiSesion.json');

function loadSesiAi() {
  if (!fs.existsSync(sessionPath)) return {};
  return JSON.parse(fs.readFileSync(sessionPath));
}

function saveSesiAi(session) {
  fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
}

async function ai(textMessage, message, senderId) {
  const ctx = global.logic;
  const url = `${global.siptzKey}/api/ai/gpt3`;
  const ses = loadSesiAi();

  ses[senderId] ??= [{ role: "system", content: ctx }];
  ses[senderId].push({ role: 'user', content: textMessage });

  const body = JSON.stringify(ses[senderId].filter(v => v.role !== 'assistant'));

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });

    const json = await res.json();
    if (json?.status && json?.data) {
      ses[senderId].push({ role: "assistant", content: json.data });
      saveSesiAi(ses);
      return json.data;
    }
    throw new Error("Invalid response");
  } catch (e) {
    console.error("AI error:", e.message);
    return "Maaf, terjadi kesalahan saat menghubungi AI.";
  }
}

async function gbLink(text) {
  if (!text) return false;
  const regex = /https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{15,20}/i;
  return regex.test(text);
}

async function gcFilter(conn, message, chatId, senderId, isGroup) {
  if (!isGroup) return;

  try {
    const db = readDB();
    const groupData = Object.values(db.Grup).find(g => g.Id === chatId);
    if (!groupData || !groupData.gbFilter) return;

    const metadata = await global.mtData(chatId, conn);
    const isAdmin = metadata?.participants?.find(p => p.id === senderId)?.admin;
    const botRawId = conn.user?.id || '';
    const fromMe = senderId === botRawId || message.key.fromMe;

    if (isAdmin || fromMe) return;

    let textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const msgType = Object.keys(message.message || {})[0];

    const isTagSw = !!message.message?.groupStatusMentionMessage;

    if (isTagSw) textMessage = 'Grup ini disebut dalam status';

    const checks = [
      {
        enabled: groupData.gbFilter?.link?.antilink,
        condition: await gbLink(textMessage),
        reason: 'Link grup terdeteksi',
      },
      {
        enabled: groupData.gbFilter?.stiker?.antistiker,
        condition: msgType === 'stickerMessage',
        reason: 'Stiker terdeteksi',
      },
      {
        enabled: groupData.gbFilter?.antibot === true,
        condition: (() => {
          const context = message.message?.contextInfo || {};
          const fwdScore = context.forwardingScore || 0;
          const isForwardedFromChannel = !!context.externalAdReply || context.forwardedNewsletterMessage != null;
          const isForwarded = fwdScore > 0 || isForwardedFromChannel;
          const hasMenuWords = /menu|owner|allmenu/i.test(textMessage);

          const isDoc = msgType === 'documentMessage';
          return isForwarded || hasMenuWords || isDoc;
        })(),
        reason: 'Deteksi konten mencurigakan',
      },
      {
        enabled: groupData.gbFilter?.antiTagSw === true,
        condition: isTagSw,
        reason: 'Tag status terdeteksi',
      }
    ];

    for (const check of checks) {
      if (check.enabled && check.condition) {
        await conn.sendMessage(chatId, {
          text: `🚫 ${check.reason} dari @${senderId.split('@')[0]}!\nPesan akan dihapus.`,
          mentions: [senderId],
        }, { quoted: message });

        await conn.sendMessage(chatId, { delete: message.key });
        return true;
      }
    }

  } catch (err) {
    console.error('Error GroupFilter:', err);
  }
}

async function tryPrem(nomor) {
  try {
    intDB();
    const db = readDB();
    const u = getUser(db, nomor);
    if (!u) return { success: false, message: 'Pengguna belum terdaftar.', claimable: false };
    const { key, value } = u;
    if (value.claim) return { success: false, message: '⚠️ Sudah pernah claim trial.', claimable: false };

    db.Private[key].isPremium = {
      isPrem: true,
      time: 3 * 24 * 60 * 60 * 1000,
      activatedAt: Date.now()
    };
    db.Private[key].claim = true;
    saveDB(db);

    return { success: true, message: '✅ Trial Premium 3 hari diberikan.', claimable: false };
  } catch (e) {
    console.error('tryPrem error:', e);
    return { success: false, message: 'Terjadi kesalahan.', claimable: false };
  }
}

async function translate(q, tl = 'id') {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&dt=t&tl=${tl}&q=${encodeURIComponent(q)}`);
    const data = await res.json();
    return data[0].map(item => item[0]).join('');
  } catch (err) {
    console.error('Error during translation:', err);
    return null;
  }
}

async function colNumb(input) {
  let number = input.replace(/[^0-9]/g, '');
  number = number.replace(/^0/, '62');
  if (!number.startsWith('62')) number = '62' + number;
  return number;
}

async function bdWord(conn, message, chatId, senderId, isGroup) {
  if (!isGroup) return;

  try {
    const db = readDB();
    const groupData = Object.values(db.Grup || {}).find(g => g.Id === chatId);
    if (!groupData || !groupData.antibadword || !groupData.antibadword.badword) return;

    const metadata = await global.mtData(chatId, conn);
    const isAdmin = metadata?.participants?.find(p => p.id === senderId)?.admin;
    const botRawId = conn.user?.id || '';
    const fromMe = senderId === botRawId || message.key.fromMe;

    if (isAdmin || fromMe) return;

    const badwords = groupData.antibadword.badwordText?.toLowerCase().split(',').map(v => v.trim()).filter(Boolean);
    if (!badwords || badwords.length === 0) return;

    const textMsg = (
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      message.message?.imageMessage?.caption ||
      message.message?.videoMessage?.caption ||
      ''
    ).toLowerCase();

    const detected = badwords.some(word => textMsg.includes(word));
    if (detected) {
      await conn.sendMessage(chatId, {
        text: `⚠️ Pesan dari @${senderId.split('@')[0]} mengandung kata terlarang.\nPesan akan dihapus.`,
        mentions: [senderId]
      }, { quoted: message });

      await conn.sendMessage(chatId, { delete: message.key });
    }
  } catch (err) {
    console.error('Error in bdWord:', err);
  }
}

async function afkCencel(senderId, chatId, message, conn) {
  const db = readDB();
  const senderKey = Object.keys(db.Private).find(key => db.Private[key].Nomor === senderId);
  if (!senderKey || !db.Private[senderKey].afk?.afkTime) return;

  const afkSince = db.Private[senderKey].afk.afkTime;
  const reason = db.Private[senderKey].afk.reason || 'Tidak ada alasan';
  const now = Math.floor(Date.now() / 1000);

  let waktu = Format.duration(afkSince, now);
  if (!waktu) waktu = 'Baru saja';

  db.Private[senderKey].afk = {};
  saveDB(db);

  await conn.sendMessage(chatId, {
    text: `✅ *Kamu telah kembali dari AFK!*\n⏱️ Durasi: ${waktu}\n📌 Alasan sebelumnya: ${reason}`,
    mentions: [senderId]
  }, { quoted: message });
}

async function afkTgR(message, conn) {
  const db = readDB();
  const botNumber = (conn.user?.id || '').split(':')[0] + '@s.whatsapp.net';
  const { remoteJid: chatId, participant, fromMe } = message.key;
  const sender = participant || chatId;

  if (fromMe || sender === botNumber) return;

  const ctx = message.message?.extendedTextMessage?.contextInfo || {};
  const mentions = ctx.mentionedJid || [];
  const quoted = ctx.participant;

  const checkAFK = (jid, tagType) => {
    const data = Object.values(db.Private).find(u => u.Nomor === jid && u.afk?.afkTime);
    if (!data) return;
    const waktu = Format.duration(data.afk.afkTime, Math.floor(Date.now() / 1000)) || 'Baru saja';
    const alasan = data.afk.reason || 'Tidak ada alasan';
    const text = tagType === 'reply'
      ? `*Jangan ganggu dia!*\nOrang yang kamu reply sedang AFK.\n⏱️ Durasi: ${waktu}\n📌 Alasan: ${alasan}`
      : `*Jangan tag dia!*\nOrang yang kamu tag sedang AFK.\n⏱️ Durasi: ${waktu}\n📌 Alasan: ${alasan}`;
    return conn.sendMessage(chatId, { text, mentions: [jid] }, { quoted: message });
  };

  if (quoted && quoted !== botNumber) return checkAFK(quoted, 'reply');

  for (const jid of mentions) {
    if (jid !== botNumber) return checkAFK(jid, 'mention');
  }
}

module.exports = {
  ai,
  mtData,
  gbLink,
  gcFilter,
  tryPrem,
  translate,
  colNumb,
  bdWord,
  afkCencel,
  afkTgR
};