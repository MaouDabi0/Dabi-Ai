import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

const file = path.join(dirname, '../db/jadwalsolat.json')

async function getJadwal(city = 'Jakarta', country = 'Indonesia', date = null) {
  try {
    const method = 11,
          now = new Date(),
          tgl = date || `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`,
          url = `https://api.aladhan.com/v1/timingsByCity/${tgl}?city=${city}&country=${country}&method=${method}`,
          res = await fetch(url),
          json = await res.json()
    if (json.code !== 200) throw new Error('Gagal ambil jadwal')

    const d = json.data,
          out = {
            lokasi: `${city}, ${country}`,
            tanggal: d.date.readable,
            hijri: `${d.date.hijri.day} ${d.date.hijri.month.en} ${d.date.hijri.year} H`,
            waktu: d.timings
          }

    saveDB(out)
    return out
  } catch (e) {
    console.error('Error getJadwal:', e.message)
    return null
  }
}

function saveDB(data) {
  try {
    const dir = path.dirname(file),
          dbData = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : {}
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: !0 })
    dbData.responApi = data
    fs.writeFileSync(file, JSON.stringify(dbData, null, 2))
  } catch (e) {
    console.error('Error saveDB:', e.message)
  }
}

export default getJadwal