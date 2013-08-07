var levelup = require('level');

var db = levelup('./db/sprigot.db', {
  valueEncoding: 'json'
});

var nsDelimiter = '\x00';

function getSprigFromDb(id, docId, jobKey, jobComplete) {
  var key = getSprigKey(id, docId);

  db.get(key, function getFromDbDone(error, value) {
    if (error) {
      if (error.name === 'NotFoundError') {
        jobComplete('Not found', jobKey, []);
      }
      else {
        jobComplete('Database error', jobKey, error);
      }
    }
    else {
      jobComplete('got', jobKey, value);
    }
  });
}

function getSprigTreeFromDb(id, docId, childDepth, jobKey, jobComplete) {
  treegetting.getTree(db, id, childDepth, 
    function done(errors, value) {
      if (errors.length > 0) {
        jobComplete('Errors while getting tree', jobKey, errors);
      }
      else {
        jobComplete('got', jobKey, value);
      }
    }
  );
}

function saveSprigToDb(sprigParams, jobKey, jobComplete) {
  var key = getSprigKey(sprigParams.id, sprigParams.doc);
  db.put(key, sprigParams, function putDbDone(error) {
    if (error) {
      jobComplete('Database error', jobKey, error);
    }
    else {
      jobComplete('saved', jobKey, {
        id: sanitizeKeySegment(sprigParams.id)
      });
    }
  });
}

function saveDocToDb(docParams, jobKey, jobComplete) {
  debugger;
  var cleanId = sanitizeKeySegment(docParams.id);
  var key = 'd' + nsDelimiter + cleanId;

  db.put(key, docParams, function putDbDone(error) {
    debugger;
    if (error) {
      jobComplete('Database error', jobKey, error);
    }
    else {
      jobComplete('saved', jobKey, {
        id: cleanId
      });
    }
  });
}

function sanitizeKeySegment(key) {
  return key.replace(nsDelimiter, '');
}

function getSprigKey(id, docId) {
  var cleanId = sanitizeKeySegment(id);
  var cleanDocId = sanitizeKeySegment(docId);
  var key = 's' + nsDelimiter + cleanDocId + nsDelimiter + cleanId;  
  return key;
}

module.exports = {
  getSprigFromDb: getSprigFromDb,
  getSprigTreeFromDb: getSprigTreeFromDb,
  saveSprigToDb: saveSprigToDb, 
  saveDocToDb: saveDocToDb,
  sanitizeKeySegment: sanitizeKeySegment
};
