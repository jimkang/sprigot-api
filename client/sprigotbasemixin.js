function createSprigotBaseMixin() {

var baseMixin = {
};

baseMixin.setUpOuterContainer = function setUpOuterContainer(cssFilename, 
  sprigotOpts) {

  var addedContainer = false;

  var body = d3.select('body');
  var sprigotSel = body.select('.sprigot');

  if (sprigotOpts.forceRebuild && !sprigotSel.empty()) {
    sprigotSel.remove();
    sprigotSel = body.select('.sprigot');
  }

  if (sprigotSel.empty()) {
    d3.select('head').append('link').attr({
      rel: 'stylesheet',
      type: 'text/css',
      href: cssFilename
    });

    sprigotSel = body.append('section').classed('sprigot', true);
    addedContainer = true;
  }

  return addedContainer;
};

return baseMixin;
}
