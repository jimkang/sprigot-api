var Director = {
  sprigController: null,
  initialTargetSprigId: null,
  initialTargetDocId: null
};

Director.setUpController = function setUpController(opts) {
  var expectedType = opts.format ? opts.format : 'sprigot';

  if (!this.sprigController || 
    this.sprigController.controllerType !== expectedType) {

    if (opts.format === 'glog') {
      this.sprigController = createSpriglog(opts);
    }
    else {
      this.sprigController = createSprigot(opts);
    }
  }

  return this.sprigController;
};

Director.direct = function direct(locationHash, queryString) {
  var queryOpts = 
    this.dictFromQueryString(this.queryStringFromHash(locationHash));

  var pathSegments = locationHash.split('/');
  if (pathSegments.length < 2) {
    // No docId specified.
    this.directToAbout(queryOpts);
    return;
  }

  switch (pathSegments[1]) {
    case 'index':
      break;
    default:
      this.initialTargetDocId = pathSegments[1];
      if (pathSegments.length > 1) {
        this.initialTargetSprigId = pathSegments[2];
      }      

      this.setUpController(queryOpts);
      this.sprigController.init(this.loadToController.bind(this));
  }
};

Director.loadToController = function loadToController() {
  if (this.sprigController.controllerType === 'sprigot' &&
    this.sprigController.graph.nodeRoot && 
    this.sprigController.docId === this.initialTargetDocId) {

    if (this.initialTargetSprigId === 'findunread') {
      this.sprigController.respondToFindUnreadCmd();
    }
    else if (this.initialTargetSprigId) {
      this.sprigController.graph.treeNav.goToSprigId(
        this.initialTargetSprigId, 100);
    }
  }
  else {
    var identifyFocusSprig = 
      (this.initialTargetSprigId === 'findunread') ? this.matchAny : this.matchFocusSprigId;

    this.sprigController.load(this.initialTargetDocId, identifyFocusSprig, 
      function doneLoading(error) {
      if (error) {
        console.log('Error while getting sprig:', error);
      }
      else {
        if (this.initialTargetSprigId === 'findunread') {
          this.sprigController.respondToFindUnreadCmd();
        }
      }
    });
  }
};

Director.directToAbout = function directToAbout(queryOpts) {

  this.setUpController(queryOpts);

  this.sprigController.init(function initDone() {

    this.sprigController.load('About', 
      this.matchAny, 
      function doneLoading(error) {
        if (error) {
          console.log('Error while getting sprig:', error);
        }
      }
    );
  }
  .bind(this));
};

Director.matchAny = function matchAny() {
  return true;
};

Director.matchFocusSprigId = function matchFocusSprigId(sprig) {
  return (this.initialTargetSprigId === sprig.id);
};

Director.respondToHashChange = function respondToHashChange() {
  this.direct(location.hash);
};

Director.init = function init() {
  this.direct(location.hash, location.search);
  window.onhashchange = this.respondToHashChange.bind(this);
}

Director.queryStringFromHash = function queryStringFromHash(locationHash) {
  var queryString = null;
  var linkParts = locationHash.split('?');
  if (linkParts.length > 1) {
    queryString = linkParts[1];
  }
  return queryString;
};

Director.dictFromQueryString = function dictFromQueryString(queryString) {
  var queryHash = {};
  if (queryString && typeof queryString === 'string') {
    var queryParts = queryString.split('&');
    for (var i = 0; i < queryParts.length; ++i) {
      var queryPart = queryParts[i];
      var keyAndValue = queryPart.split('=');
      if (keyAndValue.length === 2) {
        queryHash[keyAndValue[0]] = keyAndValue[1];
      }
    }
  }
  return queryHash;
};

Director.init();
