var Historian = {
  treeNav: null,
  docId: null
};

Historian.init = function init(treeNav, docId) {
  this.treeNav = treeNav;
  this.docId = docId;
  window.onpopstate = this.statePopped.bind(this);
};

Historian.statePopped = function statePopped(e) {
  if (e.state) {
    this.docId = e.state.docId;
    this.treeNav.goToSprigId(e.state.sprigId, 100);
  }
};

Historian.syncURLToSprigId = function syncURLToSprigId(sprigId) {
  if (typeof window.history.state === 'object' &&
    window.history.state &&
    typeof window.history.state.docId === 'string' &&
    typeof window.history.state.sprigId === 'string' && 
    window.history.state.docId === this.docId &&
    window.history.state.sprigId === sprigId) {
    return;
  }

  var newURL = location.protocol + '//' + location.host + location.pathname +
    '#/' + this.docId + '/' + sprigId;
  window.history.pushState({
    docId: this.docId,
    sprigId: sprigId
  },
  null, newURL);  
}
