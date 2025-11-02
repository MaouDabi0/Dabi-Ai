import { downloadMediaMessage } from '@whiskeysockets/baileys'

export default {
  name: 'setppgc',
  command: ['setppgc', 'setfotogc'],
  tags: 'Group Menu',
  desc: 'Mengatur foto profil grup',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText
  }) => {
    const { chatId, senderId, isGroup } = chatInfo,
          { botAdmin, userAdmin } = isGroup ? await exGrup(conn, chatId, senderId) : {},
          quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage,
          imageSrc = quotedMsg?.imageMessage || msg.message?.imageMessage

    return !isGroup ? conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan dalam grup.' }, { quoted: msg })
         : !userAdmin ? conn.sendMessage(chatId, { text: 'Kamu bukan Admin.' }, { quoted: msg })
         : !botAdmin ? conn.sendMessage(chatId, { text: 'Bot bukan admin.' }, { quoted: msg })
         : !imageSrc ? conn.sendMessage(chatId, { text: `Kirim atau balas gambar dengan caption *${prefix}${commandText}* untuk mengubah foto grup.` }, { quoted: msg })
         : (async () => {
             try {
               const buffer = await downloadMediaMessage({ message: quotedMsg || msg.message }, 'buffer', {})
               if (!buffer) throw new Error('Gagal mengunduh gambar')
               await conn.updateProfilePicture(chatId, buffer),
               conn.sendMessage(chatId, { text: 'Foto profil grup berhasil diperbarui.' }, { quoted: msg })
             } catch (e) {
               console.error('Error setppgc:', e),
               conn.sendMessage(chatId, { text: `Gagal mengubah foto grup: ${e.message}` }, { quoted: msg })
             }
           })()
  }
}