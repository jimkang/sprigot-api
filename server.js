var http = require('http');
var url = require('url');
var _ = require('lodash');
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
  var headers = _.clone(defaultHeaders);
  headers['Content-Type'] = 'text/json';
  res.writeHead(200, headers);

  var stringifyThrough = createStringifyThrough();
  stringifyThrough.pipe(res);

  var jobs = JSON.parse(body);
  shunt.runSequenceGroup(jobs, stringifyThrough);

  res.on('finish', cleanUp);

  function cleanUp() {
    stringifyThrough.unpipe();
  }
}

init();
