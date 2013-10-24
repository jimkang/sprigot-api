var levelup = require('level');

var db = levelup('./db/sprigot.db', {
  valueEncoding: 'json'
});

var nsDelimiter = '!';
var nsEndRangeDelimiter = '\xff'; // ÿ

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

function deleteSprigFromDb(sprigParams, jobKey, jobComplete) {
  var key = getSprigKey(sprigParams.id, sprigParams.doc);
  db.del(key, {}, function delDbDone(error) {
    if (error) {
      jobComplete('Database error', jobKey, error);
    }
    else {
      jobComplete('deleted', jobKey, {
        id: sanitizeKeySegment(sprigParams.id)
      });
    }
  });
}

function saveDocToDb(docParams, jobKey, jobComplete) {
  var key = getDocKey(docParams.id);

  db.put(key, docParams, function putDbDone(error) {
    if (error) {
      jobComplete('Database error', jobKey, error);
    }
    else {
      jobComplete('saved', jobKey, {
        id: getDocIdFromKey(key)
      });
    }
  });
}

function getDocFromDb(id, jobKey, jobComplete) {
  var key = getDocKey(id);

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

function sanitizeKeySegment(key) {
  return key.replace(nsDelimiter, '');
}

function getSprigKey(id, docId) {
  var cleanId = sanitizeKeySegment(id);
  var cleanDocId = sanitizeKeySegment(docId);
  var key = 's' + nsDelimiter + cleanDocId + nsDelimiter + cleanId;  
  return key;
}

function getDocKey(id) {
  var cleanId = sanitizeKeySegment(id);
  var key = 'd' + nsDelimiter + cleanId;
  return key;
}

function getDocIdFromKey(key) {
  var parts = key.split(nsDelimiter);
  var id = null;
  if (parts.length > 1) {
    id = parts[1];
  }
  return id;
}

function getRangeForSprigsInDoc(docId) {
  debugger;
  var cleanDocId = sanitizeKeySegment(docId);
  return [
    's' + nsDelimiter + cleanDocId + nsDelimiter,
    's' + nsDelimiter + cleanDocId + nsEndRangeDelimiter
  ];
}

module.exports = {
  db: db,
  getSprigFromDb: getSprigFromDb,
  saveSprigToDb: saveSprigToDb, 
  deleteSprigFromDb: deleteSprigFromDb,
  saveDocToDb: saveDocToDb,
  getDocFromDb: getDocFromDb,
  sanitizeKeySegment: sanitizeKeySegment,
  getRangeForSprigsInDoc: getRangeForSprigsInDoc
};
