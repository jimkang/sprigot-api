var _ = require('underscore');

module.exports.reconstituteSourceNode = 
function reconstituteSourceNode(treedNode) {
  var sourceNode = _.pick(treedNode, 'id', 'title', 'body');
  if (treedNode.children) {
    sourceNode.children = _.map(treedNode.children, reconstituteSourceNode);
  }
  else if (treedNode._children) {
    sourceNode.children = _.map(treedNode._children, reconstituteSourceNode);
  }
  return sourceNode;
}

module.exports.serializeTreedNode = 
function serializeTreedNode(treedNode) {
  var serialized = _.pick(treedNode, 'id', 'title', 'body');
  var childSource = treedNode.children;
  if (!treedNode.children) {
    childSource = treedNode._children;
  }
  serialized.children = _.pluck(childSource, 'id');

  return serialized;
}

