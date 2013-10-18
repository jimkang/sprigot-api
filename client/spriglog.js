function createSpriglog(opts) {

var Spriglog = {
  docId: null,
  store: null,
  opts: opts,
  spriglogSel: null,
  controllerType: 'glog'
};

var margin = {top: 20, right: 10, bottom: 20, left: 10};

Spriglog.init = function init() {
  this.opts = opts ? opts : {};
  var body = d3.select('body');
  // this.SpriglogSel = body.select('.sprigot');

  // if (this.opts.forceRebuild && !this.SpriglogSel.empty()) {
  //   this.SpriglogSel.remove();
  // }

  // if (this.SpriglogSel.empty()) {
  //   this.SpriglogSel = body.append('section').classed('Spriglog', true);
  // }
  // else {
  //   return;
  // }

  this.store = createStore();

  // TextStuff.init(this.SpriglogSel, this.graph, TreeRenderer, this.store, this);
};

Spriglog.load = function load(docId, identifyFocusSprig, done) {
  this.docId = docId;
  // Historian.init(this.graph.treeNav, this.docId);

  this.store.getSprigTree(docId, function doneGettingTree(error, sprigTree) {
    if (error) {
      done(error, null);
    }

    if (sprigTree) {
      var sprigs = D3SprigBridge.flattenTreeBreadthFirst(sprigTree);


    }
    else {
      done('Sprig tree not found.');
    }
  }
  .bind(this));
}

Spriglog.init();

return Spriglog;
}
