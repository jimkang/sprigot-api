var Store = {};

Store.saveSprigFromTreeNode = function saveSprigFromTreeNode(node) {
  var serializedNode = null;
  if (node) {
    serializedNode = serializeTreedNode(node);
  }
  if (serializedNode) {
    var saveId = TextStuff.makeId(4);
    var body = {};
    serializedNode.doc = g.docId;
    body[saveId] = {
      op: 'saveSprig',
      params: serializedNode
    };
    request(settings.serverURL, body, function done(error, response) {
      if (error) {
        console.log('Error while saving sprig:', error);
        return;
      }

      if (saveId in response && response[saveId].status === 'saved') {
        console.log('Sprig saved:', response);
      }
      else {
        console.log('Sprig not saved.');
      }
    });
  }
}

Store.saveChildAndParentSprig = function saveChildAndParentSprig(child, 
  parent) {

  var body = {};
  body['saveChildSprigOp'] = {
    op: 'saveSprig',
    params: child
  };
  body['saveParentSprigOp'] = {
    op: 'saveSprig',
    params: parent
  };

  request(settings.serverURL, body, function done(error, response) {
    if (error) {
      console.log('Error while saving sprigs:', error);
      return;
    }

    console.log('Child sprig save status:', 
      response['saveChildSprigOp'].status);
    console.log('Parent sprig save status:', 
      response['saveParentSprigOp'].status);
  });
}

Store.deleteChildAndSaveParentSprig = function deleteChildAndSaveParentSprig(
  child, parent) {

  var requestBody = {};
  requestBody['deleteChildSprigOp'] = {
    op: 'deleteSprig',
    params: child
  };
  requestBody['saveParentSprigOp'] = {
    op: 'saveSprig',
    params: parent
  };
  
  request(settings.serverURL, requestBody, function done(error, response) {
    if (error) {
      console.log('Error while saving sprigs:', error);
      return;
    }

    console.log('Sprig deletion status:', 
      response['deleteChildSprigOp'].status);
    console.log('Parent sprig save status:', 
      response['saveParentSprigOp'].status);
  });
}

Store.getSprigTree = function getSprigTree(docId, outerDone) {
  var sprigRequest = {
    op: 'getDoc',
    params: {
      id: docId,
      childDepth: 40
    }
  };

  request(settings.serverURL, {getDocReq: sprigRequest}, 
    function done(error, response) {
      if (error) {
        if (outerDone) {
          outerDone(error, null)
        }
        return;
      }

      if ('getDocReq' in response && response.getDocReq.status === 'got') {
        if (outerDone) {
          outerDone(null, response.getDocReq.result.sprigTree);
        }
      }
      else {
        if (outerDone) {
          outerDone(null, null);
        }
      }
    }
  );
}

Store.createNewDoc = function createNewDoc() {
  request(settings.serverURL, {
    docPostReq1: {
      op: 'saveDoc',
      params: {
        id: uid(4),
        rootSprig: 'notonline',
        authors: [
          'ignignokt'
        ],
        admins: [
          'ignignokt'
        ]
      }
    }
  },
  function done(error, response) {
    if (error) {
      console.log('Error while saving doc:', error);
    }
    else {
      console.log('Saved doc:', response);
    }
  });
}


