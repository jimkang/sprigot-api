function createNewDocForm(opts) {

var newDocForm = {
  docId: null,
  store: null,
  opts: opts,
  newDocFormSel: null,
  controllerType: 'form'
};

newDocForm.init = function init(initDone) {
  this.opts = opts ? opts : {};
  var body = d3.select('body');
  this.newDocFormSel = body.select('.sprigot');

  if (this.opts.forceRebuild && !this.newDocFormSel.empty()) {
    this.newDocFormSel.remove();
  }

  this.store = createStore();

  if (this.newDocFormSel.empty()) {
    this.newDocFormSel = body.append('section').classed('glog', true);

    var head = d3.select('head');
    head.append('link').attr({
      rel: 'stylesheet',
      type: 'text/css',
      href: 'sprig.css'
    });

    loadATypeKit('//use.typekit.net/uoo5gyw.js', initDone);    
  }
};

newDocForm.load = function load(opts) {
  this.render([{
    title: 'New Sprigot document',
    fields: [
      { 
        name: 'Name',
        type: 'text'
      },
      {
        name: 'Format',
        type: 'select',
        options: [
          'sprigot',
          'glog'
        ]
      }
    ]
  }]);

  setTimeout(function doneOnNextTick() { opts.done(); }, 0);
};

newDocForm.render = function render(sprigList) {
  var sprigs = this.newDocFormSel.selectAll('.sprig')
    .data(sprigList, function(d) { return d.id; });

  var newSprigs = sprigs.enter().append('div')
    .classed('sprig', true)
    .classed('textpane', true);

  newSprigs.append('div').classed('title', true);
  var sprigBody = newSprigs.append('div').classed('sprigbody', true);

  sprigs.select('.title').text(function getTitle(d) {return d.title;});
  // sprigs.select('.sprigbody').html(function getBody(d) {return d.body;});
  
  var sprigsToRemove = sprigs.exit();
  sprigsToRemove.remove();

  sprigBody.each(function setUpFields(d) {
    var fields = d3.select(this).selectAll('input').data(d.fields);
    var newFields = fields.enter().append('input');
    fields.exit().remove();
  });

};

return newDocForm;
}
