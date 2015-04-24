var test = require('tape');
var request = require('request');
var fixtures = require('./server-tests-fixtures');

// Tests depend on the server running. Use the test-integration make target to run this test.

var baseURL = 'http://localhost:2000';

test('Just save', function justSave(t) {
  t.plan(2);

  var requestOpts = {
    url: baseURL,
    method: 'POST',
    json: true,
    body: [
      [
        {
          id: 'save_1',
          op: 'saveSprig',
          params: fixtures.sprigs.get('server_sprig_1')
        }
      ]
    ]
  };

  var checkStream = fixtures.createCheckStream({
    t: t,
    expectedResults: [
      {
        id: 'save_1',
        error: null
      }
    ]
  });

  request(requestOpts)
    .on('error', fixtures.failOnError)
    .pipe(checkStream);  
});

test('Just save, then get', function saveThenGet(t) {
  t.plan(3);

  var requestOpts = {
    url: baseURL,
    method: 'POST',
    json: true,
    body: [
      [
        {
          id: 'save_2',
          op: 'saveSprig',
          params: fixtures.sprigs.get('server_sprig_2')
        },
        {
          id: 'get_2',
          op: 'getSprig',
          params:'server_sprig_2'
        },
      ]
    ]
  };

  var checkStream = fixtures.createCheckStream({
    t: t,
    expectedResults: [
      {
        id: 'save_2',
        error: null
      },
      {
        id: 'get_2',
        error: null,
        value: fixtures.sprigs.get('server_sprig_2')
      }      
    ]
  });

  request(requestOpts)
    .on('error', fixtures.failOnError)
    .pipe(checkStream);

});
