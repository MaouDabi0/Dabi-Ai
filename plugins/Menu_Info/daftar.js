module.exports = {
  name: 'daftar',
  command: ['daftar', 'register', 'daftargc'],
  tags: 'Info Menu',
  desc: 'Mendaftarkan pengguna atau grup.',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup, pushName } = chatInfo;

      intDB();
      let db = readDB();

      if (!db.Private || typeof db.Private !== 'object') db.Private = {};
      if (!db.Grup || typeof db.Grup !== 'object') db.Grup = {};

      if (commandText === 'daftargc') {
        if (!isGroup) {
          return conn.sendMessage(chatId, { text: '❌ Perintah ini hanya bisa digunakan di dalam grup.' }, { quoted: message });
        }

        const metadata = await conn.groupMetadata(chatId);
        const groupName = metadata.subject;

        const groupExists = Object.values(db.Grup).some(g => g.Id === chatId);
        if (groupExists) {
          return conn.sendMessage(chatId, { text: '✅ Grup ini sudah terdaftar di database.' }, { quoted: message });
        }

        db.Grup[groupName] = {
          Id: chatId,
          autoai: false,
          mute: false,
          setWarn: 0,
          gbFilter: {
            Welcome: {
              welcome: false,
              welcomeText: ''
            },
            Left: {
              gcLeft: false,
              leftText: '',
            },
            link: {
              antilink: false,
              setlink: ''
            },
            stiker: {
              antistiker: false
            },
            antibot: false,
            antiTagSw: false
          },
          antibadword: {
            badword: false,
            badwordText: ''
          }
        };

        saveDB(db);

        return conn.sendMessage(chatId, {
          text: `✅ Grup *${groupName}* berhasil didaftarkan ke dalam database.`
        }, { quoted: message });
      }

      const teks = `📌 Cara daftar:\n\n*${prefix}daftar Nama Kamu Umur*\n\nContoh:\n*${prefix}daftar ${pushName} 15*`;

      if (args.length < 2) {
        return conn.sendMessage(chatId, { text: teks }, { quoted: message });
      }

      const nama = args.slice(0, -1).join(' ');
      const umur = parseInt(args[args.length - 1]);

      if (isNaN(umur) || umur < 12 || umur > 100) {
        return conn.sendMessage(chatId, {
          text: `❌ ️Maaf, umur kamu terlalu kecil untuk mendaftar.` }, { quoted: message });
      }

      if (getUser(db, senderId)) {
        return conn.sendMessage(chatId, {
          text: `❌ Nama *${nama}* sudah terdaftar!\n\nGunakan nama lain atau cek profil dengan *${prefix}profile*.` }, { quoted: message });
      }

      function generateRandomId() {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let randomId = '';
        for (let i = 0; i < 7; i++) {
          randomId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        randomId += Math.floor(Math.random() * 100) + 1;
        return randomId;
      }

      db.Private[nama] = {
        Nomor: senderId,
        umur: umur.toString(),
        noId: generateRandomId(),
        autoai: false,
        cmd: 0,
        claim: false,
        isPremium: {
          isPrem: false,
          time: 0,
        },
        afk: {}
      };

      saveDB(db);

      let textMsg = `✅ Pendaftaran berhasil!\n\n`;
      textMsg += `🔹 Nama: *${nama}*\n`;
      textMsg += `🔹 Umur: *${umur}*\n`;
      textMsg += `🔹 ID: *${db.Private[nama].noId}*\n\n`;
      textMsg += `Ketik *${prefix}profile* untuk melihat profil.`

      conn.sendMessage(chatId, {
        text: textMsg,
        contextInfo: { mentionedJid: [senderId] } }, { quoted: message });

    } catch (error) {
      console.error('Error di plugin daftar.js:', error);
      conn.sendMessage(chatId, { text: '⚠️ Terjadi kesalahan saat mendaftar!' }, { quoted: message });
    }
  },
};