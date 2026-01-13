function getMessageContent(m) {
  let text = '',
      media = '',
      no = ''

  const chat = global.chat(m),
        key = m.key,
        msg = m.message,
        vo = key?.isViewOnce,
        stubType = m?.messageStubType,
        prm = msg?.protocolMessage,
        paramType = m.messageStubParameters

  if (paramType?.[0]) {
    const data = (() => { try { return JSON.parse(paramType[0]) } catch { return {} } })();
    no = (data.phoneNumber || data.pn || chat.pushName)?.replace(/@.+$/, '');
  }

  text =
    msg?.conversation
    || msg?.extendedTextMessage?.text
    || msg?.imageMessage?.caption
    || msg?.videoMessage?.caption
    || msg?.documentMessage?.caption
    || (m.call && 'Panggilan telepon')
    || (msg?.reactionMessage &&
        `Bereaksi ${msg.reactionMessage.text} ke ${msg.reactionMessage.key?.participant?.replace(/@s\.whatsapp\.net$/, '')}`)
    || (key?.remoteJid === 'status@broadcast' && 'Status')
    || (msg?.groupStatusMentionMessage && 'Grup ini disebut')
    || (prm?.type === 14 &&
        `Diedit ${prm?.editedMessage?.conversation || prm?.editedMessage?.extendedTextMessage?.text || ''}`.trim())
    || ({
        0: 'Pesan dihapus',
        3: 'Mengatur timer grup',
        5: 'Sinkronisasi',
        6: 'Sinkronisasi kunci aplikasi',
        9: 'Sinkronisasi kunci keamanan'
      })[prm?.type]
    || ({
        1: `${chat.sender.replace(/@s\.whatsapp\.net$/, '')} Menyimpan pesan`,
        2: `${chat.sender.replace(/@s\.whatsapp\.net$/, '')} Menghapus pesan tersimpan`
      })[msg?.keepInChatMessage?.keepType]
    || ({
        2: 'Sekali lihat',
        20: 'Grup dibuat',
        22: 'Mengubah foto grup',
        24: `Mengedit info grup`,
        25: 'Mengedit peraturan anggota grup',
        26: 'Mengedit chat grup',
        27: 'Bergabung ke grup',
        29: `Menjadikan ${no} admin`,
        30: `Menurunkan admin ${no}`,
        32: 'Keluar dari grup',
        145: 'Mengedit persetujuan admin',
        171: 'Mengedit peraturan tambahkan anggota',
        172: 'Meminta bergabung'
      })[stubType]
    || ({
        1: 'Menyematkan pesan',
        2: 'Melepaskan pin pesan'
      })[msg?.pinInChatMessage?.type]
    || (vo && 'Sekali lihat')

  const mt = {
    imageMessage: 'Gambar',
    videoMessage: 'Video',
    audioMessage: 'Audio',
    documentMessage: 'Dokumen',
    stickerMessage: 'Stiker',
    contactMessage: `Kontak ${msg?.contactMessage?.displayName}`,
    reactionMessage: 'Reaksi',
    vo: 'Sekali lihat',
    protocolMessage: 'Sistem',
    locationMessage: 'Lokasi',
    pollCreationMessage: 'Polling',
    pollCreationMessageV3: 'Polling',
    pollUpdateMessage: 'Memilih polling',
    eventMessage: `Acara ${msg?.eventMessage?.name}`,
    liveLocationMessage: 'Lokasi Live'
  }

  const mediaKey = Object.keys(msg || {}).find(k => mt[k])
  media = mediaKey ? mt[mediaKey] : ''
  media = text && media && text.toLowerCase() === media.toLowerCase() ? '' : media

  return { text, media }
}

export default getMessageContent