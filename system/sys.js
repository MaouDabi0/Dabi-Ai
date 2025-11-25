import fs from 'fs'
import moment from 'moment-timezone';
import { db, getGc } from './db/data.js'
import { getMetadata, groupCache } from './function.js'

const time = {
  timeIndo: (zone = "Asia/Jakarta", fmt = "HH:mm:ss DD-MM-YYYY") => moment().tz(zone).format(fmt)
}

const chat = (m = {}, botName = "pengguna") => {
  const id = m?.key?.remoteJid || "",
        group = id.endsWith("@g.us"),
        channel = id.endsWith("@newsletter"),
        sender = m?.key?.participantAlt || m?.key?.participant || id,
        pushName = (m?.pushName || "").trim()
          || (sender.endsWith("@s.whatsapp.net")
            ? sender.replace(/@s\.whatsapp\.net$/, "")
            : botName);

  if (!id) return null;

  return { id, group, channel, sender, pushName };
};

export const banned = jid => {
  const sender = jid,
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
        owner = (global.ownerNumber || []).map(v => v.replace(/\D/g, '')),
        target = user.replace(/\D/g, ''),
        gcData = getGc(chat);

  return owner.includes(target) ? !1 : !!(gcData?.ban);
};

const grupify = async (xp, id, sender) => {
  const meta = groupCache.get(id) || await getMetadata(id, xp) || {};
  if (!meta.id) return {};

  const adm = (meta.participants || [])
    .filter(p => p.admin)
    .map(p => p.phoneNumber),
        bot = `${xp.user?.id?.split(':')[0]}@s.whatsapp.net`,
        botAdm = adm.includes(bot),
        usrAdm = adm.includes(sender);

  return {
    meta,
    bot,
    botAdm,
    usrAdm,
    adm
  };
};

export const txtWlc = async (xp, chat) => {
  try {
    const gcData = getGc(chat)

    const id = chat.id,
          meta = groupCache.get(id) || await getMetadata(id, xp),
          name = meta?.subject || id,
          txt = gcData?.filter?.welcome?.welcomeText?.trim()
                || `selamat datang @user digrup ${name}`;

    return { txt };
  } catch (e) {
    console.error('txtWlc error:', e)
  }
}

export const mode = async (xp, chatData) => {
  if (!chatData) return !1

  const cfg = JSON.parse(fs.readFileSync('./system/set/config.json', 'utf-8')),
        isGroupMode = cfg.botSetting?.isGroup,
        result = (chatData.group && isGroupMode) || (!chatData.group && !isGroupMode)

  return result ? !0 : !1
}

const sys = {
  time,
  chat,
  grupify
}

export default sys;