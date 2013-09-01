var margin = {top: 20, right: 10, bottom: 20, left: 10};

var settings = {
  serverURL: 'http://127.0.0.1:3000',
  // serverURL: 'http://192.168.1.104:3000'
  treeNodeAnimationDuration: 750
};

var g = {
  docId: null,
  root: null,
  OKCancelDialog: null,
  expanderArrow: null
};

function click(d) {
  clickOnEl(d, this);
}

function clickOnEl(d, el) {
  TreeNav.toggleChildren(d);
  Graph.focusOnTreeNode(d, el);
  TextStuff.showTextpaneForTreeNode(d);
}

function syncURLToSprigId(sprigId) {
  if (typeof typeof window.history.state === 'object' &&
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


function saveNodeSprig(node) {
  var serializedNode = null;
  if (node) {
    serializedNode = serializeTreedNode(node);
  }
  if (serializedNode) {
    var saveId = TextStuff.makeId(4);
    var body = {};
    serializedNode.doc = g.docId;
    body[saveId] = {
      op: 'saveSprig',
      params: serializedNode
    };
    request(settings.serverURL, body, function done(error, response) {
      if (error) {
        console.log('Error while saving sprig:', error);
        return;
      }

      if (saveId in response && response[saveId].status === 'saved') {
        console.log('Sprig saved:', response);
      }
      else {
        console.log('Sprig not saved.');
      }
    });
  }
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

function showDeleteSprigDialog() {
  g.OKCancelDialog = new OKCancelDialog('#questionDialog', 
    'Do you want to delete this?', 'Delete', 
    respondToDeleteSprigCmd,
    function removeOKCancelDialog() {
      delete g.OKCancelDialog;
    }
  );
  g.OKCancelDialog.show();  
}


function respondToDocKeyDown() {
  // cmd+delete keys
  if ((d3.event.metaKey || d3.event.ctrlKey) && d3.event.which === 8) {
    showDeleteSprigDialog();
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

  var saveNewSprigId = uid(4);
  var saveParentSprigId = uid(4);
  
  var body = {};
  body[saveNewSprigId] = {
    op: 'saveSprig',
    params: newSprig
  };
  body[saveParentSprigId] = {
    op: 'saveSprig',
    params: serializeTreedNode(Graph.focusNode)
  };

  request(settings.serverURL, body, 
  function done(error, response) {
    if (error) {
      console.log('Error while saving sprigs:', error);
      return;
    }

    console.log('New sprig save status:', response[saveNewSprigId].status);
    console.log('Parent sprig save status:', response[saveParentSprigId].status);
  });

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

  var requestBody = {};
  var deleteOpId = uid(4);
  var saveOpId = uid(4);
  requestBody[deleteOpId] = {
    op: 'deleteSprig',
    params: {
      id: Graph.focusNode.id,
      doc: g.docId
    }
  };
  requestBody[saveOpId] = {
    op: 'saveSprig',
    params: serializeTreedNode(parentNode)
  };
  
  request(settings.serverURL, requestBody, function done(error, response) {
    if (error) {
      console.log('Error while saving sprigs:', error);
      return;
    }

    console.log('Sprig deletion status:', response[deleteOpId].status);
    console.log('Parent sprig save status:', response[saveOpId].status);
  });

  TreeRenderer.update(g.root, settings.treeNodeAnimationDuration, 
    function doneUpdating() {
      setTimeout(function clickOnParentOfDeletedNode() {
        clickOnEl(parentNode, d3.select('#' + parentNode.id).node());
      },
      500);
    }
  );
}


/* Persistence */

function createNewDoc() {
  request(settings.serverURL, {
    docPostReq1: {
      op: 'saveDoc',
      params: {
        id: uid(4),
        rootSprig: 'notonline',
        authors: [
          'ignignokt'
        ],
        admins: [
          'ignignokt'
        ]
      }
    }
  },
  function done(error, response) {
    if (error) {
      console.log('Error while saving doc:', error);
    }
    else {
      console.log('Saved doc:', response);
    }
  });
}

/* Initialize */

function initDOM() {
  var sprigotSel = d3.select('body').append('section').attr('id', 'sprigot');
  Graph.init(sprigotSel, Camera, TreeRenderer, TreeNav, TextStuff);
  initDivider(sprigotSel);
  TextStuff.init(sprigotSel, Graph, TreeRenderer);
}

function initDivider(sprigotSel) {
  sprigotSel.append('div').classed('divider', true)
    .append('svg').classed('arrowboard', true)
      .append('polygon').attr({
        id: 'expanderArrow',
        fill: 'rgba(0, 0, 64, 0.4)',
        stroke: '#E0EBFF',
        'stroke-width': 1,
        points: '0,0 32,24 0,48',
        transform: 'translate(0, 0)'
      });
}


function init(docId, focusSprigId) {
  g.docId = docId;

  initDOM();

  g.expanderArrow = d3.select('#expanderArrow');
  g.expanderArrow.on('click', toggleGraphExpansion);

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

  syncExpanderArrow();

  var sprigRequest = {
    op: 'getDoc',
    params: {
      id: docId,
      childDepth: 20
    }
  };

  request(settings.serverURL, {req1: sprigRequest},
    function done(error, response) {
      if (error) {
        console.log('Error while getting sprig:', error);
        return;
      }

      if ('req1' in response && response.req1.status === 'got') {
        var sanitizedTree = sanitizeTreeForD3(response.req1.result.sprigTree);
        Graph.loadNodeTreeToGraph(sanitizedTree, focusSprigId);
        console.log('Load result:', response.req1.result);
      }
      else {
        console.log('Sprig not found.');
      }
    }
  );

  // initGraphWithNodeTree(caseDataSource);
}


/* Widgets */

function syncExpanderArrow() {
  var textPaneIsHidden = TextStuff.pane.classed('collapsedPane');
  var xOffset = textPaneIsHidden ? 36 : 6;
  var transformString = 'translate(' + xOffset + ', 0) ';
  transformString += ('scale(' + (textPaneIsHidden ? '-1' : '1') + ', 1)');

  g.expanderArrow
    .transition()
      .duration(500).ease('linear').attr('transform', transformString)
      .attr('stroke-opacity', 0.5).attr('stroke-width', 2)
    .transition().delay(501).duration(500)
      .attr('stroke-opacity', 0.15).attr('stroke-width', 1);
}

function toggleGraphExpansion() {
  var textPaneIsHidden = TextStuff.pane.classed('collapsedPane');
  var shouldHideTextPane = !textPaneIsHidden;

  TextStuff.pane.classed('collapsedPane', shouldHideTextPane)
    .classed('pane', !shouldHideTextPane);
  Graph.pane.classed('expandedPane', shouldHideTextPane)
    .classed('pane', !shouldHideTextPane);

  syncExpanderArrow();

  if (Graph.focusEl) {
    Camera.panToElement(d3.select(Graph.focusEl));
  }
}
