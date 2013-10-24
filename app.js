var http = require('http');
var url = require('url');
var _ = require('underscore');
var dbwrap = require('./dbwrap');
var treegetting = require('./treegetting');
var sprigBridge = require('./client/d3sprigbridge');
var port = 3000;

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
    req.headers['content-type'].toLowerCase()
    .indexOf('application/json') === 0) {

    var body = '';

    req.on('data', function (data) {
      body += data;
    });

    req.on('end', function doneReadingData() {
      respondToRequestWithBody(req, body, res, headers);
    });
  }
  else {
    res.writeHead(304, headers);
    res.end('Not understood');
  }
})
.listen(port);


function respondToRequestWithBody(req, body, res, baseHeaders) {  
  var jobs = JSON.parse(body);
  var responded = false;
  var jobKeys = _.keys(jobs);
  var jobCount = jobKeys.length;
  var jobsDone = 0;
  var responses = {};

  var headers = _.clone(baseHeaders);
  headers['Content-Type'] = 'text/json';

  function jobComplete(status, jobKey, result) {
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
        if (job.params.id && job.params.doc) {
          if (typeof job.params.childDepth === 'number' && 
            job.params.childDepth > 0) {

            treegetting.getTreeFromDb(job.params.id, job.params.doc, 
              job.params.childDepth, jobKey, jobComplete);
          }
          else {
            dbwrap.getSprigFromDb(job.params.id, job.params.doc, 
              jobKey, jobComplete);
          }
        }
        else {
          jobComplete('Not understood', jobKey, null);
        }
        break;
      case 'saveSprig':
        if (job.params.id && job.params.doc) {
          dbwrap.saveSprigToDb(job.params, jobKey, jobComplete);
        }
        else {
          jobComplete('Not understood', jobKey, null);
        }
        break;
      case 'deleteSprig':
        if (job.params.id && job.params.doc) {
          dbwrap.deleteSprigFromDb(job.params, jobKey, jobComplete);
        }
        else {
          jobComplete('Not understood', jobKey, null);
        }
        break;
      case 'saveDoc':
        if (job.params.id) {
          dbwrap.saveDocToDb(job.params, jobKey, jobComplete);
        }
        else {
          jobComplete('Not understood', jobKey,  null);
        }
        break;
      case 'getDoc':
        if (job.params.id) {
          if (typeof job.params.childDepth !== 'number') {
            job.params.childDepth = 100;
          }

          dbwrap.getDocFromDb(job.params.id, jobKey, 
            function gotDoc(status, jobKey, doc) {
              if (status !== 'got') {
                jobComplete(status, jobKey, doc);
              }
              else {
                // TODO: Check to see if doc has limited readers.
                treegetting.getTreeFromDb(doc.rootSprig, doc.id, 
                  job.params.childDepth, jobKey, 
                  function gotTree(status, jobKey, tree) {
                    if (job.params.flatten) {
                      doc.sprigList = sprigBridge.flattenTreeBreadthFirst(
                        tree, job.params.childDepth
                      );
                    }
                    else {
                      doc.sprigTree = tree;
                    }
                    jobComplete(status, jobKey, doc);
                  }
                );
              }
            }
          );
        }
        else {
          jobComplete('Not understood', jobKey,  null);
        }
        break; 
      default:
        jobComplete('Not understood', jobKey, null);
        break;
    }
  };
}


console.log('Server running at:', port);

