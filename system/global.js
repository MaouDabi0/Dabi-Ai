import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sys from './sys.js'
import { number, makeInMemoryStore, erl } from './helper.js'
import { call, func, imgCache, groupCache } from './function.js'
import { db, gm, save, getGc } from './db/data.js'

const filename = fileURLToPath(import.meta.url),
       dirname = path.dirname(filename),
       store = makeInMemoryStore()

const config = './system/set/config.json',
      readmore = '\u200E'.repeat(4e3 + 1),
      cfg = () => JSON.parse(fs.readFileSync(config, 'utf-8')),
      getCfg = {
        prefix: () => cfg().botSetting.menuSetting.prefix,
        botName: () => cfg().botSetting.botName,
        botFullName: () => cfg().botSetting.botFullName,
        logic: () => cfg().botSetting.logic,
        head: () => cfg().botSetting.menuSetting.frame.head,
        body: () => cfg().botSetting.menuSetting.frame.body,
        foot: () => cfg().botSetting.menuSetting.frame.foot,
        opb: () => cfg().botSetting.menuSetting.brackets?.[0],
        clb: () => cfg().botSetting.menuSetting.brackets?.[1],
        line: () => cfg().botSetting.menuSetting.line,
        btn: () => cfg().botSetting.menuSetting.btn,
        idCh: () => cfg().botSetting.menuSetting.idCh,
        thumbnail: () => cfg().botSetting.menuSetting.thumbnail || imgCache.url,
        isGroup: () => cfg().botSetting.isGroup,
        ownerName: () => cfg().ownerSetting.ownerName,
        ownerNumber: () => cfg().ownerSetting.ownerNumber,
        public: () => cfg().ownerSetting.public,
        footer: () => cfg().botSetting.menuSetting.footer,
        termaiWeb: () => cfg().apikey.termai.web,
        termaiKey: () => cfg().apikey.termai.key,
      },
      gtr = {
        ...Object.fromEntries(Object.keys(getCfg).map(k => [k, getCfg[k]])),
        __cfg: Object.keys(getCfg),
        db,
        gm,
        save,
        getGc,
        filename,
        groupCache,
        dirname,
        number,
        erl,
        readmore,
        store,
        call,
        func,
        log: (...a) => console.log(...a),
        err: (...a) => console.error(...a)
      }

Object.assign(gtr, sys)

for (const k in gtr) 
  k !== '__cfg' && Object.defineProperty(global, k, {
    enumerable: true,
    configurable: true,
    get: () => gtr.__cfg.includes(k) && typeof gtr[k] === 'function'
      ? gtr[k]()
      : gtr[k]
  });

export default global