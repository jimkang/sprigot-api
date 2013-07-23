var http = require('http');
var url = require('url');

var caseDataSource = require('./client/caseData');
var port = 80;

if (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'dev') {
  port = 3000;
}


http.createServer(function takeRequest(req, res) {
  debugger;
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end('OK');
  }
  else if ('content-type' in req.headers && req.method === 'POST' &&
    req.headers['content-type'].toLowerCase() === 'application/json') {
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
                headers['Content-Type'] = 'text/json';
                res.writeHead(200, headers);
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

