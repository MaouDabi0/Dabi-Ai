import fs from 'fs'
import path from 'path'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { writeFile } from 'fs/promises'

export default {
  name: 'left',
  command: ['left'],
  tags: 'Group Menu',
  desc: 'Mengatur pesan keluar grup',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    args,
    prefix
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo,
            db = getDB(),
            groupData = getGc(db, chatId),
            sub = args[0]?.toLowerCase()

      if (!isGroup || !groupData) return conn.sendMessage(chatId, { text: !isGroup ? "Perintah ini hanya bisa digunakan di dalam grup!" : "Grup belum terdaftar di database.\nGunakan perintah .daftargc untuk mendaftar." }, { quoted: msg })

      const { userAdmin } = await exGrup(conn, chatId, senderId)
      if (!userAdmin) return conn.sendMessage(chatId, { text: 'Kamu bukan Admin!' }, { quoted: msg })

      groupData.gbFilter = groupData.gbFilter || { Welcome: { welcome: !1, welcomeText: '', content: { media: '' } }, Left: { gcLeft: !1, leftText: '', content: { media: '' } } }
      const leftObj = groupData.gbFilter.Left

      if (sub === 'on' || sub === 'off') return leftObj.gcLeft = sub === 'on' ? !0 : !1, saveDB(), conn.sendMessage(chatId, { text: `Fitur pesan keluar ${sub === 'on' ? 'diaktifkan' : 'dinonaktifkan'}!` }, { quoted: msg })

      if (sub === 'set' || sub === 'reset') {
        if (sub === 'reset') {
          leftObj.content?.media && fs.existsSync(path.join(process.cwd(), 'temp', leftObj.content.media)) && fs.unlinkSync(path.join(process.cwd(), 'temp', leftObj.content.media))
          leftObj.gcLeft = !1, leftObj.leftText = '', leftObj.content.media = '', saveDB()
          return conn.sendMessage(chatId, { text: "Pesan dan media keluar telah direset!" }, { quoted: msg })
        }

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage,
              mediaMessage = quoted || msg.message,
              foundMediaKey = ['imageMessage','videoMessage','audioMessage'].find(k => mediaMessage?.[k]),
              mediaType = foundMediaKey ? foundMediaKey.replace('Message','').toLowerCase() : null,
              caption = (args?.slice(1)?.join(' ')?.trim() || mediaMessage?.[foundMediaKey]?.caption || ''),
              allowedMime = ['image/jpeg','image/jpg','image/png','video/mp4','audio/mp3','audio/aac','audio/ogg','audio/mpeg'],
              isValidMedia = mediaType && foundMediaKey ? allowedMime.includes(mediaMessage[foundMediaKey]?.mimetype) : !1

        if (!caption && !isValidMedia) return conn.sendMessage(chatId, { text: "Gunakan perintah:\n.left set <teks>\nAtau reply / kirim media (mp4, mp3, jpeg, jpg, png) untuk atur pesan keluar." }, { quoted: msg })

        leftObj.gcLeft = !0, leftObj.leftText = caption || ''

        if (isValidMedia) {
          let buffer = null
          try { buffer = await downloadMediaMessage({ message: mediaMessage }, 'buffer') } catch {}
          if (buffer) {
            const tempDir = path.join(process.cwd(), 'temp'),
                  ext = (mediaMessage[foundMediaKey]?.mimetype || 'image/jpeg').split('/')[1] || 'jpg',
                  safeName = String((await conn.groupMetadata(chatId))?.subject || 'group').replace(/\s+/g,'_').replace(/[^\w\-\.]/g,''),
                  timeStamp = Format.indoTime("Asia/Jakarta", "HH:mm"),
                  filePath = path.join(tempDir, `${safeName}-left(${timeStamp}).${ext}`)
            !fs.existsSync(tempDir) && fs.mkdirSync(tempDir, { recursive: !0 })
            await writeFile(filePath, buffer), leftObj.content.media = `${safeName}-left(${timeStamp}).${ext}`
          }
        }

        return saveDB(), conn.sendMessage(chatId, { text: `Pesan keluar diperbarui!\n\n${caption || '(tanpa teks)'}` }, { quoted: msg })
      }

      return conn.sendMessage(chatId, { text: `Penggunaan:\n${prefix}left on → Aktifkan pesan keluar\n${prefix}left off → Nonaktifkan pesan keluar\n${prefix}left set <teks> → Atur teks atau reply/kirim media\n${prefix}left reset → Reset teks & media pesan keluar` }, { quoted: msg })
    } catch (e) {
      return conn.sendMessage(chatInfo.chatId, { text: `Error: ${e.message || e}` }, { quoted: msg })
    }
  }
}