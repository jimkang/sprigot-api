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
  this.spriglogSel = body.select('.sprigot');

  if (this.opts.forceRebuild && !this.spriglogSel.empty()) {
    this.spriglogSel.remove();
  }

  if (this.spriglogSel.empty()) {
    this.spriglogSel = body.append('section').classed('glog', true);
  }

  this.store = createStore();

  // TextStuff.init(this.spriglogSel, this.graph, TreeRenderer, this.store, this);
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

      var sprigs = this.spriglogSel.selectAll('.sprig')
        .data(sprigs, function(d) { return d.id });

      sprigs.enter().append('div').html(
        function getText(d) {
          return d.body;
        }
      )
      .classed('textpane', true);

      sprigs.exit().remove();

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
