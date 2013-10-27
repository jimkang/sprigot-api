function createSpriglog(opts) {

var Spriglog = {
  docId: null,
  store: null,
  opts: opts,
  spriglogSel: null,
  controllerType: 'glog',
  sprigList: [],
  sprigShowRange: [0, 5], // Excludes end
  numberOfSprigsToRevealPerScrollEnd: 5
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

  this.store.getSprigList(docId, function doneGettingList(error, sprigList) {
    if (error) {
      done(error, null);
    }
    else if (sprigList) {
      this.sprigList = sprigList;
      if (this.sprigList.length < this.sprigShowRange[1]) {
        this.sprigShowRange[1] = this.sprigList.length;
      }

      this.render(
        sprigList.slice(this.sprigShowRange[0], this.sprigShowRange[1]));

      window.onscroll = this.respondToScroll.bind(this);

      done();
    }
    else {
      done('Sprig tree not found.');
    }
  }
  .bind(this));
};

Spriglog.render = function render(sprigList) {
  var sprigs = this.spriglogSel.selectAll('.sprig')
    .data(sprigList, function(d) { return d.id; });

  var newSprigs = sprigs.enter().append('div')
    .classed('sprig', true)
    .classed('textpane', true);

  newSprigs.append('span').classed('title', true);
  newSprigs.append('span').classed('stamps', true);
  newSprigs.append('div').classed('sprigbody', true);

  var things = 
  sprigs.select('.title').text(function getTitle(d) {return d.title;});
  sprigs.select('.stamps').text(function getStamps(d) {
    return 'Created: ' + d.created + ', Modified' + d.modified;
  });
  sprigs.select('.sprigbody').html(function getBody(d) {return d.body;});
  
  var sprigsToRemove = sprigs.exit();
  sprigsToRemove.remove();
};

Spriglog.respondToScroll = function respondToScroll(e) {
  // Scrolled to bottom of body?
  if (document.body.scrollHeight - document.body.scrollTop === 
    document.body.clientHeight) {

    // Is there is more to show?
    if (this.sprigShowRange[0] + this.sprigShowRange[1] < 
      this.sprigList.length) {

      this.sprigShowRange[1] += this.numberOfSprigsToRevealPerScrollEnd;
      if (this.sprigShowRange[0] + this.sprigShowRange[1] >= 
        this.sprigList.length) {

        this.sprigShowRange[1] = this.sprigList.length - this.sprigShowRange[0];
      }

      this.render(this.sprigList.slice(this.sprigShowRange[0], 
        this.sprigShowRange[1]));
    }
  }
};

Spriglog.init();

return Spriglog;
}
