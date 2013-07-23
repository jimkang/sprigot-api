var http = require('http');
var url = require('url');

var caseDataSource = require('./client/caseData');
var port = 80;

if (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'dev') {
  port = 3000;
}


http.createServer(function takeRequest(req, res) {
  if ('content-type' in req.headers && req.method === 'POST' &&
    req.headers['content-type'].toLowerCase() === 'application/json') {
      debugger;
      var body = '';

      req.on('data', function (data) {
        body += data;
      });

      req.on('end', function doneReadingData() {
        var ops = JSON.parse(body);
        var responded = false;
        // TODO: Batch together responses to each op.
        ops.forEach(function runOp(op) {
          switch (op.opname) {
            case 'getSprig':
              // debugger;
              if (op.params.sprigId === 'sprig1') {
                res.writeHead(200, {'Content-Type': 'text/json'});
                res.end(JSON.stringify(caseDataSource));
                responded = true;
              }
              break;
            default:
              break;
          }
        });
        if (!responded) {
          respondThatReqWasNotUnderstood(res);
        }
      });
  }
  else {
    respondThatReqWasNotUnderstood(res);
  }

})
.listen(port, '127.0.0.1');

function respondThatReqWasNotUnderstood(res) {
  res.writeHead(404, {'Content-Type': 'text/json'});
  res.end('[{"error": "whut"}]');
}

console.log('Server running at http://127.0.0.1:' + port);

