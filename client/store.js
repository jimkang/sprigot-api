function createStore() {

var Store = {
  apienvoy: createAPIEnvoy('http://127.0.0.1:3000')
};
// serverURL: 'http://192.168.1.104:3000'
// serverURL: 'http://sprigot-8939.onmodulus.net',
// serverURL: 'http://192.241.250.38', // Digital Ocean


Store.saveSprigFromTreeNode = function saveSprigFromTreeNode(node, docId) {
  var serializedNode = null;
  if (node) {
    serializedNode = D3SprigBridge.serializeTreedNode(node);
  }
  if (serializedNode) {
    var saveId = TextStuff.makeId(4);
    var body = {};
    serializedNode.doc = docId;
    body[saveId] = {
      op: 'saveSprig',
      params: serializedNode
    };
    this.apienvoy.request(body, function done(error, response) {
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

  this.apienvoy.request(body, function done(error, response) {
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
  
  this.apienvoy.request(requestBody, function done(error, response) {
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

  this.apienvoy.request({getDocReq: sprigRequest}, 
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

Store.createNewDoc = function createNewDoc(docParams, rootSprigParams) {
  var requestBody = {}
  var docCreateReqId = 'docCreateReq' + uid(4);
  var rootSprigSaveReqId = 'rootSprigSaveReq' + uid(4);

  requestBody[docCreateReqId] = {
    op: 'saveDoc',
    params: docParams
  };

  requestBody[rootSprigSaveReqId] = {
    op: 'saveSprig',
    params: rootSprigParams
  };

  this.apienvoy.request(requestBody, function done(error, response) {
    if (error) {
      console.log('Error while saving doc:', error);
    }
    else {
      console.log('Saved doc:', response);
    }
  });
}

return Store;
}

