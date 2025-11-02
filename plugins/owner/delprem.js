export default {
  name: 'delisPrem',
  command: ['delprem','deleteisPremium'],
  tags: 'Owner Menu',
  desc: 'Menghapus status isPremium dari pengguna.',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo,
          ctx = msg.message?.extendedTextMessage?.contextInfo;

    if ((args.length < 1 && !ctx)) 
      return conn.sendMessage(chatId,{text:`Gunakan format:\n\n*${prefix}${commandText} @tag*\n*${prefix}${commandText} 628xxxx*\n*balas pesan lalu ketik ${prefix}${commandText}*`},{quoted:msg});

    try {
      initDB(); 
      const db = getDB();

      let target = ctx?.mentionedJid?.[0] || ctx?.participant || (args.length >= 1 ? args.find(a=>/^\d{8,}$/.test(a))?.replace(/\D/g,'')+'@s.whatsapp.net' : null);

      if (!target || !target.endsWith('@s.whatsapp.net')) 
        return conn.sendMessage(chatId,{text:'Nomor tidak valid atau tidak ditemukan!'},{quoted:msg});

      target = target.toLowerCase().trim();
      const userKey = Object.keys(db.Private).find(k => (db.Private[k].Nomor||'').toLowerCase().trim()===target);

      if (!userKey) 
        return conn.sendMessage(chatId,{text:'Pengguna tidak ditemukan di database!'},{quoted:msg});

      const user = db.Private[userKey];
      if (!user.isPremium?.isPrem) 
        return conn.sendMessage(chatId,{text:`Pengguna *${userKey}* tidak memiliki status Premium.`},{quoted:msg});

      user.isPremium.isPrem = !1;
      user.isPremium.time = 0;
      saveDB(db);

      conn.sendMessage(chatId,{text:`Status Premium *${userKey}* (${target}) telah dihapus.`},{quoted:msg});

    } catch (err) {
      console.error('Error delisPrem.js:',err);
      conn.sendMessage(chatId,{text:'Terjadi kesalahan saat menghapus status Premium!'},{quoted:msg});
    }
  },
};