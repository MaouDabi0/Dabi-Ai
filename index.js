import fs from 'fs'
import path from 'path'
import https from 'https'
import { fork } from 'child_process'
import { fileURLToPath, pathToFileURL } from 'url'

console.log('Starting...\n')

const __dirname = path.dirname(fileURLToPath(import.meta.url)),
      licensePath = path.join(__dirname, 'LICENSE')

fs.existsSync(licensePath)
  ? console.log(fs.readFileSync(licensePath, 'utf8') + '\n')
  : (console.log('LICENSE tidak ditemukan.'), setInterval(() => {}, 1e3))

;['session', 'temp'].forEach(d => {
  const dir = path.join(__dirname, d)
  fs.existsSync(dir) || fs.mkdirSync(dir, { recursive: !0 })
})

const remoteURL = 'https://raw.githubusercontent.com/MaouDabi0/Dabi-Ai-Documentation/main/setCfg.js',
      localFile = path.join(__dirname, 'session', 'setCfg.js'),
      downloadAndSave = (url, dest) => new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest)
        https.get(url, res => {
          if (res.statusCode !== 200) return reject(new Error(`Status code: ${res.statusCode}`))
          res.pipe(file).on('finish', () => file.close(resolve))
        }).on('error', err => {
          fs.existsSync(dest) && fs.unlinkSync(dest)
          reject(err)
        })
      }),
      start = () => {
        const child = fork(
          path.join(__dirname, 'main.js'),
          process.argv.slice(2),
          { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] }
        )
        child.on('message', msg => {
          if (msg === 'reset') return console.log('Restarting...'), child.kill()
          if (msg === 'uptime') child.send(process.uptime())
        }).on('exit', code => {
          console.log('Exited with code:', code)
          start()
        })
      }

downloadAndSave(remoteURL, localFile)
  .then(() => import(pathToFileURL(localFile).href).then(start))
  .catch(err => {
    console.error('Gagal memuat kode remote:', err)
    console.error('Tidak menjalankan start().')
  })