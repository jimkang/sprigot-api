var http = require('http');
var url = require('url');
var levelup = require('level');

var caseDataSource = require('./client/caseData');
var port = 80;

if (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'dev') {
  port = 3000;
}

var db = levelup('./db/sprigot.db');

http.createServer(function takeRequest(req, res) {
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
      respondToRequestWithBody(req, body, res, headers, 
        function done(error, result) {
          if (error) {
            reportError(error);
          }
          else if (!result) {
            respondThatReqWasNotUnderstood(res);
          }
        }
      );
    });
  }
  else {
    respondThatReqWasNotUnderstood(res);
  }
})
.listen(port, '127.0.0.1');


// done's result param will be true if it responded.
function respondToRequestWithBody(req, body, res, headersThusFar, done) {  
  var ops = JSON.parse(body);
  var responded = false;
  // TODO: Batch together responses to each op. Require hash instead of 
  // array as top level wrapper. Require unique ids for each op.
  // Or should I? Maybe just order results in the order of the requests?
  // The requests aren't going to finish in order, though.
  ops.forEach(function runOp(op) {
    switch (op.opname) {
      case 'getSprig':
        if (op.params.sprigId === 'sprig1') {
          headersThusFar['Content-Type'] = 'text/json';
          res.writeHead(200, headersThusFar);
          res.end(JSON.stringify(caseDataSource));
          done(null, true);
        }
        else {
          done(null, false);
        }
        break;
      case 'postSprig': 
        if (op.params.sprigId) {
          db.put(op.params.sprigId, op.params.sprigContents, 
            function putDbDone(error) {
              if (error) {
                done(error, false);
              }
              else {
                res.writeHead(200, headersThusFar);
                res.end(JSON.stringify([
                  {
                    id: op.id,
                    status: 'posted',
                    info: {
                      sprigId: 'sprig2'
                    }                    
                  }
                ]));
                done(null, true);
              }
            }
          );
        }
        else {
          done(null, false);
        }
        break;            
      default:
        break;
        done(null, false);
    }

  });
}

function respondThatReqWasNotUnderstood(res) {
  debugger;
  res.writeHead(404, {'Content-Type': 'text/json'});
  res.end('[{"error": "whut"}]');
}

function reportError(error, res) {
  res.writeHead(500, {'Content-Type': 'text/plain'});
  res.end('Internal server error: ' + error);
}

console.log('Server running at http://127.0.0.1:' + port);

