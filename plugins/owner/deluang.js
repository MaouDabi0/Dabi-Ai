export default {
  name: 'deluang',
  command: ['deluang'],
  tags: 'Owner Menu',
  desc: 'Mengurangi saldo pengguna.',
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

    if ((args.length<1 && !ctx)) 
      return conn.sendMessage(chatId,{text:`Gunakan format:\n\n*${prefix}${commandText} @tag 1000*\n*${prefix}${commandText} 628xxxx 1000*\n*balas pesan lalu ketik ${prefix}${commandText} 1000*`},{quoted:msg});

    try {
      initDB(); 
      const db = getDB();

      let target = ctx?.mentionedJid?.[0] || ctx?.participant || (args.length>=2 ? args.find(a=>/^\d{8,}$/.test(a))?.replace(/\D/g,'')+'@s.whatsapp.net' : null),
          amount = parseInt(args.find(a=>/^\d+$/.test(a)));

      if ((!target || !target.endsWith('@s.whatsapp.net')) || (!amount || isNaN(amount) || amount<=0)) 
        return conn.sendMessage(chatId,{
          text: !target || !target.endsWith('@s.whatsapp.net') 
            ? 'Nomor tidak valid atau tidak ditemukan!' 
            : 'Jumlah uang tidak valid! Contoh: 1000'
        },{quoted:msg});

      target = target.toLowerCase().trim();
      const userKey = Object.keys(db.Private).find(k=>(db.Private[k].Nomor||'').toLowerCase().trim()===target);

      if (!userKey) 
        return conn.sendMessage(chatId,{text:'Pengguna tidak ditemukan di database!'},{quoted:msg});

      const user = db.Private[userKey];
      user.money = user.money||{};
      user.money.amount = user.money.amount||0;

      if (user.money.amount<amount) 
        return conn.sendMessage(chatId,{text:`Saldo pengguna hanya Rp${user.money.amount.toLocaleString('id-ID')}, tidak cukup untuk dikurangi Rp${amount.toLocaleString('id-ID')}.`},{quoted:msg});

      user.money.amount-=amount;
      saveDB(db);

      conn.sendMessage(chatId,{text:`Saldo Rp${amount.toLocaleString('id-ID')} berhasil dikurangi dari *${userKey}* (${target}).\nSisa saldo: Rp${user.money.amount.toLocaleString('id-ID')}`},{quoted:msg});

    } catch(err) {
      console.error('Error deluangs.js:',err);
      conn.sendMessage(chatId,{text:'Terjadi kesalahan saat mengurangi uang!'},{quoted:msg});
    }
  },
};