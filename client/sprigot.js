var margin = {top: 20, right: 10, bottom: 20, left: 10};

var settings = {
  serverURL: 'http://127.0.0.1:3000',
  // serverURL: 'http://192.168.1.104:3000'
  treeNodeAnimationDuration: 750
};

var Sprigot = {
  docId: null
};

Sprigot.init = function init(docId, focusSprigId) {
  this.docId = docId;

  var sprigotSel = d3.select('body').append('section').attr('id', 'sprigot');

  Graph.init(sprigotSel, Camera, TreeRenderer, TreeNav, TextStuff, Historian);
  Divider.init(sprigotSel, Graph, TextStuff, Camera);
  TextStuff.init(sprigotSel, Graph, TreeRenderer, Store, this);
  Historian.init(TreeNav, this.docId);

  Divider.syncExpanderArrow();
  this.initDocEventResponders();

  Store.getSprigTree(docId, function done(error, sprigTree) {
    if (error) {
      console.log('Error while getting sprig:', error);
      return;
    }

    if (sprigTree) {
      var sanitizedTree = sanitizeTreeForD3(sprigTree);
      Graph.loadNodeTreeToGraph(sanitizedTree, focusSprigId);
      console.log('Loaded tree:', sprigTree);
    }
    else {
      console.log('Sprig tree not found.');
    }
  });
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
        TreeNav.respondToDownArrow();
        break;
      // Up arrow.
      case 38:
        TreeNav.respondToUpArrow();
        break;
      // Left arrow.
      case 37:
        TreeNav.respondToLeftArrow();
        break;
      // Right arrow.
      case 39:
        TreeNav.respondToRightArrow();
        break;
      // equal key
      case 187:
        if (d3.event.shiftKey) {
          respondToAddChildSprigCmd();
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

  var currentChildren = Graph.focusNode.children;
  if (!currentChildren) {
    currentChildren = Graph.focusNode._children;
  }
  if (!currentChildren) {
    currentChildren = [];
  }
  currentChildren.push(newSprig);

  Graph.focusNode.children = currentChildren;

  TextStuff.changeEditMode(true);

  Store.saveChildAndParentSprig(newSprig, serializeTreedNode(Graph.focusNode));

  TreeRenderer.update(Graph.nodeRoot, settings.treeNodeAnimationDuration, 
    function done() {
      Graph.focusOnSprig(newSprig.id);
      TextStuff.showTextpaneForTreeNode(newSprig);
    }
  );
}

Sprigot.respondToDeleteSprigCmd = function respondToDeleteSprigCmd() {
  d3.event.stopPropagation();
  if (TextStuff.editZone.classed('editing')) {
    TextStuff.changeEditMode(false, true);
  }

  var parentNode = Graph.focusNode.parent;
  var childIndex = parentNode.children.indexOf(Graph.focusNode);
  parentNode.children.splice(childIndex, 1);

  var sprigToDelete = {
    id: Graph.focusNode.id,
    doc: this.docId
  };

  Store.deleteChildAndSaveParentSprig(sprigToDelete, 
    serializeTreedNode(parentNode));

  TreeRenderer.update(Graph.nodeRoot, settings.treeNodeAnimationDuration, 
    function doneUpdating() {
      setTimeout(function clickOnParentOfDeletedNode() {
        TreeNav.chooseTreeNode(parentNode, 
          d3.select('#' + parentNode.id).node());
      },
      500);
    }
  );
}

