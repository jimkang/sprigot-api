if (typeof module === 'object') {
  // Node
  var _ = require('underscore');
}
else {
  // Browser
  module = {exports: {}};
}

function reconstituteSourceNode(treedNode) {
  var sourceNode = _.pick(treedNode, 'id', 'doc', 'title', 'body');
  if (treedNode.children) {
    sourceNode.children = _.map(treedNode.children, reconstituteSourceNode);
  }
  else if (treedNode._children) {
    sourceNode.children = _.map(treedNode._children, reconstituteSourceNode);
  }
  return sourceNode;
}

function serializeTreedNode(treedNode) {
  var serialized = _.pick(treedNode, 'id', 'doc', 'title', 'body');
  var childSource = treedNode.children;
  if (!treedNode.children) {
    childSource = treedNode._children;
  }
  serialized.children = _.pluck(childSource, 'id');

  return serialized;
}

module.exports.reconstituteSourceNode = reconstituteSourceNode;
module.exports.serializeTreedNode = serializeTreedNode;

