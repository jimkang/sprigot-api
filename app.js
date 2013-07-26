var http = require('http');
var url = require('url');
var levelup = require('level');
var _ = require('underscore');

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
      respondToRequestWithBody(req, body, res, headers);
    });
  }
  else {
    respondThatReqWasNotUnderstood(res);
  }
})
.listen(port, '127.0.0.1');


function respondToRequestWithBody(req, body, res, baseHeaders) {  
  var jobs = JSON.parse(body);
  var responded = false;
  var jobKeys = _.keys(jobs);
  var jobCount = jobKeys.length;
  var jobsDone = 0;
  var responses = {};

  var headers = _.clone(baseHeaders);
  headers['Content-Type'] = 'text/json';
  debugger;

  function jobComplete(status, jobKey, result) {
    debugger;
    responses[jobKey] = {
      status: status,
      result: result
    };

    jobsDone = jobsDone + 1;
    if (jobsDone >= jobCount) {
      res.writeHead(200, headers);
      res.end(JSON.stringify(responses));
    }
  }
  
  // We'll get a response for each, then write them out when we have them all.
  // Promises? Generator? Fibers? Nah, just do 'em sequentially. If any job
  // takes particularly long, write a response now, then start doing it async.
  for (var i = 0; i < jobCount; ++i) {
    var jobKey = jobKeys[i];
    var job = jobs[jobKey];
    switch (job.op) {
      case 'getSprig':        
        if (job.params.sprigId === 'sprig1') {
          jobComplete('Found', jobKey, caseDataSource);
        }
        else {
          jobComplete('Not found', jobKey, null);
        }
        break;
      case 'postSprig':
        if (job.params.sprigId) {
          var savedJobKey = jobKey;
          var savedJob = job;
          db.put(job.params.sprigId, job.params.sprigContents, 
            function putDbDone(error) {
              if (error) {
                jobComplete('Database error', savedJobKey, error);
              }
              else {
                jobComplete('posted', savedJobKey, {
                  sprigId: savedJob.params.sprigId
                });
              }
            }
          );
        }
        else {
          jobComplete('Not understood', jobKey, null);
        }
        break;
      default:
        jobComplete('Not understood', jobKey, null);
        break;
    }
  };
}

console.log('Server running at http://127.0.0.1:' + port);
