export default {
  name: 'Eval',
  command: ['>','=>','~>'],
  tags: 'Owner Menu',
  desc: 'Mengeksekusi kode JavaScript secara langsung',
  prefix: !1,
  owner: !0,

  run: async (conn, msg, {
    chatInfo,
    args,
    commandText
  }) => {
    const { chatId } = chatInfo,
          code = args.join(' ').trim();

    if (!code) return conn.sendMessage(chatId,{text:'Harap masukkan kode JavaScript yang ingin dijalankan!'},{quoted:msg});

    try {
      let result;

      commandText === '~>' 
        ? await (async () => {
            let logs = [];
            const originalLog = console.log;
            console.log = (...v) => logs.push(v.map(x => typeof x === 'object' ? JSON.stringify(x,null,2) : String(x)).join(' '));
            result = await eval(`(async()=>{${code};})()`);
            console.log = originalLog;
            const output = [logs.join('\n'), typeof result === 'object' ? JSON.stringify(result,null,2) : String(result)].filter(Boolean).join('\n') || '✅ Kode dijalankan tanpa output.';
            return conn.sendMessage(chatId, { text: `Output:\n\`\`\`${output}\`\`\`` }, { quoted: msg });
          })()
        : commandText === '=>'
          ? result = await eval(`(async()=>{return (${code});})()`)
          : result = await eval(`(async()=>{${code};})()`);

      commandText !== '~>' && await conn.sendMessage(chatId, { 
        text: (() => {
          const output = typeof result === 'object' ? JSON.stringify(result,null,2) : String(result);
          return output && output !== 'undefined' ? output : '✅';
        })()
      }, { quoted: msg });

    } catch(err) {
      conn.sendMessage(chatId,{text:`Error: ${err.message}`},{quoted:msg});
    }
  }
};