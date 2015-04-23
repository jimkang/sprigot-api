var test = require('tape');
var createStore = require('../store');
var randomId = require('idmaker').randomId;
var Immutable = require('immutable');

var testSprigs = Immutable.Map({
  // Has two children.
  test_sprig_1: {
    id: 'test_sprig_1',
    title: 'Test Sprig 1',
    tags: [
      'test',
      'one'
    ],
    body: 'test_body_a',
    children: [
      'test_sprig_3',
      'test_sprig_4'
    ]
  },
  // Has no children, shares a body with demo_sprig_5.
  test_sprig_2: {
    id: 'test_sprig_2',
    title: 'Test Sprig 2',
    tags: [
      'test',
      'two'
    ],
    body: 'test_body_b',
    children: []
  },
  // Has one child.
  test_sprig_3: {
    id: 'test_sprig_3',
    title: 'Test Sprig 1',
    tags: [
      'test',
      'three'
    ],
    body: 'test_body_c',
    children: [
      'demo_sprig_5'
    ]
  },
  // Has no children.
  test_sprig_4: {
    id: 'test_sprig_4',
    title: 'Test Sprig 4',
    tags: [
      'test',
      'four'
    ],
    body: 'test_body_d',
    children: []
  },
  // Does not have the 'test' tag; shares a body with test_sprig_2.
  demo_sprig_5: {
    id: 'demo_sprig_5',
    title: 'Demo Sprig 5',
    tags: [
      'demo',
      'five'
    ],
    body: 'test_body_b',
    children: []
  }
});

var testBodies = Immutable.Map({
  test_body_a: {
    id: 'test_body_a',
    fragment: '<i>This</i> is a body labeled "a".'
  },
  test_body_b: {
    id: 'test_body_b',
    fragment: 'Body B!'
  },
  test_body_c: {
    id: 'test_body_c',
    fragment: '<p>This is test body C.</p>'
  },
  test_body_d: {
    id: 'test_body_d',
    fragment: '<h2>D!</h2>'
  }
});

test('Basic sprig', function basicSprig(t) {
  t.plan(4);

  var store = createStore('tests/store-tests.db');
  store.saveSprig(testSprigs.get('test_sprig_1'), checkSaveResult);

  function checkSaveResult(error) {
    t.ok(!error, 'Saves without error.');

    store.getSprig('test_sprig_1', checkGetResult);
  }

  function checkGetResult(error, sprig) {
    t.ok(!error, 'Gets without error.');
    t.deepEqual(sprig, testSprigs.get('test_sprig_1'));
    store.close(assertDbClosed);
  }

  function assertDbClosed(error) {
    t.ok(!error, 'Database closed without error.');
  }
});

test('Basic body', function basicBody(t) {
  t.plan(4);

  var store = createStore('tests/store-tests.db');
  store.saveBody(testBodies.get('test_body_a'), checkSaveResult);

  function checkSaveResult(error) {
    t.ok(!error, 'Saves without error.');

    store.getBody('test_body_a', checkGetResult);
  }

  function checkGetResult(error, body) {
    t.ok(!error, 'Gets without error.');
    t.deepEqual(
      body, testBodies.get('test_body_a'), 'Correct body is retrieved.'
    );
    store.close(assertDbClosed);
  }

  function assertDbClosed(error) {
    t.ok(!error, 'Database closed without error.');
  }
});
