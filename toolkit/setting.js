import fs from "fs";
import path from "path";
import emtData from "./transmitter.js";
import rctKey from "./reaction.js";
import readline from 'readline'
import Sys from "./helper.js";
import SysGame from "./funcGame.js";
import { fileURLToPath } from "url";

global.filename = fileURLToPath(import.meta.url);
global.dirname = path.dirname(global.filename);

global.getDirname = (metaUrl) => path.dirname(fileURLToPath(metaUrl));
global.getFilename = (metaUrl) => fileURLToPath(metaUrl);

const databasePath = "./toolkit/db/database.json",
      packageJsonPath = path.join(dirname, "../package.json"),
      settingPath = "./toolkit/set/config.json",
      gameSet = JSON.parse(fs.readFileSync(path.join(dirname, "./set/gameSetting.json"), "utf-8")),
      tokoPath = "./toolkit/set/toko.json",
      setting = JSON.parse(fs.readFileSync(settingPath, "utf-8")),
      toko = JSON.parse(fs.readFileSync(tokoPath, "utf-8")),
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")),
      rl = readline.createInterface({ input: process.stdin, output: process.stdout }),
      q = (t) => new Promise((r) => rl.question(t, r));

function readDatabase() {
  if (!fs.existsSync(databasePath)) return { Private: {} };
  return JSON.parse(fs.readFileSync(databasePath, "utf-8"));
}

global.getUserData = (userId) => {
  const database = readDatabase();
  return Object.values(database.Private).find((user) => user.Nomor === userId) || null;
};

global.premium = (userId) => {
  const userData = global.getUserData(userId);
  return userData ? userData.isPremium?.isPrem ?? false : false;
};


Object.assign(global, {
  ...Sys,
  ...emtData,
  ...SysGame,
  rctKey,
  autoBio: setting.botSetting.autoBio,
  autoTyping: setting.botSetting.autoTyping,
  autoBackup: setting.botSetting.autoBackup,
  baileys: Object.keys(packageJson.dependencies).find(dep => dep.includes('baileys')),
  bioText: setting.botSetting.bioText,
  body: setting.menuSetting.frame.body,
  botFullName: setting.botSetting.botFullName || 'Belum Diset',
  botName: setting.botSetting.botName || 'Belum Diset',
  btn: setting.menuSetting.btn,
  Cbrack: setting.menuSetting.brackets?.[1],
  chShort: setting.botSetting.sendTextLink.chshort,
  contact: setting.ownerSetting.contact,
  footer: setting.botSetting.footer,
  foot: setting.menuSetting.frame.foot,
  garis: setting.menuSetting.garis,
  HamzKey: setting.apiKey.HamzApi.key,
  HamzWeb: setting.apiKey.HamzApi.web,
  head: setting.menuSetting.frame.head,
  idCh: setting.menuSetting.idCh,
  isPrefix: setting.menuSetting.isPrefix,
  logic: setting.botSetting.logic,
  Obrack: setting.menuSetting.brackets?.[0],
  owner: setting.msg.rejectMsg.isOwner,
  ownerName: setting.ownerSetting.ownerName || 'default',
  ownerNumber: setting.ownerSetting.ownerNumber,
  ownerStore: {
    dana: setting.ownerSetting.ownerStore?.dana || 'Tidak tersedia',
    gopay: setting.ownerSetting.ownerStore?.gopay || 'Tidak tersedia',
    ovo: setting.ownerSetting.ownerStore?.ovo || 'Tidak tersedia'
  },
  packageJson,
  prem: setting.msg.rejectMsg.isPremium,
  public: setting.botSetting.public,
  readGroup: setting.botSetting.autoread?.group,
  readPrivate: setting.botSetting.autoread?.private,
  sewaList: toko.storeSetting.sewa || [],
  setting,
  side: setting.menuSetting.side,
  storeList: Object.keys(toko.storeSetting).filter(k => k !== 'sewa'),
  target: Sys.target,
  thumbnail: setting.botSetting.thumbnail,
  toko,
  type: setting.botSetting.type || 'default',
  version: packageJson.version,
  siptzKey: setting.apiKey.siputKey.web,
  termaiKey: setting.apiKey.termai.key,
  termaiWeb: setting.apiKey.termai.web,
  zellApi: setting.apiKey.zellApi.web,
  delineApi: setting.apiKey.deline.web,
  lvl: gameSet.setGame.rpg.newAccount.level,
  inv: gameSet.setGame.rpg.newAccount.inventory,
  ore: gameSet.setGame.rpg.ore,
  wood: gameSet.setGame.rpg.wood,
  q,
  rl
});

export default global;