var dbwrap = require('./dbwrap');

// done params: errorS, sprig hash.
function getDocSprigsFromDb(docId, done) {
  var sprigsForIds = {};
  var errors = [];

  var sprigRange = dbwrap.getRangeForSprigsInDoc(docId);
  var stream = dbwrap.db.createValueStream({
    start: sprigRange[0],
    end: sprigRange[1]
  });

  stream.on('data', function takeSprig(sprig) {
    sprigsForIds[sprig.id] = sprig;
  });
  stream.on('error', function streamError(error) {
    errors.push(error);
  });
  stream.on('close', function respondToStreamClosing() {
    done(errors, sprigsForIds);
  });
};

function treeify(sprigsForIds, rootId, depthLimit) {
  var tree = sprigsForIds[rootId];
  var currentDepth = 0;
  var sprigsAtNextDepth = null;
  var sprigsAtDepth = [tree];

  while (currentDepth <= depthLimit) {
    sprigsAtNextDepth = [];

    sprigsAtDepth.forEach(function convertChildren(sprig) {
      if (currentDepth + 1 <= depthLimit && 
        typeof sprig.children === 'object') {

        convertChildRefsToSprigs(sprig, sprigsForIds);
        sprigsAtNextDepth = sprigsAtNextDepth.concat(sprig.children);
      }
    });

    currentDepth++;
    sprigsAtDepth = sprigsAtNextDepth;
  }

  return tree;
}

function convertChildRefsToSprigs(sprig, sprigsForIds) {
  var childId = null;
  var child = null;
  if (typeof sprig.children === 'object') {
    for (var i = 0; i < sprig.children.length; ++i) {
      childId = sprig.children[i];
      child = sprigsForIds[childId];
      if (child) {
        sprig.children[i] = child;
      }
    }
  }
}

module.exports.getTreeFromDb = function getTreeFromDb(
  id, docId, childDepth, jobKey, jobComplete) {

  getDocSprigsFromDb(docId, function gotSprigs(errors, sprigsForIds) {
    var sprigTree = treeify(sprigsForIds, id, childDepth);
    debugger;
  
    var status = 'got';
    var results = sprigTree;
    if (errors.length > 0) {
      status = 'Database errors';
      results = errors;
    }
    jobComplete(status, jobKey, results);
  });

}