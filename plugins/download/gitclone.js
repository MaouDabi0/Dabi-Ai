import fetch from 'node-fetch'

export default {
  name: 'gitclone',
  command: ['git', 'gitclone'],
  tags: 'Download Menu',
  desc: 'Download repository GitHub dalam bentuk .zip',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo,
          url = args.join(' ')

    if (!url || !/^https?:\/\/.*github\.com/.test(url))
      return conn.sendMessage(chatId, { 
        text: !url 
          ? `Where is the link?\nExample:\n${prefix}${commandText} https://github.com/MaouDabi0/Dabi-Ai`
          : `Link invalid!!` 
      }, { quoted: msg })

    await conn.sendMessage(chatId, { react: { text: '⏳', key: msg.key } })

    try {
      const match = url.match(/github\.com\/([^\/]+)\/([^\/\s]+)/)
      if (!match) return conn.sendMessage(chatId, { text: 'Invalid GitHub link.' }, { quoted: msg })

      const [_, user, repoRaw] = match,
            repo = repoRaw.replace(/\.git$/, ''),
            zipUrl = `https://api.github.com/repos/${user}/${repo}/zipball`,
            head = await fetch(zipUrl, { method: 'HEAD' }),
            fileName = head.headers.get('content-disposition')?.match(/filename=(.*)/)?.[1]

      return fileName
        ? await conn.sendMessage(chatId, { 
            document: { url: zipUrl }, 
            fileName: fileName + '.zip', 
            mimetype: 'application/zip' 
          }, { quoted: msg })
        : conn.sendMessage(chatId, { text: 'Failed to get file info.' }, { quoted: msg })

    } catch (e) {
      console.error('[ERROR gitclone]', e)
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mendownload repository.' }, { quoted: msg })
    }
  }
}