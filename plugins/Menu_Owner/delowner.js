const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../toolkit/set/config.json');

module.exports = {
  name: 'delowner',
  command: ['delowner', 'rmow'],
  tags: 'Owner Menu',
  desc: 'Menghapus nomor owner dari daftar owner',
  prefix: true,
  owner: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, message))) return;

    let config;
    try {
      const configData = fs.readFileSync(configPath, 'utf-8');
      config = JSON.parse(configData);
    } catch (err) {
      console.error('Gagal membaca config:', err);
      return conn.sendMessage(chatId, { text: 'Gagal membaca config.json' }, { quoted: message });
    }

    const rawInput = args.join(' ');
    if (!rawInput) {
      return conn.sendMessage(chatId, { text: 'Masukkan nomor owner yang ingin dihapus' }, { quoted: message });
    }

    const number = await calNumber(rawInput);
    const index = config.ownerSetting.ownerNumber.indexOf(number);
    if (index === -1) {
      return conn.sendMessage(chatId, { text: 'Nomor tidak ditemukan dalam daftar owner' }, { quoted: message });
    }

    config.ownerSetting.ownerNumber.splice(index, 1);

    try {
      const fd = fs.openSync(configPath, 'w');
      fs.writeFileSync(fd, JSON.stringify(config, null, 2), 'utf-8');
      fs.fsyncSync(fd);
      fs.closeSync(fd);

      conn.sendMessage(chatId, { text: `Nomor ${number} telah dihapus dari daftar owner` }, { quoted: message });
    } catch (err) {
      console.error('Gagal menyimpan config:', err);
      conn.sendMessage(chatId, { text: 'Gagal menyimpan perubahan ke config.json' }, { quoted: message });
    }
  }
};