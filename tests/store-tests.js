var test = require('tape');
var createStore = require('../store');
var fixtures = require('./store-tests-fixtures');

test('Basic sprig', function basicSprig(t) {
  t.plan(4);

  var store = createStore('tests/store-tests.db');
  store.saveSprig(fixtures.sprigs.get('test_sprig_1'), checkSaveResult);

  function checkSaveResult(error) {
    t.ok(!error, 'Saves without error.');

    store.getSprig('test_sprig_1', checkGetResult);
  }

  function checkGetResult(error, sprig) {
    t.ok(!error, 'Gets without error.');
    t.deepEqual(sprig, fixtures.sprigs.get('test_sprig_1'));
    fixtures.cleanUp(store, t);
  }
});

test('Basic body', function basicBody(t) {
  t.plan(4);

  var store = createStore('tests/store-tests.db');
  store.saveBody(fixtures.bodies.get('test_body_a'), checkSaveResult);

  function checkSaveResult(error) {
    t.ok(!error, 'Saves without error.');

    store.getBody('test_body_a', checkGetResult);
  }

  function checkGetResult(error, body) {
    t.ok(!error, 'Gets without error.');
    t.deepEqual(
      body, fixtures.bodies.get('test_body_a'), 'Correct body is retrieved.'
    );
    fixtures.cleanUp(store, t);
  }
});

test('Sprigs with two levels of children', function getTwoLevels(t) {
  t.plan(2)
  var store = createStore('tests/store-tests.db');

  fixtures.saveAllSprigs(store, getTree);

  function getTree(error) {
    t.ok(!error, 'Sprigs are saved without error.');

    fixtures.cleanUp(store, t);
  }
});
