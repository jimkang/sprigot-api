var Historian = {
  treeNav: null
};

Historian.init = function init(treeNav) {
  this.treeNav = treeNav;
  window.onpopstate = this.statePopped.bind(this);
};

Historian.statePopped = function statePopped(e) {
  if (e.state) {
    g.docId = e.state.docId;
    this.treeNav.goToSprig(e.state.sprigId, 100);
  }
};

Historian.syncURLToSprigId = function syncURLToSprigId(sprigId) {
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