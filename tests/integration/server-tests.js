var test = require('tape');
var request = require('request');

// Tests depend on the server running. Use the test-integration make target to run this test.

var baseURL = 'http://localhost:2000';

test('Just save', function justSave(t) {
  t.plan(1);

  var requestOpts = {
    url: baseURL,
    method: 'POST',
    json: true,
    body: [
      [
        {
          id: 'save-1',
          op: 'saveSprig',
          params: {
            id: 'server-sprig-1',
            title: 'Server Sprig 1',
            tags: [
              'server',
              'one'
            ],
            body: 'This is the body of sprig 1.',
            children: [
              'demo_sprig_5'
            ]
          }
        }
      ]
    ]
  };

  request(requestOpts, checkResponse);

  function checkResponse(error, response, body) {
    t.ok(!error, 'Request completes without error');
    if (error) {
      console.log(error);
    }
    console.log(body);
  }
});

test('Just save, then get', function justSave(t) {
  t.plan(1);

  var requestOpts = {
    url: baseURL,
    method: 'POST',
    json: true,
    body: [
      [
        {
          id: 'save-2',
          op: 'saveSprig',
          params: {
            id: 'server-sprig-2',
            title: 'Server Sprig 2',
            tags: [
              'server',
              'one'
            ],
            body: 'This is the body of sprig 2!',
            children: [
              'demo_sprig_4'
            ]
          }
        },
        {
          id: 'get-2',
          op: 'getSprig',
          params:'server-sprig-2'
        },
      ]
    ]
  };

  request(requestOpts, checkResponse);

  function checkResponse(error, response, body) {
    t.ok(!error, 'Request completes without error');
    if (error) {
      console.log(error);
    }
    console.log(body);
  }
});

