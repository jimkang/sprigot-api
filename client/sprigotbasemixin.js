function createSprigotBaseMixin() {

var baseMixin = {
};

baseMixin.setUpOuterContainer = function setUpOuterContainer(cssFilename, 
  containerClass, sprigotOpts) {

  var addedContainer = false;
  var sprigotSel = d3.select('.outer-container');

  if (sprigotOpts.forceRebuild || !sprigotSel.empty()) {
    if (sprigotOpts.forceRebuild || !sprigotSel.classed(containerClass)) {
      sprigotSel.remove();
      sprigotSel = d3.select('.outer-container');      
    }
  }

  if (sprigotSel.empty()) {
    d3.select('head').append('link').attr({
      rel: 'stylesheet',
      type: 'text/css',
      href: cssFilename
    });
    sprigotSel = d3.select('body').append('section')
      .classed('outer-container', true).classed(containerClass, true);

    addedContainer = true;
  }

  return addedContainer;
};

return baseMixin;
}
