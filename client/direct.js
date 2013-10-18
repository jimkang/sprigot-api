var Director = {
  sprigController: null
};

Director.createController = function createController(opts) {
  var controller = null;

  if (opts.format === 'glog') {
    controller = createSpriglog(opts);
  }
  else {
    controller = createSprigot(opts);
  }
  return controller;
};

Director.initController = function initController(opts) {
  var expectedType = opts.format ? opts.format : 'sprigot';
  if (!this.sprigController || 
    this.sprigController.controllerType !== expectedType) {

    this.sprigController = this.createController(opts);
  }
};

Director.direct = function direct(locationHash, queryString) {
  var queryOpts = 
    this.dictFromQueryString(this.queryStringFromHash(locationHash));

  var pathSegments = locationHash.split('/');
  if (pathSegments.length < 2) {
    this.sprigController = this.createController(queryOpts);
    this.sprigController.load('About', this.matchAny, function doneLoading(error) {
      if (error) {
        console.log('Error while getting sprig:', error);
      }
    });
    return;
  }

  switch (pathSegments[1]) {
    case 'index':
      break;
    default:
      var docId = pathSegments[1];
      if (pathSegments.length > 1) {
        var sprigId = pathSegments[2];
      }      

      this.initController(queryOpts);

      var identifyFocusSprig = function matchFocusSprigId(sprig) {
        return (sprigId === sprig.id);
      };
      if (sprigId === 'findunread') {
        identifyFocusSprig = this.matchAny;
      }

      if (this.sprigController.controllerType === 'sprigot' &&
        this.sprigController.graph.nodeRoot && 
        this.sprigController.docId === docId) {

        if (sprigId === 'findunread') {
          this.sprigController.respondToFindUnreadCmd();
        }
        else if (sprigId) {
          this.sprigController.graph.treeNav.goToSprigId(sprigId, 100);
        }
      }
      else {
        this.sprigController.load(docId, identifyFocusSprig, function doneLoading(error) {
          if (error) {
            console.log('Error while getting sprig:', error);
          }
          else {
            if (sprigId === 'findunread') {
              this.sprigController.respondToFindUnreadCmd();
            }
          }
        });
      }
  }
};

Director.matchAny = function matchAny() {
  return true;
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
