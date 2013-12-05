function createSprigot(opts) {
// Expected in opts: doc, loadDone.
// Optional in opts: initialTargetSprigId.

var Sprigot = {
  graph: null,
  store: null,
  divider: null,
  camera: null,
  opts: opts,
  controllerType: 'sprigot'
};

Sprigot.init = function init(initDone) {
  var baseMixin = createSprigotBaseMixin();
  var addedContainer = baseMixin.setUpOuterContainer('sprig.css', 'sprigot', 
    this.opts);

  if (!addedContainer) {
    initDone();
    return;
  }

  var cameraScaleExtent = [0.5, 1];
  if (this.isMobile()) {
    cameraScaleExtent = [0.25, 1];
  }
  this.camera = createCamera(cameraScaleExtent);
  this.graph = createGraph();
  var sprigotSel = d3.select('.sprigot');  
  this.graph.init(sprigotSel, this.camera, TreeRenderer, TextStuff, Historian,
    this);
  this.store = createStore();
  this.divider = createDivider();

  this.divider.init(sprigotSel, this.graph, TextStuff, this.camera, this);
  TextStuff.init(sprigotSel, this.graph, TreeRenderer, this.store, this, 
      this.divider);

  this.divider.syncExpanderArrow();
  this.initDocEventResponders();

  this.tagElementsWithCSSHackClasses();

  loadATypeKit('//use.typekit.net/uoo5gyw.js', initDone);
};

Sprigot.load = function load() {
  Historian.init(this.graph.treeNav, this.opts.doc.id);

  this.store.getSprigTree(this.opts.doc.id, function gotTree(error, tree) {
    if (error) {
      this.opts.loadDone(error, null);
    }

    if (tree) {
      tree = D3SprigBridge.sanitizeTreeForD3(tree);
      var targetId = this.opts.initialTargetSprigId;
      var matcher = function matchAny() { return true; };
      if (targetId) {
        matcher = function isTarget(sprig) { return (targetId === sprig.id); };
      }

      this.graph.loadNodeTreeToGraph(tree, matcher, function onGraphLoaded() {
        if (targetId === 'findunread') {
          this.respondToFindUnreadCmd();
        }
        this.opts.loadDone();
      }
      .bind(this));
    }
    else {
      this.opts.loadDone('Sprig tree not found.');
    }
  }
  .bind(this));
};

Sprigot.initDocEventResponders = function initDocEventResponders() {
  var doc = d3.select(document);
  if (TextStuff.editAvailable) {
    doc.on('click', TextStuff.endEditing.bind(TextStuff));
  }
  doc.on('keyup', this.respondToDocKeyUp.bind(this));
  doc.on('keydown', this.respondToDocKeyDown.bind(this));
};

Sprigot.respondToDocKeyUp = function respondToDocKeyUp() {
  // CONSIDER: Disabling all of this listening when editing is going on.

  // Esc
  if (d3.event.keyCode === 27) {
    d3.event.stopPropagation();
    if (TextStuff.contentZone.classed('editing')) {
      TextStuff.changeEditMode(false);
    }
  }
  else if (!TextStuff.contentZone.classed('editing')) {
    switch (d3.event.which) {
      // 'e'.
      case 69:
        d3.event.stopPropagation();
        if (TextStuff.contentZone.style('display') === 'block') {
          TextStuff.changeEditMode(true);
        }
        break;
      // Down arrow.
      case 40:
        this.graph.treeNav.respondToDownArrow();
        break;
      // Up arrow.
      case 38:
        this.graph.treeNav.respondToUpArrow();
        break;
      // Left arrow.
      case 37:
        this.graph.treeNav.respondToLeftArrow();
        break;
      // Right arrow.
      case 39:
        this.graph.treeNav.respondToRightArrow();
        break;
      // equal key
      case 187:
        if (d3.event.shiftKey) {
          this.respondToAddChildSprigCmd();
        }
        break;
        // 'u'
      case 85:
        this.respondToFindUnreadCmd();
        break;
    }
  }
};

Sprigot.respondToDocKeyDown = function respondToDocKeyDown() {
  // cmd+delete keys

  if (TextStuff.editAvailable && 
    (d3.event.metaKey || d3.event.ctrlKey) && d3.event.which === 8) {
    TextStuff.showDeleteSprigDialog();
  }
};

Sprigot.respondToAddChildSprigCmd = function respondToAddChildSprigCmd() {
  d3.event.stopPropagation();
  if (TextStuff.contentZone.classed('editing')) {
    TextStuff.changeEditMode(false);
  }

  var currentJSONDate = (new Date()).toJSON();
  var newSprig = {
    id: TextStuff.makeId(8),
    doc: this.opts.doc.id,
    title: 'New Sprig',
    body: '',
    created: currentJSONDate,
    modified: currentJSONDate 
  };

  var currentChildren = this.graph.focusNode.children;
  if (!currentChildren) {
    currentChildren = this.graph.focusNode._children;
  }
  if (!currentChildren) {
    currentChildren = [];
  }
  currentChildren.push(newSprig);

  this.graph.focusNode.children = currentChildren;

  TextStuff.changeEditMode(true);

  this.store.saveChildAndParentSprig(newSprig, 
    D3SprigBridge.serializeTreedNode(this.graph.focusNode));

  TreeRenderer.update(this.graph.nodeRoot, 
    this.graph.treeRenderer.treeNodeAnimationDuration);

  setTimeout(function afterUpdate() {
    this.graph.focusOnSprig(newSprig.id);
    TextStuff.showTextpaneForTreeNode(newSprig);
  }
  .bind(this),
  this.graph.treeRenderer.treeNodeAnimationDuration + 100);
};

Sprigot.respondToDeleteSprigCmd = function respondToDeleteSprigCmd() {
  d3.event.stopPropagation();
  if (TextStuff.contentZone.classed('editing')) {
    TextStuff.changeEditMode(false, true);
  }

  var parentNode = this.graph.focusNode.parent;
  var childIndex = parentNode.children.indexOf(this.graph.focusNode);
  parentNode.children.splice(childIndex, 1);

  var sprigToDelete = {
    id: this.graph.focusNode.id,
    doc: this.opts.doc.id
  };

  this.store.deleteChildAndSaveParentSprig(sprigToDelete, 
    D3SprigBridge.serializeTreedNode(parentNode));

  var treeNav = this.graph.treeNav;

  TreeRenderer.update(this.graph.nodeRoot, 
    this.graph.treeRenderer.treeNodeAnimationDuration);
  setTimeout(function clickOnParentOfDeletedNode() {
    treeNav.chooseTreeNode(parentNode, d3.select('#' + parentNode.id).node());
  },
  this.graph.treeRenderer.treeNodeAnimationDuration + 500);
};

Sprigot.respondToNewSprigotCmd = function respondToNewSprigotCmd() {
  var newDoc = {
    id: uid(8),
    rootSprig: uid(8),
    authors: [
      'deathmtn'
    ],
    admins: [
      'deathmtn'
    ]    
  };

  var rootSprig = {
    id: newDoc.rootSprig,
    doc: newDoc.id,
    title: 'Root',
    body: 'Hello. Type some stuff here.',
    children: []
  };

  this.store.createNewDoc(newDoc, rootSprig);
};

Sprigot.respondToFindUnreadCmd = function respondToFindUnreadCmd() {
  // TODO: Map a direct route between the two nodes.
  var pathToSprig = D3SprigBridge.mapPathInD3Tree(
    this.graph.nodeIsUnvisited.bind(this.graph),
    this.graph.treeNav.sprigTree, 100);

  if (pathToSprig.length > 0) {
    if (pathToSprig.length > 1 || 
      pathToSprig[0].id !== this.graph.focusNode.id) {

      this.graph.treeNav.followPathToSprig(pathToSprig);
    }
    var destSprig = pathToSprig[pathToSprig.length-1];
    Historian.syncURLToSprigId(destSprig.id);
    TextStuff.syncTextpaneWithTreeNode(destSprig);
  }
  else {
    TextStuff.disableFindUnreadLink();
  }
};

Sprigot.respondToSwitchToGraphCmd = function respondToSwitchToGraphCmd() {
  if (!this.graph.pane.classed('expandedPane')) {
    this.divider.toggleGraphExpansion();
  }
};

Sprigot.isMobile = function isMobile() {
  var isMobileMediaQuery = 'only screen and (max-device-height: 568px)';
  return (window.matchMedia(isMobileMediaQuery).matches);
};

Sprigot.tagElementsWithCSSHackClasses = function tagElementsWithCSSHackClasses() {
  if (this.isMobile() &&
    !navigator.userAgent.match(/(iPad|iPhone);.*CPU.*OS 7_\d/i)) {
    d3.select('.sprigot').classed('is-not-ios-seven', true);
    d3.select('#graphPane').classed('is-not-ios-seven', true);
    d3.select('.divider').classed('is-not-ios-seven', true);
    d3.select('#nongraphPane').classed('is-not-ios-seven', true);
  }
};

return Sprigot;
}
