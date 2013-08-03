var levelup = require('level');
var _ = require('underscore');

var TreeGetter = function TreeGetter(db, rootSprigId, childDepth, done) {
  this.treeGetState = {
    db: db,
    sprigsToGet: {},
    sprigsGot: {},
    errors: [],
    depthLimit: childDepth,
    tree: {},
    done: done
  };
};

TreeGetter.prototype.getSprigFromDb = function getSprigTreeFromDb(
  rootSprigId, depth, parent) {

  this.treeGetState.sprigsToGet[rootSprigId] = true;

  this.treeGetState.db.get(rootSprigId, function getComplete(error, value) {
    this.receiveSprig(error, depth, parent, value);
  }
  .bind(this));
};

TreeGetter.prototype.receiveSprig = function receiveSprig(
  error, depth, parent, sprig) {

  if (error) {
    this.treeGetState.errors.push(error);
    return;
  }

  this.treeGetState.sprigsGot[sprig.id] = sprig;

  if (parent) {
    debugger;
    // Replace the id in children with the sprig object.
    var childIndex = parent.children.indexOf(sprig.id);
    parent.children[childIndex] = sprig;
  }
  else {
    this.treeGetState.tree = sprig;
  }

  debugger;

  if (depth < this.treeGetState.depthLimit && 
    typeof sprig.children === 'object') {

    sprig.children.forEach(function getSprigChild(childId) {
      this.getSprigFromDb(childId, depth + 1, sprig);
    }
    .bind(this));
  }

  this.wrapUpIfComplete();
}

TreeGetter.prototype.wrapUpIfComplete = function wrapUpIfComplete() {
  debugger;
  if (_.keys(this.treeGetState.sprigsGot).length >= 
    _.keys(this.treeGetState.sprigsToGet).length) {
    this.treeGetState.done(this.treeGetState.errors, this.treeGetState.tree);
  }
};

module.exports.getTree = function getTree(db, sprigId, childDepth, done) {
  var treeGetter = new TreeGetter(db, sprigId, childDepth, done);
  treeGetter.getSprigFromDb(sprigId, 0, null);
};

