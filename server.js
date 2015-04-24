var http = require('http');
var url = require('url');
var _ = require('lodash');
var treegetting = require('./treegetting');
var sprigBridge = require('./d3sprigbridge');
var createStore = require('./store');
var createShunt = require('basicset-shunt');
var createStringifyThrough = require('./stringify-through');

var port = 2000;
var packageJSON = require('./package.json');
var shunt;

var defaultHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Transfer-Encoding': 'chunked'
};

function init() {
  shunt = createShunt();
  var store = createStore('db/sprigot_v2.db');
  setUpOperationsFromStore(shunt, store);
  http.createServer(takeRequest).listen(port);
  console.log('Server running at:', port);
}

function setUpOperationsFromStore(shunt, store) {
  var opNames = _.without(Object.keys(store), 'close');
  opNames.forEach(addOp);

  function addOp(opName) {
    shunt.addOperative(opName, store[opName]);
  }
}


function takeRequest(req, res) {
  var body = '';

  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end('OK');
  }
  else if (req.method === 'POST' && contentTypeIsJSON(req.headers)) {
    req.on('data', appendData);
    req.on('end', useBody);
  }
  else {
    res.writeHead(304, defaultHeaders);
    res.end('Not understood');
  }

  function appendData(data) {
    body += data;
  }

  function useBody() {
    respondToRequestWithBody(req, body, res, defaultHeaders);
  }
}

function contentTypeIsJSON(headers) {
  return 'content-type' in headers && 
    headers['content-type'].toLowerCase().indexOf('application/json') === 0;
}

function respondToRequestWithBody(req, body, res, baseHeaders) {  
  var jobs = JSON.parse(body);
  // var responded = false;

    // var resultStream = Writable({objectMode: true});
    // resultStream._write = function checkResult(result, encoding, next) {
    //   assert.ok(!result.error);
    //   assert.equal(result.value, 666);
    //   next();
    // };
    // resultStream.on('finish', testDone);
  var headers = _.clone(defaultHeaders);
  headers['Content-Type'] = 'text/json';
  res.writeHead(200, headers);
  
  // Start JSON array.
  // res.write('[\n');


  var stringifyThrough = createStringifyThrough();

  stringifyThrough.pipe(res);

  shunt.runSequenceGroup(jobs, stringifyThrough);

  // res.on('end', cleanUp);
  res.on('finish', cleanUp);

  function cleanUp() {
    stringifyThrough.unpipe();
    // End JSON array.
    // res.write(']');
    // res.end();
    debugger;
  }

  // var jobKeys = _.keys(jobs);
  // var jobCount = jobKeys.length;
  // var jobsDone = 0;
  // var responses = {};


  // function jobComplete(status, jobKey, result) {
  //   responses[jobKey] = {
  //     status: status,
  //     result: result
  //   };

  //   jobsDone = jobsDone + 1;
  //   if (jobsDone >= jobCount) {
  //     res.writeHead(200, headers);
  //     res.end(JSON.stringify(responses));
  //   }
  // }
  
  // We'll get a response for each, then write them out when we have them all.
  // Promises? Generator? Fibers? Nah, just do 'em sequentially. If any job
  // takes particularly long, write a response now, then start doing it async.

  // shunt.addOperative('getSprig', function getSprig(params, done, prevOpResult) {
  //   if (params.id && params.doc) {
  //     if (typeof params.childDepth === 'number' && params.childDepth > 0) {
  //       treegetting.getTreeFromDb(params.id, params.doc, null,
  //         params.childDepth, jobKey, jobComplete);
  //     }
  //     else {
  //       dbwrap.getSprigFromDb(params.id, params.doc, 
  //         jobKey, jobComplete);
  //     }
  //   }
  //   else {
  //     jobComplete('Not understood', jobKey, null);
  //   }
  // });


  // for (var i = 0; i < jobCount; ++i) {
  //   var jobKey = jobKeys[i];
  //   var job = jobs[jobKey];
 
  //     case 'getVersion':
  //       jobComplete('got', jobKey, packageJSON.version);
  //       break;        
  //     default:
  //       jobComplete('Not understood', jobKey, null);
  //       break;
  //   }
  // };
}

init();
