var board = d3.select('svg#svgBoard');
var graph = board.select('g#graphRoot')
  .attr('transform', 'translate(' + 200 + ',' + 200 + ')');

var margin = {top: 20, right: 10, bottom: 20, left: 10},
  width = board.node().clientWidth - margin.right - margin.left,
  height = board.node().clientHeight - margin.top - margin.bottom;
    
var i = 0;
var duration = 750;

var settings = {
  serverURL: 'http://127.0.0.1:3000'
};

var g = {
  focusEl: null,
  root: null,
  treeLayout: null,
  diagonalProjection: null,
  textcontent: null,
  titleField: null,
  editZone: null,
  addButton: null,
  deleteButton: null
}

function update(source, done) {

  // Compute the new tree layout.
  var nodes = g.treeLayout.nodes(g.root).reverse();
  nodes.forEach(function swapXAndY(d) {
    var oldX = d.x;
    var oldX0 = d.x0;
    d.x = d.y;
    d.x0 = d.y0;
    d.y = oldX;
    d.y0 = oldX0;
  });

  var links = g.treeLayout.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.x = d.depth * 180; });

  // Update the nodes.
  var node = graph.selectAll('g.node')
    .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
    .attr('class', 'node')
    .attr('transform', function(d) { 
      return 'translate(' + source.y0 + ',' + source.x0 + ')'; 
    })
    .attr('id', function(d) { return d.id; })
    .on('click', click);

  nodeEnter.append('circle')
    .attr('r', 1e-6)
    .style('fill', function(d) { 
      return d._children ? 'lightsteelblue' : '#fff'; 
    })
    .style('fill-opacity', 0.7)
    .style('stroke', 'rgba(0, 64, 192, 0.7)');

  nodeEnter.append('text')
    .attr('x', function(d) { 
      return d.children || d._children ? '0.3em' : '-0.3em'; 
    })
    .attr('y', '-1em')
    .attr('dy', '.35em')
    .attr('text-anchor', function(d) {
      // Remember: swapXAndY().
      return (d.y > 0) ? 'start' : 'end'; 
    })
    .text(function(d) { return d.title; })
    .style('fill-opacity', 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
    .duration(duration)
    .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; });

  nodeUpdate.select('circle')
    .attr('r', 8)
    .style('fill', function(d) { 
      return d.visited ? 'lightsteelblue' : '#08a'; 
      // return d._children ? 'lightsteelblue' : '#fff'; 
    })
    .style('stroke-width', function(d) { 
      return d._children ? '1.4em' : 0;
    });

  nodeUpdate.select('text')
    .style('fill-opacity', 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
    .duration(duration)
    .attr('transform', function(d) { return 'translate(' + source.y + ',' + source.x + ')'; })
    .remove();

  nodeExit.select('circle')
    .attr('r', 1e-6);

  nodeExit.select('text')
    .style('fill-opacity', 1e-6);

  // Update the links…
  var link = graph.selectAll('path.link')
    .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert('path', 'g')
    .attr('class', 'link')
    .attr('d', function(d) {
      var o = {x: source.x0, y: source.y0};
      return g.diagonalProjection({source: o, target: o});
    });

  // Transition links to their new position.
  link//.transition()
    // .duration(duration)
    .attr('d', g.diagonalProjection);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
    .duration(duration)
    .attr('d', function(d) {
      var o = {x: source.x, y: source.y};
      return g.diagonalProjection({source: o, target: o});
    })
    .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });

  if (done) {
    done();
  }
}

function translateYFromSel(sel) {
  return sel.attr('transform').split(',')[1].split('.')[0];
}

function translateXFromSel(sel) {
  return sel.attr('transform').split(',')[0].split('.')[0].split('(')[1];
}

function panToElement(focusElementSel) {
  var y = parseInt(translateYFromSel(focusElementSel));
  var x = parseInt(translateXFromSel(focusElementSel));

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
  g.focusEl = el;

  if (d.children) {
    d._children = d.children;
    d.children = null;
  } 
  else {
    d.children = d._children;
    d._children = null;

    // The new nodes are going to be at the same y that this node was at, and 
    // this node is going to move up. So, pan to the old x and y, where the 
    // new nodes will be.
    var clickedEl = d3.select(g.focusEl);
    panToElement(clickedEl);
  }
  d.visited = true;
  update(g.root);

  // Fill in the side pane with the text.
  g.textcontent.html(d.body);
  g.textcontent.datum(d);
  g.titleField.datum(d);

  d3.selectAll('#textpane button').style('display', 'block');
  g.editZone.style('display', 'block');
}


function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
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
  g.textcontent.attr('contenteditable', editable);
  g.titleField.attr('contenteditable', editable);
  g.editZone.classed('editing', editable);

  if (editable) {
    showTitle();
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
    serializedNode.doc = '1sU0';
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

d3.select(document).on('click', function endEditing() {
  if (g.editZone.classed('editing')) {
    changeEditMode(false);
  }
});

d3.select(document).on('keyup', function processKeyUp() {
  // Esc
  if (d3.event.keyCode === 27) {
    d3.event.stopPropagation();
    if (g.editZone.classed('editing')) {
      changeEditMode(false);
    }
  }
});

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

  var focusNode = d3.select(g.focusEl).datum();

  var newSprig = {
    id: makeId(8),
    doc: '1sU0',
    title: 'New Sprig',
    body: ''
    // ephemera: {
    //   isNew: true,
    //   parent: focusNode
    // }
  };

  var currentChildren = focusNode.children;
  if (!currentChildren) {
    currentChildren = focusNode._children;
  }
  if (!currentChildren) {
    currentChildren = [];
  }
  currentChildren.push(newSprig);

  focusNode.children = currentChildren;

  var saveNewSprigId = uid(4);
  var saveParentSprigId = uid(4);
  
  var body = {};
  body[saveNewSprigId] = {
    op: 'saveSprig',
    params: newSprig
  };
  body[saveParentSprigId] = {
    op: 'saveSprig',
    params: serializeTreedNode(focusNode)
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

  update(g.root, function done() {
    var newSprigSel = d3.select('#' + newSprig.id);

    setTimeout(function clickOnNewNode() {
      clickOnEl(newSprigSel.datum(), newSprigSel.node());
    },
    500);
  });
}

function deleteSprig() {
  d3.event.stopPropagation();
  if (g.editZone.classed('editing')) {
    changeEditMode(false, true);
  }

  var focusNode = d3.select(g.focusEl).datum();
  var parentNode = focusNode.parent;
  var childIndex = parentNode.children.indexOf(focusNode);
  parentNode.children.splice(childIndex, 1);

  var requestBody = {};
  var deleteOpId = uid(4);
  var saveOpId = uid(4);
  requestBody[deleteOpId] = {
    op: 'deleteSprig',
    params: {
      id: focusNode.id,
      doc: '1sU0'
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


function initGraphWithNodeTree(nodeTree) {
  g.root = nodeTree;
  g.root.x0 = height / 2;
  g.root.y0 = 0;

  g.root.children.forEach(collapse);
  collapse(g.root);
  update(g.root);

  setTimeout(function initialPan() {
    panToElement(d3.select('#' + g.root.id));
  },
  800);  
}


function init() {
  // The tree generates a left-to-right tree, and we want a top-to-bottom tree, 
  // so we flip x and y when we talk to it.
  g.treeLayout = d3.layout.tree();
  g.treeLayout.nodeSize([160, 160]);

  g.diagonalProjection = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

  graph.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  g.textcontent = d3.select('#textpane .textcontent');
  g.titleField = d3.select('#textpane .sprigTitleField');
  g.editZone = d3.select('#textpane .editZone');
  g.addButton = d3.select('#textpane .newsprigbutton');
  g.deleteButton = d3.select('#textpane .deletesprigbutton');

  BoardZoomer.setUpZoomOnBoard(d3.select('svg#svgBoard'), 
    d3.select('g#graphRoot'));

  g.editZone.style('display', 'none');
  g.titleField.style('display', 'none');
  d3.selectAll('#textpane button').style('display', 'none');

  g.textcontent.on('click', startEditing);
  g.titleField.on('click', startEditing);
  g.addButton.on('click', addChildSprig);
  g.deleteButton.on('click', deleteSprig);

  var sprigRequest = {
    op: 'getSprig',
    params: {
      id: 'notonline',
      doc: '1sU0',
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
        var sanitizedTree = sanitizeTreeForD3(response.req1.result);
        initGraphWithNodeTree(sanitizedTree);
        console.log('Load result:', response.req1.result);
      }
      else {
        console.log('Sprig not found.');
      }
    }
  );

  // initGraphWithNodeTree(caseDataSource);
}

init();
