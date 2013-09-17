var margin = {top: 20, right: 10, bottom: 20, left: 10};

var settings = {
  treeNodeAnimationDuration: 750
};

var Sprigot = {
  docId: null,
  graph: null,
  store: null
};

Sprigot.init = function init(docId, focusSprigId) {
  this.docId = docId;

  var body = d3.select('body');
  var sprigotSel = body.select('#sprigot');
  if (!sprigotSel.empty()) {
    sprigotSel.remove();
  }
  sprigotSel = body.append('section').attr('id', 'sprigot');

  this.graph = createGraph();
  this.graph.init(sprigotSel, Camera, TreeRenderer, TextStuff, Historian);
  this.store = createStore();

  Divider.init(sprigotSel, this.graph, TextStuff, Camera);
  TextStuff.init(sprigotSel, this.graph, TreeRenderer, this.store, this, 
      Divider);
  Historian.init(this.graph.treeNav, this.docId);

  Divider.syncExpanderArrow();
  this.initDocEventResponders();

  this.store.getSprigTree(docId, function done(error, sprigTree) {
    if (error) {
      console.log('Error while getting sprig:', error);
      return;
    }

    if (sprigTree) {
      var sanitizedTree = D3SprigBridge.sanitizeTreeForD3(sprigTree);
      this.graph.loadNodeTreeToGraph(sanitizedTree, focusSprigId);
      console.log('Loaded tree:', sprigTree);
    }
    else {
      console.log('Sprig tree not found.');
    }
  }
  .bind(this));
}

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
    if (TextStuff.editZone.classed('editing')) {
      TextStuff.changeEditMode(false);
    }
  }
  else if (!TextStuff.editZone.classed('editing')) {
    switch (d3.event.which) {
      // 'e'.
      case 69:
        d3.event.stopPropagation();
        if (TextStuff.editZone.style('display') === 'block') {
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
    }
  }
}

Sprigot.respondToDocKeyDown = function respondToDocKeyDown() {
  // cmd+delete keys
  if ((d3.event.metaKey || d3.event.ctrlKey) && d3.event.which === 8) {
    TextStuff.showDeleteSprigDialog();
  }
}

Sprigot.respondToAddChildSprigCmd = function respondToAddChildSprigCmd() {
  d3.event.stopPropagation();
  if (TextStuff.editZone.classed('editing')) {
    TextStuff.changeEditMode(false);
  }

  var newSprig = {
    id: TextStuff.makeId(8),
    doc: this.docId,
    title: 'New Sprig',
    body: ''
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

  TreeRenderer.update(this.graph.nodeRoot, settings.treeNodeAnimationDuration);
  setTimeout(function afterUpdate() {
    this.graph.focusOnSprig(newSprig.id);
    TextStuff.showTextpaneForTreeNode(newSprig);
  }
  .bind(this),
  settings.treeNodeAnimationDuration + 100);
}

Sprigot.respondToDeleteSprigCmd = function respondToDeleteSprigCmd() {
  d3.event.stopPropagation();
  if (TextStuff.editZone.classed('editing')) {
    TextStuff.changeEditMode(false, true);
  }

  var parentNode = this.graph.focusNode.parent;
  var childIndex = parentNode.children.indexOf(this.graph.focusNode);
  parentNode.children.splice(childIndex, 1);

  var sprigToDelete = {
    id: this.graph.focusNode.id,
    doc: this.docId
  };

  this.store.deleteChildAndSaveParentSprig(sprigToDelete, 
    D3SprigBridge.serializeTreedNode(parentNode));

  var treeNav = this.graph.treeNav;

  TreeRenderer.update(this.graph.nodeRoot, settings.treeNodeAnimationDuration);
  setTimeout(function clickOnParentOfDeletedNode() {
    treeNav.chooseTreeNode(parentNode, d3.select('#' + parentNode.id).node());
  },
  settings.treeNodeAnimationDuration + 500);
}

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


