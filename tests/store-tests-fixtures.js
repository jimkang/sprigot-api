var Immutable = require('immutable');
var queue = require('queue-async');
var _ = require('lodash');
var exportMethods = require('export-methods');

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

function cleanUp(store, t) {
  store.close(assertDbClosed);

  function assertDbClosed(error) {
    t.ok(!error, 'Database closed without error.');
  }
}

function saveAllSprigs(store, done) {
  var allSprigs = _.values(testSprigs.toJS());

  var q = queue();

  allSprigs.forEach(queueSave);

  function queueSave(sprig) {
    q.defer(store.saveSprig, sprig);
  }

  q.awaitAll(done);
}

module.exports = exportMethods(cleanUp, saveAllSprigs);
module.exports.sprigs = testSprigs;
module.exports.bodies = testBodies;
