import fs from 'fs';
import path from 'path';
const pluginDir = path.resolve('./plugins');

export default {
  name: 'setprefix',
  command: ['setprefix', 'prefix'],
  tags: 'Owner Menu',
  desc: 'Mengatur penggunaan prefix pada plugin',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo,
          send = t => conn.sendMessage(chatId, { text: t }, { quoted: msg }),
          updatePrefix = (f, v) => {
            try {
              const c = fs.readFileSync(f, 'utf8');
              return !/prefix:\s*(true|false)/.test(c) ? !1 : (fs.writeFileSync(f, c.replace(/prefix:\s*(true|false)/, `prefix: ${v}`)), !0);
            } catch { return !1; }
          };

    if (!args[0]) {
      const entries = Object.entries(global.plugins).filter(([_, p]) => typeof p.prefix === 'boolean'),
            [on, off] = [!0, !1].map(s => entries.filter(([_, p]) => p.prefix === s)),
            [list, label] = on.length <= off.length ? [on, 'ON'] : [off, 'OFF'];
      return send(`Plugin dengan prefix ${label} (${list.length}):\n${list.map(([n]) => `• ${n}`).join('\n')}`);
    }

    const [target, stateArg] = args.map(v => v.toLowerCase()),
          valid = ['on', 'off'].includes(stateArg),
          bool = stateArg === 'on';

    if (!valid) return send('Contoh:\n.prefix autobio on\n.prefix all off');

    if (target === 'all') {
      let count = 0;
      for (const folder of fs.readdirSync(pluginDir)) {
        const dir = path.join(pluginDir, folder);
        if (!fs.statSync(dir).isDirectory()) continue;
        for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.js')))
          updatePrefix(path.join(dir, file), bool) && count++;
      }
      loadPlug();
      return send(`Prefix semua plugin diubah ke ${stateArg.toUpperCase()} (${count} plugin diperbarui)`);
    }

    let filePath = null;
    for (const folder of fs.readdirSync(pluginDir)) {
      const dir = path.join(pluginDir, folder);
      if (!fs.statSync(dir).isDirectory()) continue;
      for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.js')))
        if (path.parse(file).name.toLowerCase() === target) { filePath = path.join(dir, file); break; }
      if (filePath) break;
    }

    return !filePath
      ? send(`Plugin "${target}" tidak ditemukan (berdasarkan nama file).`)
      : updatePrefix(filePath, bool)
        ? (loadPlug(), send(`Prefix plugin "${target}" diubah ke ${stateArg.toUpperCase()}`))
        : send(`Tidak ditemukan properti prefix pada plugin "${target}"`);
  }
};