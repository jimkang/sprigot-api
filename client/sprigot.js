var margin = {top: 20, right: 10, bottom: 20, left: 10};

var settings = {
  serverURL: 'http://127.0.0.1:3000',
  // serverURL: 'http://192.168.1.104:3000'
  treeNodeAnimationDuration: 750
};

var g = {
  board: null,
  graph: null,
  focusEl: null,
  focusNode: null,
  root: null,
  textcontent: null,
  titleField: null,
  editZone: null,
  addButton: null,
  deleteButton: null,
  editAvailable: true
}


function translateYFromSel(sel) {
  return sel.attr('transform').split(',')[1].split('.')[0];
}

function translateXFromSel(sel) {
  return sel.attr('transform').split(',')[0].split('.')[0].split('(')[1];
}

function panToElement(focusElementSel) {
  var currentScale = BoardZoomer.zoomBehavior.scale();
  var y = parseInt(translateYFromSel(focusElementSel)) * currentScale;
  var x = parseInt(translateXFromSel(focusElementSel)) * currentScale;

  BoardZoomer.panToCenterOnRect({
    x: x,
    y: y,
    width: 1,
    height: 1
  },
  750);
}

// Toggle children on click.
function click(d) {
  clickOnEl(d, this);
}

function clickOnEl(d, el) {
  treenav.toggleChildren(d);
  navigateToTreeNode(d, el);
  showTextpaneForTreeNode(d);
}

function navigateToTreeNode(treeNode, el) {
  setFocusEl(el);
  treeNode.visited = true;
  syncURLToSprigId(treeNode.id);

  treeRenderer.update(g.root);
  
  panToElement(d3.select(g.focusEl));
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

function showTextpaneForTreeNode(treeNode) {
  syncTextpaneWithTreeNode(treeNode);

  d3.selectAll('#textpane :not(.sprigTitleField)').style('display', 'block');
  g.editZone.style('display', 'block');    
  uncollapseTextpane();
}

function uncollapseTextpane() {
  var textPaneIsCollapsed = g.nongraphPane.classed('collapsedPane');
  if (textPaneIsCollapsed) {
    toggleGraphExpansion();
  }
}

function syncTextpaneWithTreeNode(treeNode) {
  g.textcontent.datum(treeNode);
  g.titleField.datum(treeNode);

  g.textcontent.html(treeNode.body);
  g.titleField.html(treeNode.title);
  g.emphasizeCheckbox.attr('value', g.focusNode.emphasize ? 'on' : null);
}

function fadeInTextPane(transitionTime) {
  if (g.editZone.style('display') === 'none') {
    var textpaneEditControls = d3.selectAll('#textpane :not(.sprigTitleField)');
    var textpane = d3.select('#textpane');

    textpane.style('opacity', 0);
    textpaneEditControls.style('opacity', 0);
    g.editZone.style('opacity', 0);

    textpaneEditControls.style('display', 'block')
      .transition().duration(transitionTime)
      .style('opacity', 1);

    g.editZone.style('display', 'block')
      .transition().duration(transitionTime)
      .style('opacity', 1);

    textpane
      .transition().duration(transitionTime)
      .style('opacity', 1);
  }
}


function setFocusEl(el) {
  g.focusEl = el;
  g.focusNode = d3.select(g.focusEl).datum();
}

/* Editing */

function makeId(lengthOfRandomPart) {
  return 's' + uid(lengthOfRandomPart);
  // return Math.floor((1 + Math.random()) * 0x10000)
  //   .toString(16)
  //   .substring(1);
}

function showTitle() {
  g.titleField.text(g.titleField.datum().title);
  g.titleField.style('display', 'block');
}

function changeEditMode(editable, skipSave) {
  if (!g.editAvailable) {
    return;
  }

  g.textcontent.attr('contenteditable', editable);
  g.titleField.attr('contenteditable', editable);
  g.editZone.classed('editing', editable);

  if (editable) {
    showTitle();
    g.textcontent.node().focus();
    // TODO: Make the cursor bolder? Flash the cursor?
  }
  else {
    g.titleField.style('display', 'none');

    var editedNode = g.textcontent.datum();
    editedNode.body = g.textcontent.html();

    var newTitle = g.titleField.text();
    var titleChanged = (newTitle !== editedNode.title);
    editedNode.title = newTitle;
    if (titleChanged) {
      d3.select('#' + editedNode.id + ' text').text(editedNode.title);
    }

    g.textcontent.datum(editedNode);
    g.titleField.datum(editedNode);

    if (!skipSave) {
      saveNodeSprig(g.textcontent.datum());
    }
  }
}

function saveNodeSprig(node) {
  var serializedNode = null;
  if (node) {
    serializedNode = serializeTreedNode(node);
  }
  if (serializedNode) {
    var saveId = makeId(4);
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

function endEditing() {
  if (g.editZone.classed('editing')) {
    changeEditMode(false);
  }
}

function respondToDocKeyUp() {
  // CONSIDER: Disabling all of this listening when editing is going on.

  // Esc
  if (d3.event.keyCode === 27) {
    d3.event.stopPropagation();
    if (g.editZone.classed('editing')) {
      changeEditMode(false);
    }
  }
  else if (!g.editZone.classed('editing')) {
    switch (d3.event.which) {
      // 'e'.
      case 69:
        d3.event.stopPropagation();
        if (g.editZone.style('display') === 'block') {
          changeEditMode(true);
        }
        break;
      // Down arrow.
      case 40:
        respondToDownArrow();
        break;
      // Up arrow.
      case 38:
        respondToUpArrow();
        break;
      // Left arrow.
      case 37:
        respondToLeftArrow();
        break;
      // Right arrow.
      case 39:
        respondToRightArrow();
        break;
      // equal key
      case 187:
        if (d3.event.shiftKey) {
          addChildSprig();
        }
        break;
    }
  }
}

function showDeleteSprigDialog() {
  g.OKCancelDialog = new OKCancelDialog('#questionDialog', 
    'Do you want to delete this?', 'Delete', 
    deleteSprig,
    function removeOKCancelDialog() {
      delete g.OKCancelDialog;
    }
  );
  g.OKCancelDialog.show();  
}

function respondToEmphasisCheckClick(d) {
  if (g.focusNode) {
    g.focusNode.emphasize = (this.value === 'on');
    treeRenderer.update(g.root);
  }
}

function respondToDocKeyDown() {
  // cmd+delete keys
  if ((d3.event.metaKey || d3.event.ctrlKey) && d3.event.which === 8) {
    showDeleteSprigDialog();
  }
}

function respondToDownArrow() {
  d3.event.stopPropagation();
  if (treenav.nodeIsExpanded(g.focusNode)) {
    treenav.followBranchOfNode(g.focusNode);
  }
  else {
    clickOnEl(g.focusNode, d3.select('#' + g.focusNode.id).node());
  }
}

function respondToUpArrow() {
  d3.event.stopPropagation();
  if (nodeIsExpanded(g.focusNode)) {
    treenav.collapseRecursively(g.focusNode);
    sprigTree.update(g.focusNode);
  }
  else {
    treenav.followParentOfNode(g.focusNode);
  }
}

function respondToLeftArrow() {
  d3.event.stopPropagation();
  treenav.moveToSiblingNode(g.focusNode, -1);
}

function respondToRightArrow() {
  d3.event.stopPropagation();
  treenav.moveToSiblingNode(g.focusNode, 1);
}


function respondToEditZoneKeyDown() {
  if ((d3.event.metaKey || d3.event.ctrlKey) && d3.event.which === 13) {
    d3.event.stopPropagation();
    if (g.editZone.classed('editing')) {
      changeEditMode(false);
    } 
  }
}

function startEditing() {
  d3.event.stopPropagation();
  if (!g.editZone.classed('editing')) {
    changeEditMode(true);
  }
}

function addChildSprig() {
  d3.event.stopPropagation();
  if (g.editZone.classed('editing')) {
    changeEditMode(false);
  }

  var newSprig = {
    id: makeId(8),
    doc: g.docId,
    title: 'New Sprig',
    body: ''
  };

  var currentChildren = g.focusNode.children;
  if (!currentChildren) {
    currentChildren = g.focusNode._children;
  }
  if (!currentChildren) {
    currentChildren = [];
  }
  currentChildren.push(newSprig);

  g.focusNode.children = currentChildren;

  changeEditMode(true);

  var saveNewSprigId = uid(4);
  var saveParentSprigId = uid(4);
  
  var body = {};
  body[saveNewSprigId] = {
    op: 'saveSprig',
    params: newSprig
  };
  body[saveParentSprigId] = {
    op: 'saveSprig',
    params: serializeTreedNode(g.focusNode)
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

  sprigTree.update(g.root, settings.treeNodeAnimationDuration, function done() {
    navigateToSprig(newSprig.id);
    showTextpaneForTreeNode(newSprig);
  });
}

function navigateToSprig(sprigId) {
  var sprigSel = d3.select('#' + sprigId);

  setTimeout(function doNavigate() {
    navigateToTreeNode(sprigSel.datum(), sprigSel.node());
  },
  500);
}

function deleteSprig() {
  d3.event.stopPropagation();
  if (g.editZone.classed('editing')) {
    changeEditMode(false, true);
  }

  var parentNode = g.focusNode.parent;
  var childIndex = parentNode.children.indexOf(g.focusNode);
  parentNode.children.splice(childIndex, 1);

  var requestBody = {};
  var deleteOpId = uid(4);
  var saveOpId = uid(4);
  requestBody[deleteOpId] = {
    op: 'deleteSprig',
    params: {
      id: g.focusNode.id,
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

  sprigTreeupdate(g.root, settings.treeNodeAnimationDuration, 
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
  initGraphPane(sprigotSel);
  initDivider(sprigotSel);
  initNongraphPane(sprigotSel);
}

function initGraphPane(sprigotSel) {
  g.graphPane = sprigotSel.append('div')
    .attr('id', 'graphPane')
    .classed('pane', true);

  g.board = g.graphPane.append('svg')
    .attr({
      id: 'svgBoard',
      width: '100%',
      height: '100%'
    });

  g.board.append('g').attr('id', 'background')
    .append('rect').attr({
      width: '100%',
      height: '100%',
      fill: 'rgba(0, 0, 16, 0.2)'
    });

  g.graph = g.board.append('g').attr({
    id: 'graphRoot',
    transform: 'translate(' + margin.left + ',' + margin.top + ')'
  });
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

function initNongraphPane(sprigotSel) {
  g.nongraphPane = sprigotSel.append('div')
    .classed('pane', true).attr('id', 'nongraphPane');
  
  g.nongraphPane.append('div').attr('id', 'questionDialog');
  
  var textpane = g.nongraphPane.append('div').attr('id', 'textpane');
  
  var editZone = textpane.append('div').classed('editZone', true);
  editZone.append('span').classed('sprigTitleField', true);
  editZone.append('div').classed('textcontent', true).attr('tabindex', 0);

  if (g.editAvailable) {
    textpane.append('button').text('+')
      .classed('newsprigbutton', true).classed('editcontrol', true);
    textpane.append('button').text('-')
      .classed('deletesprigbutton', true).classed('editcontrol', true);
    textpane.append('label').text('Emphasize')
      .classed('editcontrol', true);
    textpane.append('input').attr({
      type: 'checkbox',
      id: 'emphasize'
    })
    .classed('editcontrol', true);
  }
}

function initGraphWithNodeTree(nodeTree, focusSprigId) {
  g.root = nodeTree;

  treeRenderer.init(g.root, g.graph);
  treenav.init(g.root);

  var height = g.board.node().clientHeight - margin.top - margin.bottom;
  g.root.x0 = height / 2;
  g.root.y0 = 0;

  treenav.collapseRecursively(g.root);

  if (focusSprigId) {
    treenav.goToSprig(focusSprigId);
  }
  else {
    focusSprigId = g.root.id;
    treeRenderer.update(g.root);
  }

  setTimeout(function initialPan() {
    var focusSel = d3.select('#' + focusSprigId);
    setFocusEl(focusSel.node());
    panToElement(focusSel);

    setTimeout(function initialTextPaneShow() {
      syncTextpaneWithTreeNode(focusSel.datum(), g.focusEl);
      fadeInTextPane(750);
    },
    725);
  },
  800);  
}


function init(docId, focusSprigId) {
  g.docId = docId;

  initDOM();

  g.textcontent = d3.select('#textpane .textcontent');
  g.titleField = d3.select('#textpane .sprigTitleField');
  g.editZone = d3.select('#textpane .editZone');
  g.addButton = d3.select('#textpane .newsprigbutton');
  g.deleteButton = d3.select('#textpane .deletesprigbutton');
  g.emphasizeCheckbox = d3.select('#textpane #emphasize');
  g.expanderArrow = d3.select('#expanderArrow');

  BoardZoomer.setUpZoomOnBoard(d3.select('svg#svgBoard'), 
    d3.select('g#graphRoot'));

  setGraphScale();

  g.editZone.style('display', 'none');
  g.titleField.style('display', 'none');
  d3.selectAll('#textpane *').style('display', 'none');

  if (g.editAvailable) {
    g.textcontent.on('click', startEditing);
    g.titleField.on('click', startEditing);
    g.addButton.on('click', addChildSprig);
    g.deleteButton.on('click', showDeleteSprigDialog);
    g.emphasizeCheckbox.on('click', respondToEmphasisCheckClick)
  }

  g.expanderArrow.on('click', toggleGraphExpansion);

  var doc = d3.select(document);
  if (g.editAvailable) {
    doc.on('click', endEditing);
  }
  doc.on('keyup', respondToDocKeyUp);
  doc.on('keydown', respondToDocKeyDown);

  g.editZone.on('keydown', respondToEditZoneKeyDown);

  window.onpopstate = function historyStatePopped(e) {
    if (e.state) {
      g.docId = e.state.docId;

      goToSprig(e.state.sprigId);
      setTimeout(function focusOnSprig() {
        var focusSel = d3.select('#' + e.state.sprigId);
        setFocusEl(focusSel.node());
        panToElement(focusSel);
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
        initGraphWithNodeTree(sanitizedTree, focusSprigId);
        console.log('Load result:', response.req1.result);
      }
      else {
        console.log('Sprig not found.');
      }
    }
  );

  // initGraphWithNodeTree(caseDataSource);
}

function setGraphScale() {
  var actualBoardHeight = BoardZoomer.getActualHeight(g.board.node());

  if (actualBoardHeight <= 230) {
    BoardZoomer.rootSelection.attr('transform', 'translate(0, 0) scale(0.5)');
    BoardZoomer.zoomBehavior.scale(0.5);
  }
}

/* Widgets */

function syncExpanderArrow() {
  var textPaneIsHidden = g.nongraphPane.classed('collapsedPane');
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
  var textPaneIsHidden = g.nongraphPane.classed('collapsedPane');
  var shouldHideTextPane = !textPaneIsHidden;

  g.nongraphPane.classed('collapsedPane', shouldHideTextPane)
    .classed('pane', !shouldHideTextPane);
  g.graphPane.classed('expandedPane', shouldHideTextPane)
    .classed('pane', !shouldHideTextPane);

  syncExpanderArrow();

  if (g.focusEl) {
    panToElement(d3.select(g.focusEl));
  }
}
