const fs = require('fs');
const path = require('path');
const Sys = require('./helper');

const settingPath = './toolkit/set/config.json';
const tokoPath = './toolkit/set/toko.json';
const databasePath = './toolkit/db/database.json';
const packageJsonPath = path.join(__dirname, '../package.json');
const emtData = require('./transmitter.js');
const reactId = require('./reaction.js');

const setting = JSON.parse(fs.readFileSync(settingPath, 'utf-8'));
const toko = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

function readDatabase() {
    if (!fs.existsSync(databasePath)) return { Private: {} };
    return JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
}

global.getUserData = (userId) => {
    const database = readDatabase();
    return Object.values(database.Private).find(user => user.Nomor === userId) || null;
};

global.premium = (userId) => {
    const userData = global.getUserData(userId);
    return userData ? userData.premium?.prem ?? false : false;
};

global.isOwner = Sys.chkOwner;
global.isPrem = Sys.chkPrem;
global.intDB = Sys.intDB;
global.readDB = Sys.readDB;
global.saveDB = Sys.saveDB;
global.enGcW = Sys.enGcW;
global.enGcL = Sys.enGcL;
global.getWlcTxt = Sys.getWelcTxt;
global.getLftTxt = Sys.getLeftTxt;
global.stGcW = Sys.stGcW;
global.stGcL = Sys.stGcL;
global.updateBio = Sys.updateBio;
global.exCht = Sys.exCht;
global.getUser = Sys.getUser;
global.gcData = Sys.getGrpDB;
global.parseMessage = Sys.parseMessage;
global.parseNoPrefix = Sys.parseNoPrefix;
global.chtEmt = Sys.chtEmt;
global.stGrup = Sys.exGrp;
global.Format = Sys.Format;
global.ai = emtData.ai;
global.mtData = emtData.mtData;
global.gtMJid = emtData.gtMention;
global.gbLink = emtData.gbLink;
global.tryFree = emtData.tryPrem;
global.translate = emtData.translate;
global.rctKey = reactId.rctKey;
global.gcFilter = emtData.gcFilter;
global.calNumber = emtData.colNumb;
global.bdWrd = emtData.bdWord;
global.afkCencel = emtData.afkCencel;
global.afkTgR = emtData.afkTgR;

Object.assign(global, {
    target: Sys.target,
    setting,
    toko,
    Obrack: setting.menuSetting.brackets?.[0],
    Cbrack: setting.menuSetting.brackets?.[1],
    head: setting.menuSetting.frame.head,
    body: setting.menuSetting.frame.body,
    foot: setting.menuSetting.frame.foot,
    btn: setting.menuSetting.btn,
    garis: setting.menuSetting.garis,
    side: setting.menuSetting.side,
    type: setting.botSetting.type || 'default',
    footer: setting.botSetting.footer,
    thumbnail: setting.botSetting.thumbnail || '',
    botFullName: setting.botSetting.botFullName || 'Belum Diset',
    botName: setting.botSetting.botName || 'Belum Diset',
    isPrefix: setting.menuSetting.isPrefix,
    ownerName: setting.ownerSetting.ownerName || 'default',
    ownerNumber: setting.ownerSetting.ownerNumber,
    contact: setting.ownerSetting.contact,
    chshort: setting.botSetting.sendTextLink.chshort,
    readGroup: setting.botSetting.autoread?.group,
    readPrivate: setting.botSetting.autoread?.private,
    autoTyping: setting.botSetting.autoTyping,
    autoBio: setting.botSetting.autoBio,
    public: setting.botSetting.public,
    logic: setting.botSetting.logic,
    mode: setting.botSetting.Mode,
    sewaList: toko.storeSetting.sewa || [],
    storeList: Object.keys(toko.storeSetting).filter(k => k !== 'sewa'),
    owner: setting.msg.rejectMsg.isOwner,
    prem: setting.msg.rejectMsg.isPremium,
    zellApi: setting.apiKey.zellApi.web,
    ytKey: setting.apiKey.ytKey.key,
    siptzKey: setting.apiKey.siputKey.web,

    ownerStore: {
        dana: setting.ownerSetting.ownerStore?.dana || 'Tidak tersedia',
        gopay: setting.ownerSetting.ownerStore?.gopay || 'Tidak tersedia',
        ovo: setting.ownerSetting.ownerStore?.ovo || 'Tidak tersedia'
    },

    version: packageJson.version,
    baileys: Object.keys(packageJson.dependencies).find(dep => dep.includes('baileys'))
});

module.exports = { ...global };