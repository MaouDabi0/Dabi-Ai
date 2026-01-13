import c from 'chalk'
import fs from 'fs'
import moment from 'moment-timezone';
import { db } from './db/data.js'
import { getMetadata } from './function.js'

const time = {
  timeIndo: (zone = "Asia/Jakarta", fmt = "HH:mm:ss DD-MM-YYYY") => moment().tz(zone).format(fmt)
}

const chat = (m, botName = "pengguna") => {
  const id = m?.key?.remoteJidAlt || m?.key?.remoteJid || "",
        group = id.endsWith("@g.us"),
        channel = id.endsWith("@newsletter"),
        sender = m?.participant || m?.key?.participantAlt || m?.key?.participant || id,
        pushName = (m?.verifiedBizName || m?.pushName || sender.replace(/@s\.whatsapp\.net$/, "")).trim()
          || (sender.endsWith("@s.whatsapp.net")
            ? sender.replace(/@s\.whatsapp\.net$/, "")
            : botName);

  if (!id) return null;

  return { id, group, channel, sender, pushName };
};

export const banned = chat => {
  const sender = chat.sender,
        dataKeys = Object.keys(db()?.key || {}),
        users = dataKeys.map(k => db().key[k]),
        found = users.find(u => u?.jid === sender);

  let userData = found;

  if (!userData) {
    const clean = sender.replace(/\D/g, ''),
          fallback = users.find(u => u?.jid?.replace(/\D/g, '').endsWith(clean));
    if (fallback) userData = fallback;
  }

  return userData?.ban === !0;
};

export const bangc = chat => {
  const user = chat.sender,
        target = user.replace(/\D/g, ''),
        owner = (global.ownerNumber || []).map(v => v.replace(/\D/g, '')),
        ban = !owner.includes(target) && !!getGc(chat)?.ban;

  return ban ? (log(c.redBright.bold(`Grup ${chat.id} diban`)), !0) : !1;
};

const grupify = async (xp, m) => {
  const cht = chat(m)
  if (!cht) return

  const meta = groupCache.get(cht.id) || await getMetadata(cht.id, xp)
  if (!meta) return

  const adm = (meta.participants || [])
    .filter(p => p.admin)
    .map(p => p.phoneNumber),
        bot = `${xp.user?.id?.split(':')[0]}@s.whatsapp.net`,
        botAdm = adm.includes(bot),
        usrAdm = adm.includes(cht.sender)

  return {
    meta,
    bot,
    botAdm,
    usrAdm,
    adm
  }
}

export const txtWlc = async (xp, chat) => {
  try {
    const gcData = getGc(chat),
          meta = groupCache.get(chat.id) || await getMetadata(chat.id, xp),
          txt = gcData?.filter?.welcome?.welcomeText?.trim()
                || `selamat datang @user digrup ${meta?.subject || chat.id}`;

    return { txt };
  } catch (e) {
    console.error('txtWlc error:', e)
  }
}

export const txtLft = async (xp, chat) => {
  try {
    const gcData = getGc(chat),
          meta = groupCache.get(chat.id) || await getMetadata(chat.id, xp),
          txt = gcData?.filter?.left?.leftTxt?.trim() || `%user keluar dari grup ${meta?.subject || chat.id}`

    return { txt }
  } catch (e) {
    console.error('txtLft error', e)
  }
}

export const mode = async (xp, chat) => {
  if (!chat) return !1

  const cfg = JSON.parse(fs.readFileSync('./system/set/config.json', 'utf-8')),
        isGc = cfg.botSetting?.isGroup,
        ownerList = cfg.ownerSetting?.ownerNumber || [],
        sender = chat.sender?.replace(/@s\.whatsapp\.net$/, '')

  if (ownerList.includes(sender)) return !0

  return chat.group === isGc
}

const sys = {
  time,
  chat,
  grupify
}

export default sys;