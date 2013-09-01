var treenav = {
  sprigTree: null 
};

treenav.init = function init(sprigTree) {
  this.sprigTree = sprigTree;
}

treenav.toggleChildren = function toggleChildren(treeNode) {
  if (treeNode.children) {
    treeNode._children = treeNode.children;
    treeNode.children = null;
  } 
  else {
    this.expandChildren(treeNode);
  }
}

treenav.expandChildren = function expandChildren(treeNode) {
  if (treeNode._children) {
    treeNode.children = treeNode._children;
    treeNode._children = null;
  }
}

treenav.collapseRecursively = function collapseRecursively(treeNode) {
  if (treeNode.children) {
    treeNode._children = treeNode.children;
    treeNode._children.forEach(treenav.collapseRecursively);
    treeNode.children = null;
  }
}

treenav.nodeIsExpanded = function nodeIsExpanded(treeNode) {
  return (treeNode.children && !treeNode._children);
}

treenav.followBranchOfNode = function followBranchOfNode(treeNode) {
  // TODO: Define primary paths?
  var childIndex = 0;
  if (typeof treeNode.children === 'object' && 
    childIndex < treeNode.children.length) {

    var childNode = treeNode.children[childIndex];
    var childEl = d3.select('#' + childNode.id).node();
    clickOnEl(childNode, childEl);
  }
}

treenav.followParentOfNode = function followParentOfNode(treeNode) {
  if (typeof treeNode.parent === 'object') {
    var parentSel = d3.select('#' + treeNode.parent.id);
    clickOnEl(treeNode.parent, parentSel.node());
    panToElement(parentSel);
  }
}

// direction should be negative to go to the left, positive to go to the right.
treenav.moveToSiblingNode = function moveToSiblingNode(treeNode, direction) {
  if (typeof treeNode.parent === 'object' &&
    typeof treeNode.parent.children === 'object') {

    var parentSel = d3.select('#' + treeNode.parent.id);
    var focusIndex = treeNode.parent.children.indexOf(treeNode);
    var siblingIndex = focusIndex + direction;
    if (siblingIndex > -1 && siblingIndex < treeNode.parent.children.length) {
      var siblingNode = treeNode.parent.children[siblingIndex];
      var siblingEl = d3.select('#' + siblingNode.id).node();
      if (siblingNode._children) {
        this.expandChildren(siblingNode);
      }
      navigateToTreeNode(siblingNode, siblingEl);
      showTextpaneForTreeNode(siblingNode);
    }
  }
}

treenav.goToSprig = function goToSprig(sprigId) {
  var pathToSprig = mapPathToSprigInD3Tree(sprigId, this.sprigTree, 100);
  if (pathToSprig.length > 1) {
    pathToSprig.forEach(function expandSprig(sprig) {
      this.expandChildren(sprig);
    }
    .bind(this));

    treeRenderer.update(this.sprigTree, 0, function done() {
      navigateToSprig(sprigId);
    });
  }
}
