export default {
  name: 'Transfer Uang',
  command: ['tf','transfer'],
  tags: 'Rpg Menu',
  desc: 'Mentransfer uang',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId } = chatInfo,
          ctx = msg.message?.extendedTextMessage?.contextInfo;

    if (!args.length && !ctx)
      return conn.sendMessage(chatId, { text: `Gunakan format:\n\n${prefix + commandText} @tag 1e4\n${prefix + commandText} 628xxxx 1e4\nbalas pesan lalu ketik ${prefix + commandText} 1e4` }, { quoted: msg });

    try {
      initDB();
      const db = getDB(),
            dbUser = db.Private;
      let target = ctx?.mentionedJid?.[0] || ctx?.participant,
          amount = parseInt(args.find(a => /^\d+$/.test(a)));

      !target && args.length >= 2 ? (() => {
        const num = args.find(a => /^\d{8,}$/.test(a)),
              amt = args.find(a => /^\d{1,7}$/.test(a));
        num && (target = num.replace(/\D/g, '') + '@s.whatsapp.net'),
        amt && (amount = parseInt(amt));
      })() : null;

      if (!target?.endsWith('@s.whatsapp.net')) return conn.sendMessage(chatId, { text: 'Nomor tidak valid atau tidak ditemukan' }, { quoted: msg });
      if (!amount || amount <= 0) return conn.sendMessage(chatId, { text: 'Jumlah uang tidak valid, contoh 1e4' }, { quoted: msg });

      target = target.toLowerCase().trim();
      const pengirimKey = Object.keys(dbUser).find(k => dbUser[k].Nomor === senderId),
            targetKey = Object.keys(dbUser).find(k => dbUser[k].Nomor === target);

      if (!pengirimKey || !targetKey)
        return conn.sendMessage(chatId, { text: !pengirimKey ? 'Kamu belum terdaftar di database' : 'Pengguna tujuan belum terdaftar di database' }, { quoted: msg })

      const pengirim = dbUser[pengirimKey],
            penerima = dbUser[targetKey];
      pengirim.money = pengirim.money || { amount: 0 },
      penerima.money = penerima.money || { amount: 0 };

      if (pengirim.money.amount < amount)
        return conn.sendMessage(chatId, { text: `Saldo kamu tidak cukup, saldo kamu hanya Rp${pengirim.money.amount.toLocaleString('id-ID')}` }, { quoted: msg });

      pengirim.money.amount -= amount,
      penerima.money.amount += amount,
      saveDB(db);

      conn.sendMessage(chatId, { text: `Transfer berhasil\nDari: ${pengirimKey}\nKe: ${targetKey}\nJumlah: Rp${amount.toLocaleString('id-ID')}` }, { quoted: msg });
    } catch (err) {
      console.error('Error transfer.js:', err),
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mentransfer uang' }, { quoted: msg });
    }
  }
};