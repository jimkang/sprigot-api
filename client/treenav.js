function createTreeNav() {

var TreeNav = {
  sprigTree: null,
  graphCamera: null,
  treeRenderer: null,
  graph: null,
  textStuff: null
};

TreeNav.init = function init(sprigTree, camera, treeRenderer, graph, 
  textStuff) {

  this.sprigTree = sprigTree;
  this.graphCamera = camera;
  this.treeRenderer = treeRenderer;
  this.graph = graph;
  this.textStuff = textStuff;
}


TreeNav.chooseTreeNode = function chooseTreeNode(treeNode, treeEl) {
  this.toggleChildren(treeNode);
  this.graph.focusOnTreeNode(treeNode, treeEl);
  TextStuff.showTextpaneForTreeNode(treeNode);
}

TreeNav.toggleChildren = function toggleChildren(treeNode) {
  if (treeNode.children) {
    treeNode._children = treeNode.children;
    treeNode.children = null;
  } 
  else {
    this.expandChildren(treeNode);
  }
}

TreeNav.expandChildren = function expandChildren(treeNode) {
  if (treeNode._children) {
    treeNode.children = treeNode._children;
    treeNode._children = null;
  }
}

TreeNav.collapseRecursively = function collapseRecursively(treeNode) {
  if (treeNode.children) {
    treeNode._children = treeNode.children;
    treeNode._children.forEach(TreeNav.collapseRecursively);
    treeNode.children = null;
  }
}

TreeNav.nodeIsExpanded = function nodeIsExpanded(treeNode) {
  return (treeNode.children && !treeNode._children);
}

TreeNav.followBranchOfNode = function followBranchOfNode(treeNode) {
  var childNode = null;
  if (typeof treeNode.children === 'object') {
    for (var i = treeNode.children.length - 1; i >= 0; --i) {

      childNode = treeNode.children[i];
      if (typeof childNode.emphasized === 'boolean' && childNode.emphasized) {
        break;
      }
    }
  }

  if (childNode) {
    var childEl = d3.select('#' + childNode.id).node();
    this.chooseTreeNode(childNode, childEl);
  }
}

TreeNav.followParentOfNode = function followParentOfNode(treeNode) {
  if (typeof treeNode.parent === 'object') {
    var parentSel = d3.select('#' + treeNode.parent.id);
    this.chooseTreeNode(treeNode.parent, parentSel.node());
    this.graphCamera.panToElement(parentSel);
  }
}

// direction should be negative to go to the left, positive to go to the right.
TreeNav.moveToSiblingNode = function moveToSiblingNode(treeNode, direction) {
  if (typeof treeNode.parent === 'object' &&
    typeof treeNode.parent.children === 'object') {

    var focusIndex = treeNode.parent.children.indexOf(treeNode);
    var siblingIndex = focusIndex + direction;
    if (siblingIndex > -1 && siblingIndex < treeNode.parent.children.length) {
      var siblingNode = treeNode.parent.children[siblingIndex];
      var siblingEl = d3.select('#' + siblingNode.id).node();
      if (siblingNode._children) {
        this.expandChildren(siblingNode);
      }
      this.graph.focusOnTreeNode(siblingNode, siblingEl);
      this.textStuff.showTextpaneForTreeNode(siblingNode);
    }
  }
}

TreeNav.goToSprig = function goToSprig(sprigId, delay) {
  var pathToSprig = D3SprigBridge.mapPathToSprigId(sprigId, this.sprigTree, 100);
  if (pathToSprig.length > 1) {
    this.followPathToSprig(pathToSprig, delay);
  }
}

TreeNav.followPathToSprig = function followPathToSprig(pathToSprig, delay) {
  pathToSprig.forEach(function expandSprig(sprig) {
    this.expandChildren(sprig);
  }
  .bind(this));

  this.treeRenderer.update(this.sprigTree, 0);
  this.graph.focusOnSprig(pathToSprig[pathToSprig.length-1].id, delay);
 }

TreeNav.respondToDownArrow = function respondToDownArrow() {
  d3.event.stopPropagation();
  if (this.nodeIsExpanded(this.graph.focusNode)) {
    this.followBranchOfNode(this.graph.focusNode);
  }
  else {
    this.chooseTreeNode(this.graph.focusNode, 
      d3.select('#' + this.graph.focusNode.id).node());
  }
}

TreeNav.respondToUpArrow = function respondToUpArrow() {
  d3.event.stopPropagation();
  if (this.nodeIsExpanded(this.graph.focusNode)) {
    this.collapseRecursively(this.graph.focusNode);
    this.treeRenderer.update(this.graph.focusNode);
  }
  else {
    this.followParentOfNode(this.graph.focusNode);
  }
}

TreeNav.respondToLeftArrow = function respondToLeftArrow() {
  d3.event.stopPropagation();
  this.moveToSiblingNode(this.graph.focusNode, -1);
}

TreeNav.respondToRightArrow = function respondToRightArrow() {
  d3.event.stopPropagation();
  this.moveToSiblingNode(this.graph.focusNode, 1);
}


return TreeNav;
}