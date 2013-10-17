function createGraph() {

var Graph = {
  camera: null,
  treeRenderer: null,
  treeNav: null,
  textStuff: null,
  historian: null,
  sprigot: null,

  pane: null,
  board: null,
  svgRoot: null,
  focusEl: null,
  focusNode: null,
  nodeRoot: null,
  margin: {top: 20, right: 10, bottom: 20, left: 10}
};

Graph.init = function init(sprigotSel, camera, treeRenderer, 
  textStuff, historian, sprigot) {

  this.camera = camera;
  this.treeRenderer = treeRenderer;
  this.treeNav = createTreeNav();
  this.textStuff = textStuff;
  this.historian = historian;
  this.sprigot = sprigot;

  this.pane = sprigotSel.append('div')
    .attr('id', 'graphPane')
    .classed('pane', true);

  this.board = this.pane.append('svg')
    .attr({
      id: 'svgBoard',
      width: '100%',
      height: '85%'
    });

  this.board.append('g').attr('id', 'background')
    .append('rect').attr({
      width: '100%',
      height: '100%',
      fill: 'rgba(0, 0, 16, 0.2)'
    });

  this.svgRoot = this.board.append('g').attr({
    id: 'graphRoot',
    transform: 'translate(' + this.margin.left + ',' + this.margin.top + ')'
  });

  this.camera.setUpZoomOnBoard(this.board, this.svgRoot);
  this.setGraphScale();

  var note = this.pane.append('div').attr('id', 'zoom-note')
      .classed('info-note', true);

  if (this.sprigot.isMobile()) {
    note.text('You can pinch to zoom in and out of the graph. Drag to pan.');
  }
  else {
    note.text('You can use the mouse wheel to zoom in and out of the graph. Drag to pan.');    
  }

  return this;
}

Graph.loadNodeTreeToGraph = function loadNodeTreeToGraph(nodeTree, 
  identifyFocusSprig, done) {

  this.nodeRoot = nodeTree;

  this.treeRenderer.init(this.nodeRoot, this);
  this.treeNav.init(this.nodeRoot, this.camera, TreeRenderer, this, 
    this.textStuff);

  var height = 
    this.board.node().clientHeight - this.margin.top - this.margin.bottom;
  this.nodeRoot.x0 = height / 2;
  this.nodeRoot.y0 = 0;

  this.treeNav.collapseRecursively(this.nodeRoot);
  var focusSprig = this.nodeRoot;

  this.treeRenderer.update(this.nodeRoot);

  var shouldPanToRoot = true;

  if (identifyFocusSprig) {
    var pathToSprig = D3SprigBridge.mapPathInD3Tree(identifyFocusSprig, 
      this.nodeRoot, 100);

    if (pathToSprig.length > 0) {
      this.treeNav.followPathToSprig(pathToSprig);
      focusSprig = pathToSprig[pathToSprig.length - 1];
      shouldPanToRoot = false;
    }
  }

  if (shouldPanToRoot) {
    setTimeout(function initialPan() {
      this.panToRoot();
      if (this.focusNode) {
        Historian.syncURLToSprigId(this.focusNode.id);
      }  
    }
    .bind(this),
    900);
  }

  setTimeout(function initialTextShow() {
    this.noteNodeWasVisited(focusSprig);
    this.textStuff.initialShow(focusSprig);
    done();
  }
  .bind(this),
  800);
}

Graph.panToRoot = function panToRoot() {
  var focusSel = d3.select('#' + this.nodeRoot.id);
  this.setFocusEl(focusSel.node());
  this.camera.panToElement(focusSel);
}

Graph.setGraphScale = function setGraphScale() {
  var actualBoardHeight = this.camera.getActualHeight(this.board.node());

  if (actualBoardHeight <= 230) {
    this.camera.rootSelection.attr('transform', 'translate(0, 0) scale(0.75)');
    this.camera.zoomBehavior.scale(0.5);
  }
}

Graph.setFocusEl = function setFocusEl(el) {
  this.focusEl = el;
  this.focusNode = d3.select(this.focusEl).datum();
}

Graph.focusOnTreeNode = function focusOnTreeNode(treeNode, el, done) {
  this.setFocusEl(el);
  var previouslyVisited = this.noteNodeWasVisited(treeNode);
  if (!previouslyVisited) {
    this.noteNodeWasVisited(treeNode);
  }
  this.historian.syncURLToSprigId(treeNode.id);
  this.treeRenderer.update(this.nodeRoot);
  this.camera.panToElement(d3.select(this.focusEl), done);
}

Graph.focusOnSprig = function focusOnSprig(sprigId, delay, done) {
  if (!delay) {
    delay = 500;
  }
  var sprigSel = d3.select('#' + sprigId);

  setTimeout(function doFocus() {
    this.focusOnTreeNode(sprigSel.datum(), sprigSel.node(), done);
  }
  .bind(this),
  delay);
}

Graph.nodeHasFocus = function nodeHasFocus(treeNode) {
  return (treeNode === this.focusNode);
}

Graph.noteNodeWasVisited = function noteNodeWasVisited(treeNode) {
  var visitKey = 'visited_' + treeNode.id;
  localStorage[visitKey] = true;
};

Graph.nodeWasVisited = function nodeWasVisited(treeNode) {
  var visitKey = 'visited_' + treeNode.id;
  return (visitKey in localStorage);
};

Graph.nodeIsUnvisited = function nodeIsUnvisited(sprig) {
  return !this.nodeWasVisited(sprig);
}

return Graph;
}

