import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url),
      __dirname = path.dirname(__filename),
      p = path.join(__dirname, './db/game.json'),
      tokoPath = path.join(__dirname, './db/datatoko.json'),
      bankPath = path.join(__dirname, './db/bank.json'),
      storePath = path.join(__dirname, './set/toko.json');

!fs.existsSync(p) && fs.writeFileSync(p, JSON.stringify({ FunctionGame: {}, tca: { user: {} }, historyGame: {} }, null, 2));

const readJSON = (file, def = {}) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : def,
      writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2)),

load = () => {
  const d = readJSON(p, {});
  return { FunctionGame: d.FunctionGame || {}, tca: d.tca || {}, historyGame: d.historyGame || {} };
},

save = data => {
  const current = readJSON(p, {});
  current.FunctionGame = data.FunctionGame || {};
  current.tca = data.tca || {};
  current.historyGame = data.historyGame || {};
  writeJSON(p, current);
},

bersih = data => Object.fromEntries(Object.entries(data).filter(([_, v]) => v?.status)),

loadToko = () => readJSON(tokoPath, { pendingOrders: [] }),
saveToko = data => writeJSON(tokoPath, data),

loadBank = () => {
  const bank = readJSON(bankPath);
  !bank.bank || typeof bank.bank.saldo !== 'number' ? bank.bank = { saldo: 0, tax: '3%' } : !('tax' in bank.bank) && (bank.bank.tax = '3%');
  return bank;
},
saveBank = data => writeJSON(bankPath, data),
loadStore = () => readJSON(storePath, { shops: {} }),
saveStore = data => writeJSON(storePath, data);

async function handleGame(conn, msg, chatId, text) {
  try {
    const replyId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId,
          nomor = (msg.key.participant || msg.key.remoteJid || '').replace(/\D/g, '') + '@s.whatsapp.net',
          jawaban = text.toLowerCase().trim(),
          dbUser = getDB(),
          userKey = Object.keys(dbUser.Private).find(k => dbUser.Private[k].Nomor === nomor),
          toko = loadToko(),
          pendingIndex = toko.pendingOrders.findIndex(o => o.chance?.id === nomor);

    if (pendingIndex !== -1) {
      const order = toko.pendingOrders[pendingIndex].chance;
      if (['ya', 'iya'].includes(jawaban)) {
        const gameDb = load(),
              user = dbUser.Private[userKey];
        if (user?.money?.amount >= 3e4) {
          user.money.amount -= 3e4;
          const bank = loadBank();
          bank.bank.saldo += 3e4;
          saveBank(bank);
          const target = gameDb.FunctionGame[order.idKey];
          target
            ? (target.chance = (target.chance || 0) + order.barang,
               toko.pendingOrders.splice(pendingIndex, 1),
               saveToko(toko),
               save(gameDb),
               global.saveDB(dbUser),
               await conn.sendMessage(chatId, {
                 text: `Pembelian berhasil. 3 kesempatan ditambahkan.\nSisa saldo: Rp${user.money.amount.toLocaleString('id-ID')}`
               }, { quoted: msg }))
            : await conn.sendMessage(chatId, { text: 'Data soal tidak ditemukan.' }, { quoted: msg });
        } else await conn.sendMessage(chatId, { text: 'Saldo kurang atau kamu belum terdaftar.' }, { quoted: msg });
        return !0;
      }
      if (['tidak', 'no'].includes(jawaban))
        return toko.pendingOrders.splice(pendingIndex, 1),
               saveToko(toko),
               await conn.sendMessage(chatId, { text: 'Pembelian dibatalkan.' }, { quoted: msg }),
               !0;
    }

    if (!replyId) return !1;
    const db = load(),
          key = Object.keys(db.FunctionGame).find(k => db.FunctionGame[k].id === replyId);
    if (!key) return !1;
    if (!userKey)
      return await conn.sendMessage(chatId, {
        text: 'Kamu belum daftar. Ketik *.menu* untuk mendaftar otomatis.'
      }, { quoted: msg }), !0;

    const user = dbUser.Private[userKey],
          item = db.FunctionGame[key],
          rawJawaban = item.jawaban || item.data?.jawaban,
          listJawaban = (Array.isArray(rawJawaban) ? rawJawaban : [rawJawaban])
                        .map(j => String(j).toLowerCase());

    if (jawaban === 'nyerah')
      return await conn.sendMessage(chatId, {
        text: `Kamu menyerah. Jawaban yang benar adalah: ${listJawaban.join(', ')}`
      }, { quoted: msg }),
      delete db.FunctionGame[key],
      save(db),
      !0;

    if (!Array.isArray(rawJawaban)) {
      if (jawaban === listJawaban[0])
        return await rewardBenar(conn, msg, chatId, db, dbUser, key, user, listJawaban), !0;

      await conn.sendMessage(chatId, { text: 'Jawaban salah. Kesempatan berkurang.' }, { quoted: msg });
      item.chance = (item.chance || 3) - 1;
      item.chance <= 0
        ? (await conn.sendMessage(chatId, {
             text: `Kesempatan habis. Jawaban benar: ${listJawaban.join(', ')}`
           }, { quoted: msg }),
           delete db.FunctionGame[key])
        : db.FunctionGame[key] = item;
      save(db);
      return !0;
    }

    if (listJawaban.includes(jawaban)) {
      const idx = listJawaban.indexOf(jawaban);
      if (idx !== -1) rawJawaban.splice(idx, 1);
      const sisa = rawJawaban.length;
      return sisa > 0
        ? (db.FunctionGame[key] = item,
           save(db),
           await conn.sendMessage(chatId, {
             text: `Jawaban benar! Masih ada ${sisa} jawaban lagi yang belum terjawab.`
           }, { quoted: msg }),
           !0)
        : await rewardBenar(conn, msg, chatId, db, dbUser, key, user, listJawaban),
          !0;
    }

    item.chance = (item.chance || 3) - 1;
    if (item.chance <= 0)
      await conn.sendMessage(chatId, {
        text: `Kesempatan habis. Jawaban benar: ${listJawaban.join(', ')}`
      }, { quoted: msg }),
      delete db.FunctionGame[key];
    else {
      db.FunctionGame[key] = item;
      item.chance === 1
        ? (toko.pendingOrders.push({
             chance: { idKey: key, barang: 3, status: !0, id: nomor }
           }),
           saveToko(toko),
           await conn.sendMessage(chatId, {
             text: 'Kesempatan tersisa 1. Mau beli 3 kesempatan seharga Rp30.000?\nBalas *ya* untuk beli, *tidak* untuk batal.'
           }, { quoted: msg }))
        : await conn.sendMessage(chatId, {
            text: `Jawaban salah. Sisa kesempatan: ${item.chance}`
          }, { quoted: msg });
    }

    save(db);
    return !0;
  } catch (err) {
    console.error('[ERROR] handleGame:', err);
    return !1;
  }
}

async function rewardBenar(conn, msg, chatId, db, dbUser, key, user, listJawaban) {
  const bank = loadBank(),
        reward = 1e4,
        tax = parseFloat((bank.bank.tax || '0%').replace('%', '')) || 0,
        taxAmount = Math.floor(reward * tax / 100),
        final = reward - taxAmount;

  bank.bank.saldo >= reward
    ? (user.money.amount = (user.money.amount || 0) + final,
       bank.bank.saldo += taxAmount - reward,
       saveBank(bank),
       global.saveDB(dbUser),
       await conn.sendMessage(chatId, {
         text: `Selamat! Semua jawaban benar! Kamu mendapat Rp${final.toLocaleString('id-ID')}.\n(Pajak ${tax}% = Rp${taxAmount.toLocaleString('id-ID')})`
       }, { quoted: msg }))
    : await conn.sendMessage(chatId, {
        text: 'Jawaban benar, tapi saldo bank tidak cukup untuk memberikan reward.'
      }, { quoted: msg });

  delete db.FunctionGame[key];
  save(db);
}

const SysGame = {
  handleGame,
  load,
  save,
  bersih,
  loadToko,
  saveToko,
  loadBank,
  saveBank,
  loadStore,
  saveStore,
  p,
  readJSON,
  writeJSON,
  gameData: readJSON(p, { FunctionGame: {}, tca: { user: {} }, historyGame: {} }) };

export default SysGame;