var test = require('tape');
var createStore = require('../store');
var fixtures = require('./store-tests-fixtures');
var _ = require('lodash');

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
  t.plan(4)
  var store = createStore('tests/store-tests.db');

  fixtures.saveAllSprigs(store, getTree);

  function getTree(error) {
    t.ok(!error, 'Sprigs are saved without error.');

    store.getSprigsUnderRoot('test_sprig_1', checkSprigs);
  }

  function checkSprigs(error, sprigDict) {
    t.ok(!error, 'Completes without error.');
    // test_sprig_2 never connects to test_sprig_1.
    var expectedSprigs = _.omit(fixtures.sprigs.toJS(), 'test_sprig_2');
    t.deepEqual(sprigDict, expectedSprigs);
    fixtures.cleanUp(store, t);
  }
});

test('Sprigs with one level of children', function getOneLevel(t) {
  t.plan(4)
  var store = createStore('tests/store-tests.db');

  fixtures.saveAllSprigs(store, getTree);

  function getTree(error) {
    t.ok(!error, 'Sprigs are saved without error.');

    store.getSprigsUnderRoot('test_sprig_3', checkSprigs);
  }

  function checkSprigs(error, sprigDict) {
    t.ok(!error, 'Completes without error.');
    // test_sprig_2 never connects to test_sprig_1.
    var expectedSprigs = _.pick(
      fixtures.sprigs.toJS(), 'test_sprig_3', 'demo_sprig_5'
    );
    t.deepEqual(sprigDict, expectedSprigs);
    fixtures.cleanUp(store, t);
  }
});

test('Orphan trees', function orphanTrees(t) {
  t.plan(4)
  var store = createStore('tests/store-tests.db');

  fixtures.saveAllSprigs(store, getTree);

  function getTree(error) {
    t.ok(!error, 'Sprigs are saved without error.');

    store.getSprigsUnderRoot('test_sprig_2', checkSprigs);
  }

  function checkSprigs(error, sprigDict) {
    t.ok(!error, 'Completes without error.');
    // test_sprig_2 never connects to test_sprig_1.
    var expectedSprigs = _.pick(fixtures.sprigs.toJS(), 'test_sprig_2');
    t.deepEqual(sprigDict, expectedSprigs);
    fixtures.cleanUp(store, t);
  }
});
