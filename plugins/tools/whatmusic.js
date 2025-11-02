import whatsmusic from '../../toolkit/scrape/whatsmusic.js'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import fs from 'fs'

export default {
  name: 'whatsmusic',
  command: ['whatmusic'],
  tags: 'Tools Menu',
  desc: 'Mendeteksi lagu dari voice note/audio',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    try {
      const { chatId } = chatInfo,
            quotedMsg = msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage,
            audio = quotedMsg?.audioMessage || quotedMsg?.voiceNoteMessage

      if (!quotedMsg || !audio)
        return conn.sendMessage(chatId, { text: 'Reply audio atau voice note dengan perintah ini.' }, { quoted: msg })

      const ctx = msg.message.extendedTextMessage.contextInfo,
            mediaBuffer = await downloadMediaMessage({
              key: { remoteJid: msg.key.remoteJid, id: ctx.stanzaId, fromMe: !1, participant: ctx.participant },
              message: quotedMsg
            }, 'buffer', {})

      if (!mediaBuffer)
        return conn.sendMessage(chatId, { text: 'Gagal mengunduh audio.' }, { quoted: msg })

      await conn.sendMessage(chatId, { text: 'Mendeteksi lagu...' }, { quoted: msg })

      const result = await whatsmusic(mediaBuffer, termaiWeb, termaiKey)

      return result.success
        ? conn.sendMessage(chatId, { text: `Lagu Dikenali:\n\nJudul: ${result.title}\nArtis: ${result.artists}\nACRID: ${result.acrid}` }, { quoted: msg })
        : conn.sendMessage(chatId, { text: result.message }, { quoted: msg })
    } catch (e) {
      conn.sendMessage(msg.key.remoteJid, { text: 'Terjadi kesalahan saat mendeteksi lagu.' }, { quoted: msg })
    }
  }
}