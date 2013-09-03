var forever = require('forever-monitor');
var spawn = require('child_process').spawn;

var appProcess = new (forever.Monitor)('app.js', {
  killTree: true,
  options: [],
  sourceDir: '/var/www/sprigot',
  env: {},
  logFile: '/var/log/node/forever.log', 
  outFile: '/var/log/node/sprigot.log',
  errFile: '/var/log/node/sprigot_error.log'
});

appProcess.on('restart', function respondToRestart() {
  var mailstuff = spawn('./mailstuff.sh');
  var tail = spawn('tail', ['/var/log/node/sprigot.log']);
  tail.stdout.on('data', function pipeTailData(data) {
    mailstuff.stdin.write(data);
  });

  tail.on('close', function wrapItUp(code) {
    mailstuff.stdin.end();
  })
});

appProcess.start();

