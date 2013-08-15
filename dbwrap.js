var levelup = require('level');

var db = levelup('./db/sprigot.db', {
  valueEncoding: 'json'
});

var nsDelimiter = '!';
var nsEndRangeDelimiter = '\xff';

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

function saveDocToDb(docParams, jobKey, jobComplete) {
  var cleanId = sanitizeKeySegment(docParams.id);
  var key = 'd' + nsDelimiter + cleanId;

  db.put(key, docParams, function putDbDone(error) {
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

function getRangeForSprigsInDoc(docId) {
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
  saveDocToDb: saveDocToDb,
  sanitizeKeySegment: sanitizeKeySegment,
  getRangeForSprigsInDoc: getRangeForSprigsInDoc
};
