function direct(locationHash) {
  var pathSegments = locationHash.split('/');
  if (pathSegments.length < 2) {
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
      
      Sprigot.init(docName, sprigId);
  }
}

direct(location.hash);

function respondToHashChange() {
  direct(location.hash);
}
window.onhashchange = respondToHashChange;
