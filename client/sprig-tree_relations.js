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

module.exports.serializeTreedNode = serializeTreedNode;

