var Graph = {
  camera: null,
  treeRenderer: null,
  treeNav: null,
  textStuff: null,
  historian: null, 
  pane: null,
  board: null,
  svgRoot: null,
  focusEl: null,
  focusNode: null
};

Graph.init = function init(sprigotSel, camera, treeRenderer, treeNav, 
  textStuff, historian) {

  this.camera = camera;
  this.treeRenderer = treeRenderer;
  this.treeNav = treeNav;
  this.textStuff = textStuff;
  this.historian = historian;

  this.pane = sprigotSel.append('div')
    .attr('id', 'graphPane')
    .classed('pane', true);

  this.board = this.pane.append('svg')
    .attr({
      id: 'svgBoard',
      width: '100%',
      height: '100%'
    });

  this.board.append('g').attr('id', 'background')
    .append('rect').attr({
      width: '100%',
      height: '100%',
      fill: 'rgba(0, 0, 16, 0.2)'
    });

  this.svgRoot = this.board.append('g').attr({
    id: 'graphRoot',
    transform: 'translate(' + margin.left + ',' + margin.top + ')'
  });

  this.camera.setUpZoomOnBoard(this.board, this.svgRoot);
  this.setGraphScale();
}

Graph.loadNodeTreeToGraph = function loadNodeTreeToGraph(nodeTree, 
  focusSprigId) {

  g.root = nodeTree;

  this.treeRenderer.init(g.root, this);
  this.treeNav.init(g.root, Camera, TreeRenderer, this, this.textStuff);

  var height = this.board.node().clientHeight - margin.top - margin.bottom;
  g.root.x0 = height / 2;
  g.root.y0 = 0;

  this.treeNav.collapseRecursively(g.root);

  if (focusSprigId) {
    this.treeNav.goToSprig(focusSprigId);
  }
  else {
    focusSprigId = g.root.id;
    this.treeRenderer.update(g.root);
  }

  setTimeout(function initialPan() {
    var focusSel = d3.select('#' + focusSprigId);
    this.setFocusEl(focusSel.node());
    this.camera.panToElement(focusSel);
    this.textStuff.initialTextPaneShow(focusSel);
  }
  .bind(this),
  800);  
}

Graph.setGraphScale = function setGraphScale() {
  var actualBoardHeight = this.camera.getActualHeight(this.board.node());

  if (actualBoardHeight <= 230) {
    this.camera.rootSelection.attr('transform', 'translate(0, 0) scale(0.5)');
    this.camera.zoomBehavior.scale(0.5);
  }
}

Graph.setFocusEl = function setFocusEl(el) {
  this.focusEl = el;
  this.focusNode = d3.select(this.focusEl).datum();
}

Graph.focusOnTreeNode = function focusOnTreeNode(treeNode, el) {
  this.setFocusEl(el);
  treeNode.visited = true;
  this.historian.syncURLToSprigId(treeNode.id);

  TreeRenderer.update(g.root);
  
  Camera.panToElement(d3.select(this.focusEl));
}

Graph.focusOnSprig = function focusOnSprig(sprigId, delay) {
  if (!delay) {
    delay = 500;
  }
  var sprigSel = d3.select('#' + sprigId);

  setTimeout(function doFocus() {
    this.focusOnTreeNode(sprigSel.datum(), sprigSel.node());
  }
  .bind(this),
  delay);
}

Graph.nodeHasFocus = function nodeHasFocus(treeNode) {
  return (treeNode === this.focusNode);
}
