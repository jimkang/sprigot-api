function createSpriglog(opts) {
// Expected in opts: doc, loadDone.

var Spriglog = {
  store: null,
  opts: opts,
  spriglogSel: null,
  controllerType: 'bloge',
  sprigList: [],
  sprigShowRange: [0, 5], // Excludes end
  numberOfSprigsToRevealPerScrollEnd: 5
};

Spriglog.init = function init(initDone) {
  this.opts = opts ? opts : {};

  var baseMixin = createSprigotBaseMixin();
  var addedContainer = baseMixin.setUpOuterContainer('bloge.css', 'bloge', 
    this.opts);
  if (addedContainer) {
    this.spriglogSel = d3.select('.bloge');
  }
  else {
    setTimeout(initDone, 0);
    return;
  }

  this.store = createStore();
  loadATypeKit('//use.typekit.net/med0yzx.js', initDone);
};

Spriglog.load = function load() {
  // Historian.init(this.graph.treeNav, this.docId);

  this.store.getSprigList(this.opts.doc.id, 
    function doneGettingList(error, sprigList) {
      if (error) {
        this.opts.loadDone(error, null);
      }
      else if (sprigList) {
        this.sprigList = sprigList;
        if (this.sprigList.length < this.sprigShowRange[1]) {
          this.sprigShowRange[1] = this.sprigList.length;
        }

        this.render(
          sprigList.slice(this.sprigShowRange[0], this.sprigShowRange[1]));

        window.onscroll = this.respondToScroll.bind(this);

        this.opts.loadDone();
      }
      else {
        this.opts.loadDone('Sprig tree not found.');
      }
    }
    .bind(this)
  );
};

Spriglog.render = function render(sprigList) {
  var sprigs = this.spriglogSel.selectAll('.sprig')
    .data(sprigList, function(d) { return d.id; });

  var newSprigs = sprigs.enter().append('div')
    .classed('sprig', true)
    .classed('textpane', true);

  newSprigs.append('div').classed('title', true);
  newSprigs.append('div').classed('sprigbody', true);
  newSprigs.append('div').classed('stamps', true);

  sprigs.select('.title').text(function getTitle(d) {return d.title;});
  sprigs.select('.stamps').text(function getStamps(d) {
    var createdDate = new Date(d.created);
    return createdDate.toLocaleString();
  });
  sprigs.select('.sprigbody').html(function getBody(d) {return d.body;});
  
  var sprigsToRemove = sprigs.exit();
  sprigsToRemove.remove();
};

Spriglog.respondToScroll = function respondToScroll() {
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

return Spriglog;
}
