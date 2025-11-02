import fs from 'fs';
import path from 'path';
const configPath = path.join(dirname, './set/config.json');

export default {
  name: 'setname',
  command: ['setname', 'setfullname'],
  tags: 'Owner Menu',
  desc: 'Ubah nama bot',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo,
          newName = args.join(' ');

    if (!newName || !fs.existsSync(configPath))
      return conn.sendMessage(chatId, { text: !newName ? 'Masukkan nama baru.' : 'Config tidak ditemukan.' }, { quoted: msg });

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      commandText === 'setname'
        ? (global.botName = newName, config.botSetting.botName = newName)
        : (global.botFullName = newName, config.botSetting.botFullName = newName);
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      conn.sendMessage(chatId, { text: `Nama bot diubah menjadi:\n${newName}` }, { quoted: msg });
      setTimeout(() => process.exit(1), 2e3);
    } catch (e) {
      console.error(e),
      conn.sendMessage(chatId, { text: 'Gagal mengubah nama.' }, { quoted: msg });
    }
  }
};