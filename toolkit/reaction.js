const { run: kickRun } = require('../plugins/Menu_Group/kick');
const { run: promoteRun } = require('../plugins/Menu_Group/promote');
const { run: demoteRun } = require('../plugins/Menu_Group/demote');
const { run: playRun } = require('../plugins/Menu_Download/play');

async function rctKey(message, conn) {
  try {
    const reaction = message.message.reactionMessage?.text;
    if (!reaction) return;

    const reactedKey = message.message.reactionMessage?.key;
    if (!reactedKey?.id || !reactedKey?.remoteJid) return;

    const chatId = reactedKey.remoteJid;
    const participant = reactedKey.participant;
    const isFromMe = reactedKey.fromMe;
    const senderId = message.key.participant || message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    if (!isGroup) return;

    const { botNumber, botAdmin, userAdmin, adminList } = await stGrup(conn, chatId, senderId);
    const isTargetFromBot = participant === botNumber;

    const dummyMessage = {
      key: reactedKey,
      message: {
        extendedTextMessage: {
          text: '',
          contextInfo: {
            participant,
            quotedMessage: null
          }
        }
      }
    };

    const chatInfo = { chatId, senderId, isGroup };

    if (reaction === '❌') {
      if (isFromMe || isTargetFromBot || userAdmin) {
        if (!isTargetFromBot && !botAdmin) return;
        await conn.sendMessage(chatId, {
          delete: {
            remoteJid: chatId,
            fromMe: isTargetFromBot,
            id: reactedKey.id,
            ...(isTargetFromBot ? {} : { participant })
          }
        });
      }
    }

    if (reaction === '🦵') {
      if (userAdmin && botAdmin) {
        dummyMessage.message.extendedTextMessage.contextInfo.mentionedJid = [participant];
        await kickRun(conn, dummyMessage, {
          chatInfo,
          textMessage: '',
          prefix: '.',
          commandText: 'kick',
          args: []
        });
      }
    }

    if (reaction === '👑') {
      if (userAdmin && botAdmin) {
        dummyMessage.message.extendedTextMessage.contextInfo.mentionedJid = [participant];
        await promoteRun(conn, dummyMessage, {
          chatInfo,
          textMessage: '',
          prefix: '.',
          commandText: 'promote',
          args: []
        });
      }
    }

    if (reaction === '💨') {
      if (userAdmin && botAdmin) {
        dummyMessage.message.extendedTextMessage.contextInfo.mentionedJid = [participant];
        await demoteRun(conn, dummyMessage, {
          chatInfo,
          textMessage: '',
          prefix: '.',
          commandText: 'demote',
          args: []
        });
      }
    }

    if (['🔍', '🔎'].includes(reaction)) {
      const msg = conn.reactionCache?.get(reactedKey.id);
      if (!msg) return;

      const searchText =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption;

      if (!searchText) return;

      await playRun(conn, msg, {
        chatInfo,
        textMessage: searchText,
        prefix: '.',
        commandText: 'play',
        args: searchText.trim().split(/\s+/)
      });
    }

    if (['🌐', '🌏', '🌍', '🌎'].includes(reaction)) {
      const msg = conn.reactionCache?.get(reactedKey.id);
      if (!msg) return;

      const quotedText =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption;

      if (!quotedText) return;
    
      const translated = await translate(quotedText, 'id');
      if (translated) {
        await conn.sendMessage(chatId, { text: `*Translate:* ${translated}` }, { quoted: msg });
      }
    }

  } catch (err) {
    console.error('Reaction handler error:', err);
  }
}

module.exports = { rctKey };