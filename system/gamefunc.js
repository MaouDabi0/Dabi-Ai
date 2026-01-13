const sfg = {
  timer: 25 * 60 * 1000,
  cost: 100,
  sleep: ms => new Promise(r => setTimeout(r, ms))
}

let runfarm = !1

async function autofarm() {
  if (runfarm) return
  runfarm = !0

  while (!0) {
    let dbsv = !1,
        gmsv = !1,
        totalFarm = 0

    try {
      const usrDb = Object.values(db().key),
            dbFarm = gm().key.farm || {}

      for (const usr of usrDb) {
        if (!usr?.game?.farm) continue

        const jid = usr.jid,
              gameDb = Object.values(dbFarm).find(v => v.jid === jid)

        if (!gameDb || (usr?.moneyDb?.moneyInBank ?? 0) > 1e8) continue

        const nowTm = global.time.timeIndo("Asia/Jakarta", "DD-MM-YYYY HH:mm:ss"),
              now = new Date(nowTm.split(' ').reverse().join(' ')),
              lastSet = gameDb?.set || nowTm,
              last = new Date(lastSet.split(' ').reverse().join(' ')),
              diff = now - last

        if (diff < sfg.timer) continue

        const exp = gameDb?.exp || 1,
              multiplier = Math.floor(exp / 10) || 1,
              cycle = Math.floor(25 / 2),
              reward = sfg.cost * multiplier * cycle

        gameDb.moneyDb.money += reward
        usr.moneyDb.moneyInBank += gameDb.moneyDb.money

        gameDb.moneyDb.money = 0
        gameDb.set = nowTm

        dbsv = !0
        gmsv = !0
        totalFarm++
      }

      if (dbsv) save.db()
      if (gmsv) save.gm()

    } catch (e) {
      err('error pada autofarm', e)
      erl(e, 'autofarm')
    }

    await sfg.sleep(sfg.timer)
  }
}

export { autofarm }