var exportMethods = require('export-methods');
var level = require('level');
var sublevel = require('level-sublevel');
var queue = require('queue-async');
var _ = require('lodash');

var levelOpts = {
  valueEncoding: 'json'
};

function createStore(dbPath) {
  var leveldb = level(dbPath, levelOpts);
  var db = sublevel(leveldb);
  var sprigs = db.sublevel('s');
  var bodies = db.sublevel('b');  

  function saveSprig(sprig, done) {
    sprigs.put(sprig.id, sprig, done);
  }

  function getSprig(id, done) {
    sprigs.get(id, done);
  }

  function saveBody(body, done) {
    bodies.put(body.id, body, done);
  }

  function getBody(id, done) {
    bodies.get(id, done);
  }

  function getBodies(ids, done) {
    var dict = {};
    var q = queue(4);
    ids.forEach(queueGet);
    q.awaitAll(bodiesToDict);

    function queueGet(id) {
      q.defer(getBody, id);
    }

    function bodiesToDict(error, bodies) {
      if (error) {
        done(error);
      }
      else {
        done(error, arrayToDict(bodies, 'id'));
      }
    }
  }

  function arrayToDict(array, idProperty) {
    var dict = {};
    array.forEach(addItemToDict);

    function addItemToDict(item) {
      dict[item[idProperty]] = item;
    }

    return dict;
  }

  function getSprigsUnderRoot(rootId, done) {
    var sprigDict = {};

    getSprigs([rootId], processNextGen);

    function processNextGen(error, currentGenSprigs) {
      if (error) {
        done(error);
      }
      else {
        currentGenSprigs.forEach(saveToDict);
        var nextGenIds = getAllChildIdsFromSprigs(currentGenSprigs);

        if (nextGenIds.length > 0) {
          var visitedIds = Object.keys(sprigDict);
          nextGenIds = _.without.apply(_, [nextGenIds].concat(visitedIds));
          getSprigs(nextGenIds, processNextGen);
        }
        else {
          done(error, sprigDict);
        }
      }
    }

    function saveToDict(sprig) {
      sprigDict[sprig.id] = sprig;
    }
  }

  function getSprigs(ids, done) {
    var q = queue(4);
    ids.forEach(queueChildGet);
    q.awaitAll(done);

    function queueChildGet(childId) {
      q.defer(getSprig, childId);
    }
  }

  function getAllChildIdsFromSprigs(sprigs) {
    return _.compact(_.flatten(_.pluck(sprigs, 'children')));
  }

  function getTreeKit(rootId, done) {
    getSprigsUnderRoot(rootId, getBodiesForSprigs);

    function getBodiesForSprigs(error, sprigs) {
      if (error) {
        done(error);
      }
      else {
        var bodyIds = _.pluck(_.values(sprigs), 'body');
        getBodies(bodyIds, packageKit);
      }

      function packageKit(error, bodies) {
        if (error) {
          done(error);
        }
        else {
          var kit = {
            sprigs: sprigs,
            bodies: bodies
          };
          done(error, kit);
        }
      }
    }
  }

  function close(done) {
    sprigs.close(closeBodies);

    function closeBodies(error) {
      if (error) {
        done(error);
      }
      else {
        closeDb(error, done);
      }
    }

    function closeDb(error, done) {
      if (error) {
        done(error);
      }
      else {
        leveldb.on('closed', actualDbCloseDone);
        leveldb.close();
      }

      function actualDbCloseDone(error) {
        // console.log('db.isClosed()', leveldb.isClosed());
        leveldb.removeListener('closed', actualDbCloseDone);
        done(error);
      }
    }
  }

  return exportMethods(
    saveSprig,
    getSprig,
    saveBody,
    getBody,
    getBodies,
    getSprigsUnderRoot,
    getTreeKit,
    close
  );
}

module.exports = createStore;
