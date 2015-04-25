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

test('Handle bad ops', function badOps(t) {
  t.plan(2);

  var requestOpts = {
    url: baseURL,
    method: 'POST',
    json: true,
    body: [
      [
        {
          id: 'save_bad',
          op: 'saveSprig',
          params: undefined
        }
      ]
    ]
  };

  var checkStream = fixtures.createCheckStream({
    t: t,
    expectedResults: [
      {
        id: 'save_bad',
        error: {
          message: 'Bad sprig given to saveSprig.'
        }
      }
    ]
  });

  request(requestOpts)
    .on('error', checkError)
    .pipe(checkStream);  

  function checkError(error) {
    t.ok(!error, 'Completes without an http error.');
  }
});


test('Get a tree', function getATree(t) {
  t.plan(10);

  var requestOpts = {
    url: baseURL,
    method: 'POST',
    json: true,
    body: [
      [
        {
          id: 'save_3_1',
          op: 'saveSprig',
          params: fixtures.sprigs.get('tree').tree_sprig_1
        },
        {
          id: 'save_3_3',
          op: 'saveSprig',
          params: fixtures.sprigs.get('tree').tree_sprig_3
        },
        {
          id: 'save_3_4',
          op: 'saveSprig',
          params: fixtures.sprigs.get('tree').tree_sprig_4
        },
        {
          id: 'save_3_5',
          op: 'saveSprig',
          params: fixtures.sprigs.get('tree').tree_sprig_5
        },
        {
          id: 'save_3_a',
          op: 'saveBody',
          params: fixtures.bodies.get('tree').tree_body_a
        },
        {
          id: 'save_3_b',
          op: 'saveBody',
          params: fixtures.bodies.get('tree').tree_body_b
        },
        {
          id: 'save_3_c',
          op: 'saveBody',
          params: fixtures.bodies.get('tree').tree_body_c
        },
        {
          id: 'save_3_d',
          op: 'saveBody',
          params: fixtures.bodies.get('tree').tree_body_d
        },

        {
          id: 'get_tree_3',
          op: 'getTreeKit',
          params: 'tree_sprig_1'
        }
      ]
    ]
  };

  var checkStream = fixtures.createCheckStream({
    t: t,
    expectedResults: [
      {
        id: 'save_3_1',
        error: null
      },
      {
        id: 'save_3_3',
        error: null
      },
      {
        id: 'save_3_4',
        error: null
      },
      {
        id: 'save_3_5',
        error: null
      },
      {
        id: 'save_3_a',
        error: null
      },
      {
        id: 'save_3_b',
        error: null
      },
      {
        id: 'save_3_c',
        error: null
      },
      {
        id: 'save_3_d',
        error: null
      },
      {
        id: 'get_tree_3',
        error: null,
        value: {
          sprigs: fixtures.sprigs.get('tree'),
          bodies: fixtures.bodies.get('tree'),
        }
      }
    ]
  });

  request(requestOpts)
    .on('error', fixtures.failOnError)
    .pipe(checkStream);
});
