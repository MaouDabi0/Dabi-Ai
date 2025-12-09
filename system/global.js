import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'
import sys from './sys.js'
import { number } from './helper.js'
import { call, func } from './function.js'
import getMessageContent from './msg.js'
import { db, saveDb } from './db/data.js'

const filename = fileURLToPath(import.meta.url),
       dirname = path.dirname(filename);

const config = './system/set/config.json',
      readmore = '\u200E'.repeat(4e3 + 1),
      cfg = JSON.parse(fs.readFileSync(config, 'utf-8')),
      rl = readline.createInterface({ input: process.stdin, output: process.stdout }),
      q = (t) => new Promise((r) => rl.question(t, r));

Object.assign(global, {
  ...sys,
  db,
  saveDb,
  number,
  filename,
  dirname,
  readmore,
  call,
  func,
  getMessageContent,
  prefix: cfg.botSetting.menuSetting.prefix,
  botName: cfg.botSetting.botName,
  botFullName: cfg.botSetting.botFullName,
  logic: cfg.botSetting.logic,
  head: cfg.botSetting.menuSetting.frame.head,
  body: cfg.botSetting.menuSetting.frame.body,
  foot: cfg.botSetting.menuSetting.frame.foot,
  opb: cfg.botSetting.menuSetting.brackets?.[0],
  clb: cfg.botSetting.menuSetting.brackets?.[1],
  line: cfg.botSetting.menuSetting.line,
  btn: cfg.botSetting.menuSetting.btn,
  idCh: cfg.botSetting.menuSetting.idCh,
  thumbnail: cfg.botSetting.menuSetting.thumbnail,
  isGroup: cfg.botSetting.isGroup,
  ownerName: cfg.ownerSetting.ownerName,
  public: cfg.ownerSetting.public,
  ownerNumber: cfg.ownerSetting.ownerNumber,
  footer: cfg.botSetting.menuSetting.footer,
  termaiWeb: cfg.apikey.termai.web,
  termaiKey: cfg.apikey.termai.key,
  log: console.log,
  err: console.error,
  rl,
  q
})

export default global