
var board = d3.select('svg#svgBoard');
var graph = board.select('g#graphRoot')
  .attr('transform', 'translate(' + 200 + ',' + 200 + ')');

var margin = {top: 20, right: 10, bottom: 20, left: 10},
  width = board.node().clientWidth - margin.right - margin.left,
  height = board.node().clientHeight - margin.top - margin.bottom;
    
var i = 0,
  duration = 750,
  root;

// The tree generates a left-to-right tree, and we want a top-to-bottom tree, 
// so we flip x and y when we talk to it.
var tree = d3.layout.tree();
tree.nodeSize([160, 160]);

var diagonal = d3.svg.diagonal()
  .projection(function(d) { return [d.y, d.x]; });

graph.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// d3.select(self.frameElement).style('height', '800px');

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse();
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
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } 
  else {
    d.children = d._children;
    d._children = null;
    var clickedNode = this;

    // The new nodes are going to be at the same y that this node was at, and 
    // this node is going to move up. So, pan to the old x and y, where the 
    // new nodes will be.
    var clickedEl = d3.select(clickedNode);
    panToElement(clickedEl);
  }
  d.visited = true;
  update(d);

  // Fill in the side pane with the text.
  d3.select('#textpane .textcontent').html(d.body);
  d3.select('#textpane .textcontent').style('display', 'block');
}


root = caseDataSource;
root.x0 = height / 2;
root.y0 = 0;

function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}

BoardZoomer.setUpZoomOnBoard(d3.select('svg#svgBoard'), 
  d3.select('g#graphRoot'));

root.children.forEach(collapse);
collapse(root);
update(root);

d3.select('#textpane .textcontent').style('display', 'none');

setTimeout(function initialPan() {
  panToElement(d3.select('#' + root.id));
},
800);


