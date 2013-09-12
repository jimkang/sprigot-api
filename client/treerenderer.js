var TreeRenderer = {
  treeLayout: null,
  diagonalProjection: null,
  sprigTree: null,
  graphSVGGroup: null,
  graph: null
};

TreeRenderer.init = function init(sprigTree, graph) {
  // The tree layout generates a left-to-right tree by default, and we want a 
  // top-to-bottom tree, so we flip x and y when we talk to it.
  this.treeLayout = d3.layout.tree();
  this.treeLayout.nodeSize([160, 160]);
  this.sprigTree = sprigTree;
  this.diagonalProjection = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });
  this.graph = graph;
  this.graphSVGGroup = graph.svgRoot;
}

TreeRenderer.update = function update(source, duration) {
  if (!duration) {
    duration = settings.treeNodeAnimationDuration;
  }

  // Compute the new tree layout.
  var nodes = this.treeLayout.nodes(this.sprigTree).reverse();
  nodes.forEach(function swapXAndY(d) {
    var oldX = d.x;
    var oldX0 = d.x0;
    d.x = d.y;
    d.x0 = d.y0;
    d.y = oldX;
    d.y0 = oldX0;
  });

  var links = this.treeLayout.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.x = d.depth * 180; });

  // Update the nodes.
  var node = this.graphSVGGroup.selectAll('g.node')
    .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
    .attr('class', 'node')
    .attr('transform', function(d) { 
      return 'translate(' + source.y0 + ',' + source.x0 + ')'; 
    })
    .attr('id', function(d) { return d.id; })
    .on('click', TreeRenderer.respondToNodeClick);

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
      var fillColor = 'lightsteelblue';
      if (this.graph.nodeHasFocus(d)) {
        fillColor = '#e0362f';
      }
      else if (typeof d.emphasize === 'boolean' && d.emphasize) {
        fillColor = '#08a';        
      }
      return fillColor;
      // return d._children ? 'lightsteelblue' : '#fff'; 
    }
    .bind(this))
    .style('fill-opacity', function(d) {
      var opacity = 0.7;
      if (this.graph.nodeHasFocus(d)) {
        opacity = 1.0;
      }
      return opacity;
    }
    .bind(this))
    .style('stroke-width', function(d) { 
      return (d._children && d._children.length > 0) ? '1.4em' : 0;
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
  var link = this.graphSVGGroup.selectAll('path.link')
    .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert('path', 'g')
    .attr('class', 'link')
    .attr('d', function(d) {
      var o = {x: source.x0, y: source.y0};
      return this.diagonalProjection({source: o, target: o});
    }
    .bind(this));

  // Transition links to their new position.
  link//.transition()
    // .duration(duration)
    .attr('d', this.diagonalProjection)
    .attr('stroke-width', function getLinkWidth(d) {
      if (this.graph.nodeWasVisited(d.target)) {
        return 3;
      }
      else {
        return 1.5;
      }
    }
    .bind(this));

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
    .duration(duration)
    .attr('d', function getLinkData(d) {
      var o = {x: source.x, y: source.y};
      return this.diagonalProjection({source: o, target: o});
    }
    .bind(this))
    .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

TreeRenderer.respondToNodeClick = function respondToNodeClick(treeNode) {
  // Global!
  TreeRenderer.graph.treeNav.chooseTreeNode(treeNode, this);
}

