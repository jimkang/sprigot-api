var Director = {};

Director.direct = function direct(locationHash) {
  var pathSegments = locationHash.split('/');
  if (pathSegments.length < 2) {
    Sprigot.init();
    Sprigot.load('About', this.matchAny, function doneLoading(error) {
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
      
      Sprigot.init();

      var identifyFocusSprig = function matchFocusSprigId(sprig) {
        return (sprigId === sprig.id);
      };
      if (sprigId === 'findunread') {
        identifyFocusSprig = this.matchAny;
      }

      if (Sprigot.graph.nodeRoot && Sprigot.docId === docId) {
        if (sprigId === 'findunread') {
          Sprigot.respondToFindUnreadCmd();
        }
        else if (sprigId) {
          Sprigot.graph.treeNav.goToSprigId(sprigId, 100);
        }
      }
      else {
        Sprigot.load(docId, identifyFocusSprig, function doneLoading(error) {
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

Director.matchAny = function matchAny() {
  return true;
};

Director.respondToHashChange = function respondToHashChange() {
  this.direct(location.hash);
};

Director.init = function init() {
  this.direct(location.hash);
  window.onhashchange = this.respondToHashChange.bind(this);
}

Director.init();
