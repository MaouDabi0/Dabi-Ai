import fetch from 'node-fetch'

export default {
  name: 'elevenlabs',
  command: ['elevenlabs'],
  tags: 'Fun Menu',
  desc: 'Text to speech ElevenLabs',
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
          voiceList = [
            'prabowo',
            'yanzgpt',
            'bella',
            'megawati',
            'echilling',
            'adam',
            'thomas_shelby',
            'michi_jkt48',
            'nokotan',
            'jokowi',
            'boboiboy',
            'keqing',
            'anya',
            'yanami_anna',
            'MasKhanID',
            'Myka',
            'raiden',
            'CelzoID',
            'dabi'
          ];

    if (args.length < 2) {
      const voiceText = voiceList.map(v => `- ${v}`).join('\n'),
            txt = `Format salah.\n\nGunakan: ${prefix}${commandText} <voice> <text>\n\nDaftar voice:\n${voiceText}`;
      return conn.sendMessage(chatId, { text: txt }, { quoted: msg });
    }

    const [voiceRaw, ...textParts] = args,
          voice = voiceRaw.toLowerCase(),
          text = textParts.join(' ');

    if (!voiceList.includes(voice))
      return conn.sendMessage(chatId, { text: `Voice tidak dikenal.\nKetik ${prefix}${commandText} untuk melihat daftar voice.` }, { quoted: msg });

    try {
      const pitch = 0, speed = .9,
            url = `${termaiWeb}/api/text2speech/elevenlabs?text=${encodeURIComponent(text)}&voice=${voice}&pitch=${pitch}&speed=${speed}&key=${termaiKey}`,
            res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const audio = Buffer.from(await res.arrayBuffer());
      await vn(conn, chatId, audio, msg);
    } catch (e) {
      console.error(e),
      conn.sendMessage(chatId, { text: 'Gagal membuat suara.' }, { quoted: msg });
    }
  }
};