function getMessageContent(m) {
  let text = '', media = ''
  if (!m?.message) return { text, media }

  const c = m.message,
        vo = c.viewOnceMessage?.message

  if (vo) {
    text = vo.conversation || vo.extendedTextMessage?.text || vo.imageMessage?.caption || vo.videoMessage?.caption
    media = 'Sekali Lihat'
  }

  if (m.key?.remoteJid === 'status@broadcast') media = 'Status'
  if (c.groupStatusMentionMessage) {
    media = 'Status Grup'
    text = 'Grup ini disebut dalam status'
  }

  if (!text) {
    const pm = c.protocolMessage
    text = c.conversation 
         || c.extendedTextMessage?.text
         || c.imageMessage?.caption
         || c.videoMessage?.caption
         || (c.reactionMessage ? `Memberi reaksi ${c.reactionMessage.text}` : '')
         || (pm?.type === 14 
             ? (pm.editedMessage?.conversation || pm.editedMessage?.extendedTextMessage?.text 
                 ? `Diedit ${pm.editedMessage.conversation || pm.editedMessage.extendedTextMessage?.text}` 
                 : 'Diedit') 
             : '')
         || (pm?.type === 5 ? 'Sinkronisasi' : '')
         || (pm?.type === 6 ? 'Sinkronisasi Kunci Aplikasi' : '')
         || (pm?.type === 9 ? 'Sinkronisasi Keamanan' : '')
         || (pm?.type === 0 ? 'Pesan Dihapus' : '')
         || c.ephemeralMessage?.message?.conversation
         || c.ephemeralMessage?.message?.extendedTextMessage?.text
  }

  const mt = {
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
    ephemeralMessage: 'Sekali Lihat',
    viewOnceMessage: 'Sekali Lihat'
  }

  for (const [k, v] of Object.entries(mt)) {
    if (c[k]) media = v
    if (k === 'ephemeralMessage' && c.ephemeralMessage?.message) {
      const nk = Object.keys(c.ephemeralMessage.message)[0]
      if (nk && mt[nk]) media = mt[nk]
    }
  }

  return { text, media }
}

export default getMessageContent