var exportMethods = require('export-methods');
var level = require('level');
var sublevel = require('level-sublevel');

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

  function close(done) {
    sprigs.close(closeBodies)

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
    close
  );
}

module.exports = createStore;
