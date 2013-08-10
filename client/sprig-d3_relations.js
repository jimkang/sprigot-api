if (typeof module === 'object') {
  // Node
  var _ = require('underscore');
}
else {
  // Browser
  module = {exports: {}};
}

function serializeTreedNode(treedNode) {
  var serialized = _.pick(treedNode, 'id', 'doc', 'title', 'body');
  var childSource = treedNode.children;
  if (!treedNode.children) {
    childSource = treedNode._children;
  }
  if (childSource) {
    serialized.children = _.pluck(childSource, 'id');
  }

  return serialized;
}

function sanitizeTreeForD3(tree) {
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

module.exports = {
  serializeTreedNode: serializeTreedNode,
  sanitizeTreeForD3: sanitizeTreeForD3
};

