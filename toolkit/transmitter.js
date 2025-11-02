import fs from "fs";
import path from "path";
import vm from "vm";
import chalk from "chalk";
import fetch from "node-fetch";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import { generateWAMessageContent, getContentType } from '@whiskeysockets/baileys'
import { convertToOpus, generateWaveform } from './ffmpeg.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const memoryCache = {},
      groupCache = new Map();

const sesiBell = path.join(__dirname, "../temp/BellaSession.json"),
      sesiAi = path.join(__dirname, "../temp/AiSesion.json");

const loadSession = async (file) => {
  try {
    const data = await fs.promises.readFile(file, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
};

const saveSession = async (file, session) => {
  try {
    await fs.promises.writeFile(file, JSON.stringify(session, null, 2));
  } catch (err) {
    console.error(chalk.red(`Gagal menyimpan session: ${err.message}`));
  }
};

const fetchJSON = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

const fetchBuffer = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
};

function replaceLid(obj, visited = new WeakSet()) {
  if (!obj) return obj
  if (typeof obj === 'object') {
    if (visited.has(obj)) return obj
    visited.add(obj)
    if (Array.isArray(obj)) return obj.map(i => replaceLid(i, visited))
    if (Buffer.isBuffer(obj) || obj instanceof Uint8Array) return obj
    for (const k in obj) obj[k] = replaceLid(obj[k], visited)
    return obj
  }

  if (typeof obj === 'string') {
    if (/@lid$/.test(obj)) {
      const phone = Object.entries(global.lidCache ?? {}).find(([, v]) => v === obj)?.[0]
      if (phone) return `${phone}@s.whatsapp.net`
    }

    return obj
      .replace(/@(\d+)@lid/g, (_, id) => {
        const phone = Object.entries(global.lidCache ?? {}).find(([, v]) => v === `${id}@lid`)?.[0]
        return phone ? `@${phone}` : `@${id}@lid`
      })
      .replace(/@(\d+)(?!@)/g, (m, lid) => {
        const phone = Object.entries(global.lidCache ?? {}).find(([, v]) => v === `${lid}@lid`)?.[0]
        return phone ? `@${phone}` : m
      })
  }

  return obj
}

async function vn(conn, chatId, audioBuffer, msg = null) {
  try {
    const buff = await convertToOpus(audioBuffer),
          config = { audio: buff, mimetype: 'audio/ogg; codecs=opus', ptt: !0 },
          messageContent = await generateWAMessageContent(config, { upload: conn.waUploadToServer }),
          type = getContentType(messageContent)

    if (msg) messageContent[type].contextInfo = {
      stanzaId: msg.key.id,
      participant: msg.key.participant || msg.key.remoteJid,
      quotedMessage: msg.message
    }

    messageContent[type].waveform = await generateWaveform(buff)
    return await conn.relayMessage(chatId, messageContent, {})
  } catch (err) {
    console.log('error pasa vn', err)
    throw err
  }
}

async function bell(body) {
  try {
    return await fetchJSON(`${termaiWeb}/api/chat/logic-bell?key=${termaiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (e) {
    console.error(chalk.red("Request Error:"), e.message);
    return { status: false, msg: "Request gagal terkirim." };
  }
}

async function Elevenlabs(text, voice = "dabi", pitch = 0, speed = 0.9) {
  try {
    return await fetchBuffer(
      `${termaiWeb}/api/text2speech/elevenlabs?text=${encodeURIComponent(text)}&voice=${voice}&pitch=${pitch}&speed=${speed}&key=${termaiKey}`
    )
  } catch (e) {
    console.error("Fetch error:", e.message)
    return null
  }
}

async function Bella(text, msg, senderId, conn, chatId) {
  const s = await loadSession(sesiBell),
        r = await bell({
          text,
          id: senderId,
          fullainame: botFullName,
          nickainame: botName,
          senderName: msg.pushName ?? "Unknown",
          ownerName,
          date: new Date().toISOString(),
          role: "Sahabat Deket",
          msgtype: "text",
          custom_profile: logic,
          commands: [
            {
              description: 'Jika perlu direspon dengan suara',
              output: {
                cmd: 'voice',
                msg: `Pesan di sini. Gunakan gaya bicara <nickainame> yang menarik dan realistis, lengkap dengan tanda baca yang tepat agar terdengar hidup saat diucapkan.`
              }
            },
            {
              description: 'Jika pesan adalah permintaan untuk menampilkan menu (maka jawab lah dengan mengatakan ini menu nya!)',
              output: { 
                cmd: 'menu'
              }
            },
            {
              description: 'Jika pesan adalah perintah untuk membuka/menutup group',
              output: {
                cmd: ['opengroup', 'closegroup']
              }
            },
            {
              description: 'Jika pesan adalah permintaan untuk membuat stiker atau mengubah sebuah gambar menjadi stiker. (Abaikan isi konten pada gambar!)',
              output: {
                cmd: 'stiker'
              }
            },
            {
              description: 'Jika pesan adalah permintaan untuk membuat stiker to image atau mengubah sebuah sticker menjadi gambar. (Abaikan isi konten pada sticker!)',
              output: {
                cmd: 'toimg'
              }
            },
            {
              description: 'Jika pesan adalah permintaan untuk mengecek api, maka respon dengan cmd: cekkey!',
              output: {
                cmd: 'cekkey'
              }
            },
            {
              description: 'Jika pesan adalah permintaan untuk mengedit image atau gambar, maka respon dengan cmd: i2i dan hanya untuk cmd ini msg: permintaan dari pengguna.',
              output: {
                cmd: 'i2i',
                msg: `Pesan di sini tambahkan detail untuk promt atau permintaan dengan tanda baca dan abaikan <nickainame>`
              }
            },
            {
              description: 'Jika pesan adalah permintaan untuk memasuki atau bergabung dengan grup, maka respon dengan isi msg dengan link yang di kirim oleh user',
              output: {
                cmd: 'join',
                msg: 'Pesan di sini sertakan link grup yang di kirim oleh user dalam respon kamu!'
              }
            },
            {
              description: 'Jika pesan adalah permintaan untuk mencari lagu, maka isi msg: judul lagu yang di minta. Hanya judul nya saja, dan cmd selalu play',
              output: {
                cmd: ['play', 'cariin', 'putar', 'cari'],
                msg: 'Pesan di sini tambahkan judul lagu yang di cari'
              }
            }
          ]
        });

  if (!r.status)
    return { cmd: "text", msg: "Maaf, Bella lagi error. Coba lagi nanti ya." };

  const { msg: replyMsg, cmd } = r.data;
  (s[senderId] ??= []).push({
    time: new Date().toISOString(),
    user: text,
    response: replyMsg,
    cmd
  });
  await saveSession(sesiBell, s);

  if (cmd === "voice") {
    const audioBuffer = await Elevenlabs(replyMsg);
    if (audioBuffer) {
      await vn(conn, chatId, audioBuffer, msg);
      return { cmd: "voice" };
    } else {
      return { cmd: "text", msg: replyMsg };
    }
  }

  return { cmd, msg: replyMsg };
}

async function ai(textMessage, msg, senderId) {
  const ses = await loadSession(sesiAi);
  ses[senderId] ??= [{ role: "system", content: global.logic }];
  ses[senderId].push({ role: "user", content: textMessage });

  try {
    const res = await fetchJSON(`${global.siptzKey}/api/ai/gpt3`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ses[senderId].filter(v => v.role !== "assistant"))
    });
    if (res?.status && res?.data) {
      ses[senderId].push({ role: "assistant", content: res.data });
      await saveSession(sesiAi, ses);
      return res.data;
    }
    throw new Error("Invalid response");
  } catch (e) {
    console.error(chalk.redBright.bold("Ai Error:", e.message));
    return "Maaf, terjadi kesalahan saat menghubungi AI.";
  }
}

const voiceList = new Set([
  "prabowo","yanzgpt","bella","megawati","echilling","adam","thomas_shelby",
  "michi_jkt48","nokotan","jokowi","boboiboy","keqing","anya","yanami_anna",
  "MasKhanID","Myka","raiden","CelzoID","dabi"
]);

async function labvn(message, msg, conn, chatId, prefix = '.') {
  if (!message?.startsWith(prefix)) return
  const [cmd, ...args] = message.slice(prefix.length).trim().split(/\s+/),
        voice = cmd.toLowerCase(),
        text = args.join(' ').trim()
  if (!voiceList.has(voice) || !(await isPrem({ premium: !0 }, conn, msg)) || !text) return
  try {
    const audioBuffer = await fetchBuffer(`${termaiWeb}/api/text2speech/elevenlabs?text=${encodeURIComponent(text)}&voice=${voice}&pitch=0&speed=0.9&key=${termaiKey}`)
    await vn(conn, chatId, audioBuffer, msg)
  } catch (err) {
    console.error(err), await conn.sendMessage(chatId, { text: '⚠️ *Gagal membuat suara!*' }, { quoted: msg })
  }
}

async function getMetadata(id, conn, retry = 2) {
  if (!global.groupCache) global.groupCache = new Map()
  if (global.groupCache.has(id)) return global.groupCache.get(id)
  try {
    const metadata = await conn.groupMetadata(id)
    return global.groupCache.set(id, metadata), setTimeout(() => global.groupCache.delete(id), 2 * 6e4), metadata
  } catch (e) {
    if (retry > 0) return await new Promise(r => setTimeout(r, 1e3)), getMetadata(id, conn, retry - 1)
    return null
  }
}

async function saveLidCache(metadata) {
  for (const p of metadata?.participants || []) {
    const phone = p.phoneNumber?.replace(/@.*/, ''), lid = p.id?.endsWith('@lid') ? p.id : null
    if (phone && lid) global.lidCache[phone] = lid
  }
}

async function isGroupLink(text) {
  if (!text) return false;
  return /https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{15,20}/i.test(text);
}

async function groupFilter(conn, msg, chatId, senderId, isGroup) {
  if (!isGroup) return
  try {
    const db = getDB(),
          groupData = getGc(db, chatId)
    if (!groupData?.gbFilter) return

    const { userAdmin, botNumber } = await exGrup(conn, chatId, senderId)
    if (userAdmin || senderId === botNumber || msg.key?.fromMe) return

    let textMessage = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "",
        keys = Object.keys(msg.message || {}),
        type = keys.find(k => k !== 'messageContextInfo') || keys[0],
        isTaggedStatus = !!msg.message?.groupStatusMentionMessage
    if (isTaggedStatus) textMessage = 'Grup ini disebut dalam status'

    const filters = [
      { enabled: !!groupData.gbFilter?.link?.antilink, condition: await isGroupLink(textMessage), reason: 'Link grup terdeteksi' },
      { enabled: !!groupData.gbFilter?.stiker?.antistiker, condition: type === 'stickerMessage', reason: 'Stiker terdeteksi' },
      { enabled: !!groupData.gbFilter?.antibot, condition: (() => {
          const c = msg.message?.contextInfo || {}
          return c.forwardingScore > 0 || !!c.externalAdReply || c.forwardedNewsletterMessage != null ||
                 /menu|owner|allmenu/i.test(textMessage) || type === 'documentMessage'
        })(), reason: 'Deteksi konten mencurigakan' },
      { enabled: !!groupData.gbFilter?.antiTagSw, condition: isTaggedStatus, reason: 'Tag status terdeteksi' }
    ]

    for (const f of filters)
      if (f.enabled && f.condition) {
        await conn.sendMessage(chatId, { text: `🚫 ${f.reason} dari @${senderId.split('@')[0]}!\nPesan akan dihapus.`, mentions: [senderId] }, { quoted: msg })
        await conn.sendMessage(chatId, { delete: { remoteJid: chatId, fromMe: !1, id: msg.key.id, participant: msg.key.participant || senderId } })
        return !0
      }

    return !1
  } catch {
    return !1
  }
}

async function claimTrial(senderId) {
  try {
    const user = getUser(senderId)
    if (!user || user.data.claim) 
      return { success: !1, message: user ? '⚠️ Sudah pernah claim trial.' : 'Pengguna belum terdaftar.', claimable: !1 }

    const { key, data } = user,
          now = Date.now(),
          trial = 3 * 24 * 36e5,
          remain = data.isPremium?.time || 0,
          db = getDB()

    data.isPremium = { isPrem: !0, time: remain + trial, activatedAt: now }
    data.claim = !0
    db.Private[key] = data, saveDB(db)

    return { success: !0, message: '✅ Trial Premium 3 hari ditambahkan.', claimable: !1 }
  } catch (err) {
    console.error('claimTrial error:', err)
    return { success: !1, message: 'Terjadi kesalahan.', claimable: !1 }
  }
}

async function translateText(text, targetLang = 'id') {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&dt=t&tl=${targetLang}&q=${encodeURIComponent(text)}`),
          data = await res.json()
    return data[0].map(v => v[0]).join('')
  } catch (err) {
    console.error('Error during translation:', err)
    return null
  }
}

async function normalizeNumber(input) {
  const digits = input.replace(/\D/g, "");
  return digits.startsWith("0") ? "62" + digits.slice(1) : digits;
}

async function badwordFilter(conn, msg, chatId, senderId, isGroup) {
  if (!isGroup) return;

  try {
    const group = getGc(getDB(), chatId);
    if (!group?.antibadword?.badword) return;

    const { userAdmin, botNumber } = await exGrup(conn, chatId, senderId),
          isFromBot = senderId === botNumber || msg.key?.fromMe;
    if (userAdmin || isFromBot) return;

    const badwords = group.antibadword.badwordText?.toLowerCase().split(',').map(v => v.trim()).filter(Boolean);
    if (!badwords?.length) return;

    const text = (
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      ''
    ).toLowerCase();

    if (badwords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(text))) {
      await conn.sendMessage(chatId, { text: `Pesan dari @${senderId.split('@')[0]} mengandung kata terlarang.\nPesan akan dihapus.`, mentions: [senderId] }, { quoted: msg }),
      await conn.sendMessage(chatId, { delete: msg.key });
    }
  } catch (e) {
    console.error('badwords error:', e);
  }
}

async function cancelAfk(senderId, chatId, msg, conn) {
  try {
    if (!senderId) return;

    const user = getUser(senderId),
          afkData = user?.data?.afk;

    if (!user || !afkData?.afkTime) return;

    const { afkTime, reason = 'Tidak ada alasan' } = afkData,
          duration = Format.duration(afkTime, Date.now()) || 'Baru saja';

    user.data.afk = {};
    saveDB();

    await conn.sendMessage(
      chatId,
      {
        text: `✅ *Kamu telah kembali dari AFK!*\n⏱️ Durasi: ${duration}\n📌 Alasan sebelumnya: ${reason}`,
        mentions: [senderId],
      },
      { quoted: msg }
    );
  } catch (error) {
    throw error;
  }
}

async function afkTag(msg, conn) {
  const botId = (conn.user?.id || '').split(':')[0] + '@s.whatsapp.net',
        { remoteJid: chatId, participant, fromMe } = msg.key,
        senderId = participant || chatId;

  if (fromMe || senderId === botId) return;

  const ctx = msg.message?.extendedTextMessage?.contextInfo || {},
        targets = [...(ctx.mentionedJid || []), ctx.participant].filter(jid => jid && jid !== botId);

  for (const targetId of targets) {
    const targetUser = getUser(targetId),
          afkData = targetUser?.data?.afk;

    if (!afkData?.afkTime) continue;

    const { afkTime, reason = 'Tidak ada alasan' } = afkData,
          duration = Format.duration(afkTime, Date.now()) || 'Baru saja',
          type = targetId === ctx.participant ? 'reply' : 'mention',
          text = type === 'reply'
            ? `*Jangan ganggu dia!*\nOrang yang kamu reply sedang AFK.\n⏱️ Durasi: ${duration}\n📌 Alasan: ${reason}`
            : `*Jangan tag dia!*\nOrang yang kamu tag sedang AFK.\n⏱️ Durasi: ${duration}\n📌 Alasan: ${reason}`;

    await conn.sendMessage(chatId, { text, mentions: [targetId] }, { quoted: msg });
  }
}

async function loadFunctions() {
  const funcUrl = 'https://raw.githubusercontent.com/MaouDabi0/Dabi-Ai-Documentation/main/assets/funcFile/func.js',
        code = await fetch(funcUrl).then(r => r.text()),
        dataUrl = 'data:text/javascript;base64,' + Buffer.from(code).toString('base64'),
        mod = await import(dataUrl),
        funcs = mod.default;
  return Object.assign(global, funcs), funcs;
}

const cache = {
  set: (key, value) => (memoryCache[key] = value),
  get: key => memoryCache[key],
  delete: key => delete memoryCache[key],
  reset: () => {
    Object.keys(memoryCache).forEach(key => delete memoryCache[key]);
    console.log(chalk.yellowBright.bold(
      `[ CACHE ] Semua cache dibersihkan pada ${new Date().toLocaleString()}`
    ));
  },
};

setInterval(() => cache.reset(), 60 * 60 * 1000);
cache.reset();

async function getStanzaId(msg) {
  try {
    return msg?.message?.extendedTextMessage?.contextInfo?.stanzaId || null;
  } catch (err) {
    console.error('Gagal mengambil stanzaId:', err);
    return null;
  }
}

function messageContent(msg) {
  let textMessage = '',
      mediaInfo = ''
  if (!msg?.message) return { textMessage, mediaInfo }

  const content = msg.message

  if (content.groupStatusMentionMessage)
    mediaInfo = 'Status Grup', textMessage = 'Grup ini disebut dalam status'
  else if (content.conversation)
    textMessage = content.conversation
  else if (content.extendedTextMessage?.text)
    textMessage = content.extendedTextMessage.text
  else if (content.imageMessage?.caption)
    textMessage = content.imageMessage.caption
  else if (content.videoMessage?.caption)
    textMessage = content.videoMessage.caption
  else if (content.reactionMessage)
    textMessage = `Memberi reaksi ${content.reactionMessage.text}`
  else if (content.protocolMessage?.type === 14)
    textMessage = `Pesan Diedit ${textMessage}`
  else if (content.protocolMessage?.type === 0)
    textMessage = 'Pesan Dihapus'
  else if (content.ephemeralMessage?.message?.conversation)
    textMessage = content.ephemeralMessage.message.conversation
  else if (content.ephemeralMessage?.message?.extendedTextMessage?.text)
    textMessage = content.ephemeralMessage.message.extendedTextMessage.text

  const mediaTypes = {
    imageMessage: 'Gambar',
    videoMessage: 'Video',
    audioMessage: 'Audio',
    documentMessage: 'Dokumen',
    stickerMessage: 'Stiker',
    locationMessage: 'Lokasi',
    contactMessage: 'Kontak',
    pollCreationMessage: 'Polling',
    liveLocationMessage: 'Lokasi Live',
    reactionMessage: 'Reaksi',
    protocolMessage: 'Sistem',
    ephemeralMessage: 'Sekali Lihat'
  }

  for (const [key, value] of Object.entries(mediaTypes))
    if (content[key]) mediaInfo = value
    else if (key === 'ephemeralMessage' && content.ephemeralMessage?.message) {
      const nestedKey = Object.keys(content.ephemeralMessage.message)[0]
      if (nestedKey && mediaTypes[nestedKey]) mediaInfo = mediaTypes[nestedKey]
    }

  return { textMessage, mediaInfo }
}

const spamTracker = {}

async function checkSpam(senderId, conn, chatId, msg) {
  const user = getUser(senderId)
  if (!user) return !1

  const now = Date.now(), userKey = user.key
  if (!spamTracker[userKey]) return spamTracker[userKey] = { count: 1, last: now }, !1

  const diff = now - spamTracker[userKey].last
  if (diff <= 3e3)
    spamTracker[userKey].count++, spamTracker[userKey].last = now,
    spamTracker[userKey].count >= 3 && (
      await conn.sendMessage(chatId, { text: '⚠️ Jangan spam!' }, { quoted: msg }),
      spamTracker[userKey].count = 0, !0
    )
  else return diff > 7e3
    ? (spamTracker[userKey] = { count: 1, last: now }, !1)
    : (spamTracker[userKey].last = now, !1)

  return !1
}

const emtData = {
  replaceLid,
  vn,
  bell,
  Bella,
  ai,
  labvn,
  getMetadata,
  saveLidCache,
  isGroupLink,
  groupFilter,
  claimTrial,
  translateText,
  normalizeNumber,
  badwordFilter,
  cancelAfk,
  afkTag,
  loadFunctions,
  cache,
  getStanzaId,
  messageContent,
  checkSpam
};

export default emtData;