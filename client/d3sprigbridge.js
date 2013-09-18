if (typeof module === 'object') {
  // Node
  var _ = require('underscore');
}

D3SprigBridge = {};

D3SprigBridge.serializeTreedNode = function serializeTreedNode(treedNode) {
  var serialized = _.pick(treedNode, 'id', 'doc', 'title', 'body', 'emphasize');
  var childSource = treedNode.children;
  if (!treedNode.children) {
    childSource = treedNode._children;
  }
  if (childSource) {
    serialized.children = _.pluck(childSource, 'id');
  }

  return serialized;
}

D3SprigBridge.sanitizeTreeForD3 = function sanitizeTreeForD3(tree) {
  if (typeof tree.children === 'object') {
    var childRefs = [];
    var validChildren = [];
    for (var i = 0; i < tree.children.length; ++i) {
      var child = tree.children[i];
      if (typeof child === 'object') {
        validChildren.push(child);
      }
      else {
        childRefs.push(child);
      }
    }
    if (childRefs.length > 0) {
      tree.childRefs = childRefs;
    }
    if (validChildren.length > 0) {
      tree.children = validChildren;
      tree.children.forEach(sanitizeTreeForD3);
    }
  }
  return tree;
}

D3SprigBridge.mapPathToSprigId = 
function mapPathToSprigId(targetSprigId, sprigTree, depthLimit) {
  function matchesTarget(sprig) {
    return (sprig.id === targetSprigId);  
  }
  return this.mapPathInD3Tree(matchesTarget, sprigTree, depthLimit);
}

// predicate is a function that takes a sprig and returns a boolean indicating 
// whether to stop mapping.
D3SprigBridge.mapPathInD3Tree = 
function mapPathInD3Tree(predicate, sprigTree, depthLimit) {
  if (predicate(sprigTree)) {
    return [sprigTree];
  }

  var path = [];
  var parentMap = {};
  var targetSprig = null;

  var currentDepth = 0;
  var sprigsAtNextDepth = null;
  var sprigsAtDepth = [sprigTree];

  while (currentDepth <= depthLimit) {
    sprigsAtNextDepth = [];

    for (var i = 0; i < sprigsAtDepth.length; ++i) {
      var sprig = sprigsAtDepth[i];

      if (predicate(sprig)) {
        targetSprig = sprig;
        break;
      }

      if (currentDepth + 1 <= depthLimit && sprig) {
        var theChildren = [];
        if (typeof sprig.children === 'object' && sprig.children) {
          theChildren = sprig.children;
        }
        else if (typeof sprig._children === 'object' && sprig._children) {
          theChildren = sprig._children;
        }

        theChildren.forEach(function mapParent(child) {
          parentMap[child.id] = sprig;
        });

        sprigsAtNextDepth = sprigsAtNextDepth.concat(theChildren);
      }
    }

    if (targetSprig) {
      break;
    }

    currentDepth++;
    sprigsAtDepth = sprigsAtNextDepth;
  }

  if (targetSprig) {
    var sprig = targetSprig;

    while (sprig) {
      path.unshift(sprig);
      if (sprig.id in parentMap) {
        sprig = parentMap[sprig.id];
      }
      else {
        sprig = null;
      }
    }
  }

  return path;
}

D3SprigBridge.mapPathToNextUndreadSprig = 
function mapPathToNextUndreadSprig(sprigTree, depthLimit) {
  // TODO!
}

if (typeof module === 'object') {
  // Node
  module.exports = D3SprigBridge;
}
