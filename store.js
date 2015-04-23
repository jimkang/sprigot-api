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

  return exportMethods(
    saveSprig,
    getSprig
  );
}

module.exports = createStore;
