var Director = {};

Director.direct = function direct(locationHash) {
  var pathSegments = locationHash.split('/');
  if (pathSegments.length < 2) {
    Sprigot.init('About');
    return;
  }

  switch (pathSegments[1]) {
    case 'index':
      break;
    default:
      var docName = pathSegments[1];
      if (pathSegments.length > 1) {
        var sprigId = pathSegments[2];
      }
      
      Sprigot.init();

      var identifyFocusSprig = function matchFocusSprigId(sprig) {
        return (sprigId === sprig.id);
      };
      if (sprigId === 'findunread') {
        identifyFocusSprig = function matchAny() { return true; };
      }

      if (Sprigot.graph.nodeRoot) {
        if (sprigId === 'findunread') {
          Sprigot.respondToFindUnreadCmd();
        }        
      }
      else {
        Sprigot.load(docName, identifyFocusSprig, function doneLoading(error) {
          if (error) {
            console.log('Error while getting sprig:', error);
          }
          else {
            if (sprigId === 'findunread') {
              Sprigot.respondToFindUnreadCmd();
            }
          }
        });
      }
  }
};

Director.respondToHashChange = function respondToHashChange() {
  this.direct(location.hash);
};

Director.init = function init() {
  this.direct(location.hash);
  window.onhashchange = this.respondToHashChange.bind(this);
}

Director.init();
