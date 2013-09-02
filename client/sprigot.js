var margin = {top: 20, right: 10, bottom: 20, left: 10};

var settings = {
  serverURL: 'http://127.0.0.1:3000',
  // serverURL: 'http://192.168.1.104:3000'
  treeNodeAnimationDuration: 750
};

var g = {
  docId: null,
  root: null  
};

function syncURLToSprigId(sprigId) {
  if (typeof window.history.state === 'object' &&
    typeof window.history.state.docId === 'string' &&
    typeof window.history.state.sprigId === 'string' && 
    window.history.state.docId === g.docId &&
    window.history.state.sprigId === sprigId) {
    return;
  }

  var newURL = location.protocol + '//' + location.host + 
    '#/' + g.docId + '/' + sprigId;
  window.history.pushState({
    docId: g.docId,
    sprigId: sprigId
  },
  null, newURL);  
}

function respondToDocKeyUp() {
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

function respondToDocKeyDown() {
  // cmd+delete keys
  if ((d3.event.metaKey || d3.event.ctrlKey) && d3.event.which === 8) {
    TextStuff.showDeleteSprigDialog();
  }
}

function respondToAddChildSprigCmd() {
  d3.event.stopPropagation();
  if (TextStuff.editZone.classed('editing')) {
    TextStuff.changeEditMode(false);
  }

  var newSprig = {
    id: TextStuff.makeId(8),
    doc: g.docId,
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

  TreeRenderer.update(g.root, settings.treeNodeAnimationDuration, function done() {
    Graph.focusOnSprig(newSprig.id);
    TextStuff.showTextpaneForTreeNode(newSprig);
  });
}

function respondToDeleteSprigCmd() {
  d3.event.stopPropagation();
  if (TextStuff.editZone.classed('editing')) {
    TextStuff.changeEditMode(false, true);
  }

  var parentNode = Graph.focusNode.parent;
  var childIndex = parentNode.children.indexOf(Graph.focusNode);
  parentNode.children.splice(childIndex, 1);

  var sprigToDelete = {
    id: Graph.focusNode.id,
    doc: g.docId
  };

  Store.deleteChildAndSaveParentSprig(sprigToDelete, 
    serializeTreedNode(parentNode));

  TreeRenderer.update(g.root, settings.treeNodeAnimationDuration, 
    function doneUpdating() {
      setTimeout(function clickOnParentOfDeletedNode() {
        TreeNav.chooseTreeNode(parentNode, d3.select('#' + parentNode.id).node());
      },
      500);
    }
  );
}

/* Initialize */

function init(docId, focusSprigId) {
  g.docId = docId;

  var sprigotSel = d3.select('body').append('section').attr('id', 'sprigot');
  Graph.init(sprigotSel, Camera, TreeRenderer, TreeNav, TextStuff);
  Divider.init(sprigotSel, Graph, TextStuff, Camera);
  TextStuff.init(sprigotSel, Graph, TreeRenderer, Store);

  var doc = d3.select(document);
  if (TextStuff.editAvailable) {
    doc.on('click', TextStuff.endEditing.bind(TextStuff));
  }
  doc.on('keyup', respondToDocKeyUp);
  doc.on('keydown', respondToDocKeyDown);

  window.onpopstate = function historyStatePopped(e) {
    if (e.state) {
      g.docId = e.state.docId;

      goToSprig(e.state.sprigId);
      setTimeout(function focusOnSprig() {
        var focusSel = d3.select('#' + e.state.sprigId);
        Graph.setFocusEl(focusSel.node());
        Camera.panToElement(focusSel);
      },
      100);
    }
  };

  Divider.syncExpanderArrow();  

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

  // initGraphWithNodeTree(caseDataSource);
}

/* Widgets */


