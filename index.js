console.log('Starting...\n');

const $ = require, _0x1 = $('fs'), _0x2 = $('path'), _0x3 = $('child_process');
(function () {
  const _ = [_0x2, _0x1],
    $$ = [Buffer.from('4c4943454e5345', 'hex').toString(), 'utf8', '··───── LICENSE ─────··\n\n', '\n\n··───────────··\n', 'LICENSE tidak ditemukan. Jangan hapus file ini!'],
    $0 = _[0].join(__dirname, $$[0]),
    $1 = _[1].existsSync($0),
    $2 = console;

  $1
    ? $2.log($$[2] + _[1].readFileSync($0, $$[1]) + $$[3])
    : ($2.log($$[4]), setInterval(() => {}, 1e3));
})();

const $_$ = () => {
  const $$_ = _0x3.fork(_0x2.join(__dirname, 'main.js'), process.argv.slice(2), {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  });

  $$_.on('message', ($) => {
    if ($ === 'reset') {
      console.log('Restarting...');
      $$_.kill();
    } else if ($ === 'uptime') {
      $$_.send(process.uptime());
    }
  });

  $$_.on('exit', ($) => {
    console.log('Exited with code:', $);
    $_$();
  });
};

$_$();