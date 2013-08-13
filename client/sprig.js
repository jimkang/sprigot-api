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
  root: null
}

// The tree generates a left-to-right tree, and we want a top-to-bottom tree, 
// so we flip x and y when we talk to it.
var tree = d3.layout.tree();
tree.nodeSize([160, 160]);

var diagonal = d3.svg.diagonal()
  .projection(function(d) { return [d.y, d.x]; });

graph.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// d3.select(self.frameElement).style('height', '800px');

function update(source, done) {

  // Compute the new tree layout.
  var nodes = tree.nodes(g.root).reverse();
  nodes.forEach(function swapXAndY(d) {
    var oldX = d.x;
    var oldX0 = d.x0;
    d.x = d.y;
    d.x0 = d.y0;
    d.y = oldX;
    d.y0 = oldX0;
  });

  var links = tree.links(nodes);

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
      return diagonal({source: o, target: o});
    });

  // Transition links to their new position.
  link//.transition()
    // .duration(duration)
    .attr('d', diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
    .duration(duration)
    .attr('d', function(d) {
      var o = {x: source.x, y: source.y};
      return diagonal({source: o, target: o});
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

var textcontent = d3.select('#textpane .textcontent');
var addButton = d3.select('#textpane .newsprigbutton');
var editTitleButton = d3.select('#textpane .edittitlebutton');


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
  textcontent.html(d.body);
  textcontent.style('display', 'block');
  textcontent.datum(d);
  d3.selectAll('#textpane button').style('display', 'block');
}


function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}

BoardZoomer.setUpZoomOnBoard(d3.select('svg#svgBoard'), 
  d3.select('g#graphRoot'));

/* Editing */

textcontent.style('display', 'none');
d3.selectAll('#textpane button').style('display', 'none');

var textcontent = d3.select('#textpane .textcontent');

function makeId() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

function changeEditMode(editable) {
  textcontent.attr('contenteditable', editable)
    .classed('editing', editable);

  if (!editable) {
    var editedNode = textcontent.datum();
    editedNode.body = textcontent.html();
    textcontent.datum(editedNode);
    // TODO: Sync back to the datum in the tree.

    // serializeTreedNode on node edited.
    var editedNode = textcontent.datum();
    var serializedNode = null;
    if (editedNode) {
      serializedNode = serializeTreedNode(editedNode);
    }
    if (serializedNode) {
      var saveId = uid(8); //makeId();
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
    console.log('serializedNode', serializedNode);
  }
}

function currentlyEditing() {
  var editable = textcontent.attr('contenteditable');
  if (typeof editable === 'string' && editable === 'true') {
    editable = true;
  }
  else {
    editable = false;
  }
  return editable;
}

d3.select(document).on('click', function endEditing() {
  if (currentlyEditing()) {
    changeEditMode(false);
  }
});

d3.select(document).on('keyup', function processKeyUp() {
  // Esc
  if (d3.event.keyCode === 27) {
    d3.event.stopPropagation();
    if (currentlyEditing()) {
      changeEditMode(false);
    }
  }
});

textcontent.on('click', function startEditing() {
  d3.event.stopPropagation();
  if (!currentlyEditing()) {
    changeEditMode(true);
  }
});

addButton.on('click', function addChildSprig() {
  d3.event.stopPropagation();
  if (currentlyEditing()) {
    changeEditMode(false);
  }

  var focusNode = d3.select(g.focusEl).datum();

  var newSprig = {
    id: uid(8),
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
});


/* Persistence */

/* Initialize */

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

