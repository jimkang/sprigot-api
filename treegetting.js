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
      // If sprig.children is null, its type still counts as 'object'.
      if (currentDepth + 1 <= depthLimit && sprig &&
        typeof sprig.children === 'object' && sprig.children) {

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
    var childRefIndexesToRemoveInDescOrder = [];
    function removeChildRefAtIndex(index) {
      sprig.children.splice(index, 1);
    }

    for (var i = 0; i < sprig.children.length; ++i) {
      childId = sprig.children[i];
      child = sprigsForIds[childId];
      if (child) {
        sprig.children[i] = child;
      }
      else {
        childRefIndexesToRemoveInDescOrder.unshift(i)
      }
    }

    childRefIndexesToRemoveInDescOrder.forEach(removeChildRefAtIndex);
  }
}

module.exports.getTreeFromDb = function getTreeFromDb(
  id, docId, docFormat, childDepth, jobKey, jobComplete) {

  getDocSprigsFromDb(docId, function gotSprigs(errors, sprigsForIds) {
    if (docFormat) {
      filterSprigDictByFormat(sprigsForIds, docFormat);
    }
    var sprigTree = treeify(sprigsForIds, id, childDepth);

    var status = 'got';
    var results = sprigTree;
    if (errors.length > 0) {
      status = 'Database errors';
      results = errors;
    }
    jobComplete(status, jobKey, results);
  });

};

function filterSprigDictByFormat(sprigsForIds, docFormat) {
  function filterSprig(id) {
    var sprig = sprigsForIds[id];
    if (typeof sprig.formats === 'object' && sprig.formats.length > 0 &&
      sprig.formats.indexOf(docFormat) === -1) {

      delete sprigsForIds[id];
    }
  }

  var ids = Object.keys(sprigsForIds);
  ids.forEach(filterSprig);
}

