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


test('Bad params', function badParams(t) {
  t.plan(9);

  var store = createStore('tests/store-tests.db');
  store.saveBody({}, checkSaveBodyResult);

  function checkSaveBodyResult(error) {
    t.ok(error, 'Error is passed back.');
    t.equal(
      error.message,
      'Bad body given to saveBody.',
      'The error message describes the problem.'
    );

    store.saveSprig(undefined, checkSaveSprigResult);
  }

  function checkSaveSprigResult(error) {
    t.ok(error, 'Error is passed back.');
    t.equal(
      error.message,
      'Bad sprig given to saveSprig.',
      'The error message describes the problem.'
    );

    store.getBody(undefined, checkGetBodyResult);
  }

  function checkGetBodyResult(error) {
    t.ok(error, 'Error is passed back.');
    t.equal(
      error.message,
      'Key not found in database',
      'The error message describes the problem.'
    );

    store.getSprig(undefined, checkGetSprigResult);
  }

  function checkGetSprigResult(error) {
    t.ok(error, 'Error is passed back.');
    t.equal(
      error.message,
      'Key not found in database',
      'The error message describes the problem.'
    );

    fixtures.cleanUp(store, t);
  }
  
});

test('Multiple bodies', function bodies(t) {
  t.plan(4);

  var store = createStore('tests/store-tests.db');
  fixtures.saveAllBodies(store, getBodies);

  function getBodies(error) {
    t.ok(!error, 'Saves without error.');

    store.getBodies(
      ['test_body_a', 'test_body_c', 'test_body_d'], checkGetResult
    );
  }

  function checkGetResult(error, bodies) {
    t.ok(!error, 'Gets without error.');
    t.deepEqual(
      bodies,
      _.pick(fixtures.bodies.toJS(), 'test_body_a', 'test_body_c', 'test_body_d'),
      'Correct bodies are retrieved.'
    );
    fixtures.cleanUp(store, t);
  }
});

test('Sprigs with two levels of children', function getTwoLevels(t) {
  t.plan(4);
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
  t.plan(4);
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
  t.plan(4);
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

test('Tree kit', function testTreeKit(t) {
  t.plan(6);

  var store = createStore('tests/store-tests.db');

  fixtures.saveAllSprigs(store, saveBodies);

  function saveBodies(error) {
    t.ok(!error, 'Sprigs are saved without error.');
    fixtures.saveAllBodies(store, getTree);
  }

  function getTree(error) {
    t.ok(!error, 'Sprigs are saved without error.');

    store.getTreeKit('test_sprig_3', checkSprigsAndBodies);
  }

  function checkSprigsAndBodies(error, treeKit) {
    t.ok(!error, 'Completes without error.');
    var expectedSprigs = _.pick(
      fixtures.sprigs.toJS(), 'test_sprig_3', 'demo_sprig_5'
    );
    t.deepEqual(treeKit.sprigs, expectedSprigs);

    var expectedBodies = _.pick(
      fixtures.bodies.toJS(), 'test_body_b', 'test_body_c'
    );
    t.deepEqual(treeKit.bodies, expectedBodies);
    fixtures.cleanUp(store, t);
  }
});
