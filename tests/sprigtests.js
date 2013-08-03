var assert = require('assert');
var _ = require('underscore');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var caseDataSource = require('../client/caseData');
var sprigTree = require('../client/sprig-tree_relations')
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
}

/* Settings */

var settings = {
  baseURL: 'http://localhost:3000'
};

/* Session */

var session = {

};

/* The tests */

/* Actor: Visitor */

var rootSprig = sprigTree.serializeTreedNode(caseDataSource);

describe('A visitor', function getASprig() {
  it('should not get a sprig using the wrong id', function getSprig(testDone) {
    utils.sendJSONRequest({
      url: settings.baseURL,
      method: 'POST',
      jsonParams: {
        sprig3req: {
          op: 'getSprig',
          params: {
            sprigId: 'sprig3'
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

  it('should post a sprig', function postSprig(testDone) {
    utils.sendJSONRequest({
      url: settings.baseURL,
      method: 'POST',
      jsonParams: {
        sprig2req: {
          op: 'saveSprig',
          params: {
            sprigId: 'sprig2',
            sprigContents: rootSprig
          }
        }
      },
      done: function donePostingSprig(error, xhr) {
        var response = JSON.parse(xhr.responseText);
        assert.deepEqual(response.sprig2req, {
          status: 'posted',
          result: {
            sprigId: 'sprig2'
          }
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
            sprigId: 'sprig2',
            childDepth: 0
          }
        }
      },
      done: function doneGettingSprig(error, xhr) {
        var response = JSON.parse(xhr.responseText);
        assert.deepEqual(response.sprig1req.result, rootSprig);
        testDone();
      }
    });
  });

  it('should post a sprig, and also get a sprig', function postAndGetSprig(testDone) {
    var testSprigContents = {
      id: 'one',
      title: 'One',
      body: 'First, there was one.',
      children: [
        {
          id: 'two',
          title: 'Two',
          body: 'Then, there were two.'
        }
      ]
    };

    utils.sendJSONRequest({
      url: settings.baseURL,
      method: 'POST',
      jsonParams: {
        sprig1req: {
          op: 'saveSprig',
          params: {
            sprigId: 'sprig10',
            sprigContents: testSprigContents
          }
        },
        sprig2req: {
          op: 'getSprig',
          params: {
            sprigId: 'sprig2'
          }
        }
      },
      done: function donePostingAndGettingSprig(error, xhr) {
        var response = JSON.parse(xhr.responseText);
        // console.log(response);
        assert.deepEqual(response.sprig1req, {
          status: 'posted',
          result: {
            sprigId: 'sprig10'
          }
        });
        assert.deepEqual(response.sprig2req.result, rootSprig);        
        testDone();
      }
    });
  });

  it('should post four sprigs that are part of a hierarchy', 
    function postHierarchicalSprigs(testDone) {

      var sprigOneId = uid(8);
      var sprigTwoId = uid(8);
      var sprigThreeId = uid(8);
      var sprigFourId = uid(8);

      session.sprigOne = {
        id: sprigOneId,
        title: 'Sprig One',
        body: 'First, there was one sprig.',
        children: [sprigTwoId, sprigThreeId]
      };

      session.sprigTwo = {
        id: sprigTwoId,
        title: 'Sprig Two',
        body: 'Then, there was a second sprig.'
      };

      session.sprigThree = {
        id: sprigThreeId,
        title: 'Sprig Three',
        body: 'Soon after, a third sprig appeared.',
        children: [sprigFourId]
      };

      session.sprigFour = {
        id: sprigFourId,
        title: 'Sprig Four',
        body: 'Finally, the fourth sprig showed.'
      };

      utils.sendJSONRequest({
        url: settings.baseURL,
        method: 'POST',
        jsonParams: {
          sprig1req: {
            op: 'saveSprig',
            params: {
              sprigId: sprigOneId,
              sprigContents: session.sprigOne
            }
          },
          sprig2req: {
            op: 'saveSprig',
            params: {
              sprigId: sprigTwoId,
              sprigContents: session.sprigTwo
            }
          },
          sprig3req: {
            op: 'saveSprig',
            params: {
              sprigId: sprigThreeId,
              sprigContents: session.sprigThree
            }
          },
          sprig4req: {
            op: 'saveSprig',
            params: {
              sprigId: sprigFourId,
              sprigContents: session.sprigFour
            }
          },
        },
        done: function donePostingSprigHierarchy(error, xhr) {
          var response = JSON.parse(xhr.responseText);
          // console.log(response);
          assert.deepEqual(response.sprig1req, {
            status: 'posted',
            result: {
              sprigId: session.sprigOne.id
            }
          });
          assert.deepEqual(response.sprig2req, {
            status: 'posted',
            result: {
              sprigId: session.sprigTwo.id
            }
          });
          assert.deepEqual(response.sprig3req, {
            status: 'posted',
            result: {
              sprigId: session.sprigThree.id
            }
          });
          assert.deepEqual(response.sprig4req, {
            status: 'posted',
            result: {
              sprigId: session.sprigFour.id
            }
          });

          testDone();
        }
      });
  });

  it('should get a sprig hierarchy', function getSprigHierarchy(testDone) {
    var sprigTree = {
      id: session.sprigOne.id,
      title: 'Sprig One',
      body: 'First, there was one sprig.',
      children: [
        {
          id: session.sprigTwo.id,
          title: 'Sprig Two',
          body: 'Then, there was a second sprig.'
        },
        {
          id: session.sprigThree.id,
          title: 'Sprig Three',
          body: 'Soon after, a third sprig appeared.',
          children: [
            {
              id: session.sprigFour.id,
              title: 'Sprig Four',
              body: 'Finally, the fourth sprig showed.'
            }
          ]
        }
      ]
    };

    utils.sendJSONRequest({
      url: settings.baseURL,
      method: 'POST',
      jsonParams: {
        sprig1req: {
          op: 'getSprig',
          params: {
            sprigId: session.sprigOne.id,
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

});

