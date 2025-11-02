import { exec } from 'child_process'

export default {
  name: 'Shell',
  command: ['sh', '$', 'shell'],
  tags: 'Owner Menu',
  desc: 'Jalankan perintah shell',
  prefix: !1,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo,
          command = args.join(' ')
    
    return args.length===0
      ? conn.sendMessage(chatId, { text: 'Masukkan perintah shell.' }, { quoted: msg })
      : exec(command, (err, stdout, stderr) => 
          err
            ? conn.sendMessage(chatId, { text: `Error: ${err.message}` }, { quoted: msg })
            : stderr
              ? conn.sendMessage(chatId, { text: `Stderr: ${stderr}` }, { quoted: msg })
              : conn.sendMessage(chatId, { text: stdout || 'Perintah berhasil tanpa output.' }, { quoted: msg })
        )
  }
}