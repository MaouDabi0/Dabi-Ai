import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import AdmZip from 'adm-zip'

export default {
  name: 'updateall',
  command: ['updateall'],
  tags: 'Owner Menu',
  desc: 'Perbarui seluruh script dari repository GitHub.',
  prefix: !0,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo,
          githubUrl = args[0],
          baseDir = path.resolve(dirname, '../'),
          tempDir = path.resolve(dirname, '../temp_repo'),
          tempBackupDir = path.join(baseDir, 'temp'),
          tempBackup = path.join(tempBackupDir, `${global.botName || 'Bot'}_backup.zip`),
          configPath = path.join(baseDir, 'toolkit/set/config.json'),
          send = txt => conn.sendMessage(chatId, { text: txt }, { quoted: msg }),
          debug = txt => console.log(`[DEBUG] ${txt}`)

    if (!githubUrl) return send('Contoh penggunaan:\n.updateall https://github.com/user/repo')

    try {
      if (!fs.existsSync(tempBackupDir)) fs.mkdirSync(tempBackupDir, { recursive: !0 })

      const zip = new AdmZip()
      zip.addLocalFolder(baseDir)
      zip.writeZip(tempBackup)
      debug(`Backup selesai: ${tempBackup}`)

      if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: !0, force: !0 })
      await send('Mengkloning repository...')
      execSync(`git clone --depth=1 ${githubUrl} ${tempDir}`)
      debug('Repo berhasil dikloning')

      const localConfig = JSON.parse(fs.readFileSync(configPath, 'utf8')),
            repoConfigPath = path.join(tempDir, 'toolkit/set/config.json'),
            repoConfig = fs.existsSync(repoConfigPath) ? JSON.parse(fs.readFileSync(repoConfigPath, 'utf8')) : null

      const copyRecursive = (src, dest) => {
        let failed = 0
        for (const entry of fs.readdirSync(src, { withFileTypes: !0 })) {
          const srcPath = path.join(src, entry.name),
                destPath = path.join(dest, entry.name)
          if (srcPath === repoConfigPath) continue
          try {
            entry.isDirectory()
              ? (fs.existsSync(destPath) || fs.mkdirSync(destPath), copyRecursive(srcPath, destPath))
              : fs.copyFileSync(srcPath, destPath)
          } catch (e) { failed++; debug(`Gagal update file: ${srcPath}`) }
        }
        return failed
      }

      const failedCount = copyRecursive(tempDir, baseDir)
      fs.rmSync(tempDir, { recursive: !0, force: !0 })

      const configDiff = JSON.stringify(localConfig) !== JSON.stringify(repoConfig)
      let msgUpdate = failedCount > 0
        ? `Update selesai, ${failedCount} file gagal diupdate.\nError telah dicatat di log.`
        : 'Semua file berhasil diperbarui dari GitHub.'

      msgUpdate += configDiff
        ? '\nTerdapat perbedaan config.json antara repo dan lokal. Config tidak diperbarui.'
        : '\nTidak ada perbedaan config.json.'

      await send(msgUpdate)
      await send('Bot akan restart dalam 3 detik...')
      setTimeout(() => process.exit(1), 3000)

    } catch (err) {
      console.error('[ERROR]', err)
      send('Terjadi kesalahan saat proses update.')
    }
  }
}