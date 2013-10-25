var assert = require('assert');
var _ = require('underscore');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var caseDataSource = require('./caseData');
var sprigTree = require('../client/d3sprigbridge')
var uid = require('../client/uid').uid;

/* Utils */

var utils = {};

utils.sendJSONRequest = function sendJSONRequest(options) {
  var optionsValidated = utils.optionsAreValid(options, {
    url: 'string',
    done: 'function',
    jsonParams: 'object',
    method: 'string'
    // Optional:
    // authHeader: 'string'
  });

	if (!optionsValidated) {
	  if (options.done) {
	    options.done('Invalid params for sendJSONRequest.', null);
	  }
	  return;
	}

	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function processXHRStateChange() {
	  if (4 == xhr.readyState && 0 !== xhr.status) {
	    options.done(null, xhr);
	  }
	}
	xhr.onerror = function(e) { return options.done(e, null); };
	xhr.open(options.method, options.url, true);
	// Content-Type must be capitalized exactly, or node-xmlhttprequest will 
	// overwrite it.
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.setRequestHeader("accept", "application/json");
	var preparedParams = encodeURIComponent(JSON.stringify(options.jsonParams));

	if (options.authHeader) {
    xhr.setRequestHeader('Authorization', options.authHeader);
	}

	var preparedParams = JSON.stringify(options.jsonParams);
	if (!preparedParams) {
	  preparedParams = '{}';
	}
	xhr.send(preparedParams);
};

utils.optionsAreValid = function optionsAreValid(options, expectedTypes) {
  if (!options) {
    options = {};
  }
  return _.every(expectedTypes, function optionIsValid(expectedType, key) {
    var valid = false;
    var value = options[key];
    return (typeof value === expectedType);
  });
};

utils.addDocRefToNodesInTree = function addDocRefToNodesInTree(tree, docId) {
  tree.doc = docId;
  for (var i = 0; i < tree.children; ++i) {
    var child = tree.children[i];
    utils.addDocRefToNodesInTree(child, docId);
  }
};



/* Settings */

var settings = {
  baseURL: 'http://localhost:3000'
  // baseURL: 'http://sprigot-8939.onmodulus.net'
  // baseURL: 'http://192.241.250.38'
};

/* Session */

var session = {

};

/* The tests */

/* Actor: Visitor */

session.rootSprig = sprigTree.serializeTreedNode(caseDataSource);

describe('A visitor', function getASprig() {

  it('should not get a sprig using the wrong id', function getSprig(testDone) {
    utils.sendJSONRequest({
      url: settings.baseURL,
      method: 'POST',
      jsonParams: {
        sprig3req: {
          op: 'getSprig',
          params: {
            id: 'sprig3',
            doc: 'doc1'
          }
        }
      },
      done: function doneGettingSprig(error, xhr) {
        var response = JSON.parse(xhr.responseText);
        assert.equal(response.sprig3req.status, 'Not found');
        testDone();
      }
    });
  });

  it('should post a doc', function postDoc(testDone) {
    session.firstDocId = uid(4);

    utils.sendJSONRequest({
      url: settings.baseURL,
      method: 'POST',
      jsonParams: {
        docPostReq1: {
          op: 'saveDoc',
          params: {
            id: session.firstDocId,
            rootSprig: session.rootSprig.id,
            authors: [
              'deathmtn', 'smidgeo'
            ],
            admins: [
              'deathmtn'
            ],
            readers: [
              'smidgeo', 'drwily'
            ]
          }
        }
      },
      done: function donePostingDoc(error, xhr) {
        var response = JSON.parse(xhr.responseText);
        assert.deepEqual(response.docPostReq1, {
          status: 'saved',
          result: {
            id: session.firstDocId
          }
        });
        testDone();
      }
    });
  });

  it('should post more docs', function postDocs(testDone) {
    session.secondDocId = uid(4);

    session.deepDocParams = {
      id: uid(4),
      rootSprig: session.rootSprig.id,
      authors: [
        'drwily'
      ],
      admins: [
        'drwily'
      ],
      readers: [
        'smidgeo', 'drwily'
      ]
    };

    utils.sendJSONRequest({
      url: settings.baseURL,
      method: 'POST',
      jsonParams: {
        docPostReq1: {
          op: 'saveDoc',
          params: {
            id: session.secondDocId,
            rootSprig: session.rootSprig.id,
            authors: [
              'smidgeo'
            ],
            admins: [
              'smidgeo'
            ],
            readers: [
              'smidgeo', 'drwily'
            ]
          }
        },
        docPostReq2: {
          op: 'saveDoc',
          params: session.deepDocParams
        }
      },
      done: function donePostingDoc(error, xhr) {
        var response = JSON.parse(xhr.responseText);
        assert.deepEqual(response.docPostReq1, {
          status: 'saved',
          result: {
            id: session.secondDocId
          }
        });
        assert.deepEqual(response.docPostReq2, {
          status: 'saved',
          result: {
            id: session.deepDocParams.id
          }
        });
        testDone();
      }
    });
  });

  // TODO: Auth tests.

  it('should post a sprig', function postSprig(testDone) {
    session.rootSprig.doc = session.firstDocId;

    utils.sendJSONRequest({
      url: settings.baseURL,
      method: 'POST',
      jsonParams: {
        sprig2req: {
          op: 'saveSprig',
          params: session.rootSprig
        }
      },
      done: function donePostingSprig(error, xhr) {
        var response = JSON.parse(xhr.responseText);
        assert.deepEqual(response.sprig2req, {
          status: 'saved',
          result: {
            id: session.rootSprig.id
          }
        });
        testDone();
      }
    });
  });

  it('should not post a sprig lacking a doc', function postSprig(testDone) {
    utils.sendJSONRequest({
      url: settings.baseURL,
      method: 'POST',
      jsonParams: {
        sprig2req: {
          op: 'saveSprig',
          params: {
            id: 'sprig234',
            sprigContents: session.rootSprig
          }
        }
      },
      done: function donePostingSprig(error, xhr) {
        var response = JSON.parse(xhr.responseText);
        assert.deepEqual(response.sprig2req, {
          status: 'Not understood',
          result: null
        });
        testDone();
      }
    });
  });


  it('should get a sprig', function getSprig(testDone) {
    utils.sendJSONRequest({
      url: settings.baseURL,
      method: 'POST',
      jsonParams: {
        sprig1req: {
          op: 'getSprig',
          params: {
            id: session.rootSprig.id,
            doc: session.firstDocId,
            childDepth: 0
          }
        }
      },
      done: function doneGettingSprig(error, xhr) {
        var response = JSON.parse(xhr.responseText);
        assert.deepEqual(response.sprig1req.result, session.rootSprig);
        testDone();
      }
    });
  });

  it('should post a sprig, and also get a sprig', 
    function postAndGetSprig(testDone) {
      session.orphanSprigOneId = uid(4);
      session.orphanSprigTwoId = uid(4);

      var testSprig1 = {
        id: session.orphanSprigOneId,
        doc: session.firstDocId,
        title: 'One',
        body: 'First, there was one.',
        children: [session.orphanSprigTwoId]
      };

      var testSprig2 = {
        id: session.orphanSprigTwoId,
        doc: session.firstDocId,
        title: 'Two',
        body: 'Then, there were two.',
      };

      utils.sendJSONRequest({
        url: settings.baseURL,
        method: 'POST',
        jsonParams: {
          sprig1req: {
            op: 'saveSprig',
            params: testSprig1
          },
          sprig2req: {
            op: 'saveSprig',
            params: testSprig2
          },
          sprig3req: {
            op: 'getSprig',
            params: {
              id: session.rootSprig.id,
              doc: session.firstDocId
            }            
          }
        },
        done: function donePostingAndGettingSprig(error, xhr) {
          var response = JSON.parse(xhr.responseText);
          assert.deepEqual(response.sprig1req, {
            status: 'saved',
            result: {
              id: session.orphanSprigOneId
            }
          });
          assert.deepEqual(response.sprig2req.result.id, 
            session.orphanSprigTwoId);
          assert.deepEqual(response.sprig3req.result, session.rootSprig);
          testDone();
        }
      }
    );
  });

  it('should post four sprigs that are part of a hierarchy', 
    function postHierarchicalSprigs(testDone) {

      var sprigOneId = uid(8);
      var sprigTwoId = uid(8);
      var sprigThreeId = uid(8);
      var sprigFourId = uid(8);

      session.sprigOne = {
        id: sprigOneId,
        doc: session.secondDocId,
        title: 'Sprig One',
        body: 'First, there was one sprig.',
        created: (new Date(1382448629053)).toJSON(),
        modified: (new Date()).toJSON(),
        children: [sprigTwoId, sprigThreeId]
      };

      session.sprigTwo = {
        id: sprigTwoId,
        doc: session.secondDocId,
        title: 'Sprig Two',
        body: 'Then, there was a second sprig.',
        created: (new Date(1382448629053)).toJSON(),
        modified: (new Date()).toJSON()
      };

      session.sprigThree = {
        id: sprigThreeId,
        doc: session.secondDocId,
        title: 'Sprig Three',
        body: 'Soon after, a third sprig appeared.',
        created: (new Date(1382448629053)).toJSON(),
        modified: (new Date()).toJSON(),        
        children: [sprigFourId]
      };

      session.sprigFour = {
        id: sprigFourId,
        doc: session.secondDocId,
        title: 'Sprig Four',
        body: 'Finally, the fourth sprig showed.',
        created: (new Date(1382448629053)).toJSON(),
        modified: (new Date()).toJSON()
      };

      utils.sendJSONRequest({
        url: settings.baseURL,
        method: 'POST',
        jsonParams: {
          sprig1req: {
            op: 'saveSprig',
            params: session.sprigOne
          },
          sprig2req: {
            op: 'saveSprig',
            params: session.sprigTwo
          },
          sprig3req: {
            op: 'saveSprig',
            params: session.sprigThree
          },
          sprig4req: {
            op: 'saveSprig',
            params: session.sprigFour
          },
        },
        done: function donePostingSprigHierarchy(error, xhr) {
          var response = JSON.parse(xhr.responseText);
          // console.log(response);
          assert.deepEqual(response.sprig1req, {
            status: 'saved',
            result: {
              id: session.sprigOne.id
            }
          });
          assert.deepEqual(response.sprig2req, {
            status: 'saved',
            result: {
              id: session.sprigTwo.id
            }
          });
          assert.deepEqual(response.sprig3req, {
            status: 'saved',
            result: {
              id: session.sprigThree.id
            }
          });
          assert.deepEqual(response.sprig4req, {
            status: 'saved',
            result: {
              id: session.sprigFour.id
            }
          });

          testDone();
        }
      });
  });

  it('should get a sprig hierarchy', function getSprigHierarchy(testDone) {
    var sprigTree = session.sprigOne;
    sprigTree.children = [
      session.sprigTwo,
      session.sprigThree
    ];
    sprigTree.children[1].children = [session.sprigFour];

    utils.sendJSONRequest({
      url: settings.baseURL,
      method: 'POST',
      jsonParams: {
        sprig1req: {
          op: 'getSprig',
          params: {            
            id: session.sprigOne.id,
            doc: session.secondDocId,
            childDepth: 2
          }
        }
      },
      done: function doneGettingSprig(error, xhr) {
        var response = JSON.parse(xhr.responseText);
        var fetchedTree = response.sprig1req.result;
        assert.deepEqual(sprigTree, fetchedTree);
        testDone();
      }
    });
  });

  it('should post a deeper hierarchy', 
    function postHierarchicalSprigs(testDone) {

      var sprigs = [];
      function walkTree(tree) {
        tree.doc = session.deepDocParams.id;
        var serializedNode = sprigTree.serializeTreedNode(tree);
        sprigs.push(serializedNode);
        if (tree.children) {
          tree.children.forEach(walkTree);
        }
      }
      walkTree(caseDataSource);

      var reqParams = {};
      sprigs.forEach(function addRequestForSprig(sprig) {
        reqParams[sprig.id + 'req'] = {
          op: 'saveSprig',
          params: sprig
        };
      });

      utils.sendJSONRequest({
        url: settings.baseURL,
        method: 'POST',
        jsonParams: reqParams,
        done: function donePostingSprigHierarchy(error, xhr) {
          var response = JSON.parse(xhr.responseText);

          for (var reqId in reqParams) {
            assert.deepEqual(response[reqId], {
              status: 'saved',
              result: {
                id: reqParams[reqId].params.id
              }
            });
          }

          testDone();
        }
      });
  });

  it('should get a deep tree hierarchy via the doc', function getSprigTree(
    testDone) {
    utils.addDocRefToNodesInTree(caseDataSource, session.deepDocParams.id);    

    utils.sendJSONRequest({
      url: settings.baseURL,
      method: 'POST',
      jsonParams: {
        sprig1req: {
          op: 'getDoc',
          params: {            
            id: session.deepDocParams.id,
            childDepth: 20
          }
        }
      },
      done: function doneGettingSprig(error, xhr) {
        var response = JSON.parse(xhr.responseText);
        assert.deepEqual(_.omit(response.sprig1req.result, 'sprigTree'), 
          session.deepDocParams);
        var fetchedTree = response.sprig1req.result.sprigTree;
        assert.deepEqual(fetchedTree, caseDataSource);
        testDone();
      }
    });
  });

  it('should get a list via the doc', function getSprigList(
    testDone) {

    utils.addDocRefToNodesInTree(caseDataSource, session.deepDocParams.id);

    utils.sendJSONRequest({
      url: settings.baseURL,
      method: 'POST',
      jsonParams: {
        sprig1req: {
          op: 'getDoc',
          params: {            
            id: session.deepDocParams.id,
            flatten: true
          }
        }
      },
      done: function doneGettingSprig(error, xhr) {
        var response = JSON.parse(xhr.responseText);

        // Check doc params.
        assert.deepEqual(_.omit(response.sprig1req.result, 'sprigList'), 
          session.deepDocParams);

        // Walk tree, make sure everything in the tree is in the fetched list.
        var fetchedList = response.sprig1req.result.sprigList;
        var nodesAtDepth = [caseDataSource];
        debugger;
        do {
          var nodesAtNextDepth = [];
          for (var i = 0; i < nodesAtDepth.length; ++i) {
            var currentTreeNode = nodesAtDepth[i];
            var matches = _.where(fetchedList, {id: currentTreeNode.id});
            assert.equal(matches.length, 1);

            if (matches.length === 1) {
              var match = matches[0];
              assert.equal(match.title, currentTreeNode.title);
              assert.equal(match.body, currentTreeNode.body);
              assert.equal(match.created, currentTreeNode.created);
              assert.equal(match.modified, currentTreeNode.modified);

              // Children should just be string references.
              if (match.children) {
                assert.equal(typeof match.children[0], 'string');
              }
            }

            if (typeof currentTreeNode.children === 'object') {
              nodesAtNextDepth = 
                nodesAtNextDepth.concat(currentTreeNode.children);                
            }
          }
          nodesAtDepth = nodesAtNextDepth;
        }
        while (nodesAtDepth.length > 0);

        testDone();
      }
    });

  });

  it('should delete a sprig', function deleteSprig(testDone) {
    // console.log('deleting', session.secondDocId, session.sprigOne.id);

    utils.sendJSONRequest({
      url: settings.baseURL,
      method: 'POST',
      jsonParams: {
        sprig100req: {
          op: 'deleteSprig',
          params: {
            id: session.sprigOne.id,
            doc: session.secondDocId
          }
        }
      },
      done: function doneDeleting(error, xhr) {
        var response = JSON.parse(xhr.responseText);
        assert.deepEqual(response.sprig100req, {
          status: 'deleted',
          result: {
            id: session.sprigOne.id
          }
        });
        testDone();
      }
    });
  });

  it('should get a version', function getVersion(testDone) {
    utils.sendJSONRequest({
      url: settings.baseURL,
      method: 'POST',
      jsonParams: {
        sprigVersionReq: {
          op: 'getVersion'
        }
      },
      done: function doneGettingVersion(error, xhr) {
        var response = JSON.parse(xhr.responseText);
        debugger;
        assert.ok(typeof response.sprigVersionReq.result === 'string');
        console.log('Version:', response.sprigVersionReq.result);
        testDone();
      }
    });
  });

});

