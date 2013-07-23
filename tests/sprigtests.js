var assert = require('assert');
var _ = require('underscore');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var caseDataSource = require('../client/caseData');

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

describe('A visitor', function getASprig() {
  it('should not get a sprig using the wrong id', function getSprig(testDone) {
    utils.sendJSONRequest({
      url: settings.baseURL,
      method: 'POST',
      jsonParams: [
        {
          id: 'sprig3req',
          opname: 'getSprig',
          params: {
            sprigId: 'sprig3'
          }
        }
      ],
      done: function doneGettingSprig(error, xhr) {
        debugger;
        assert.equal(xhr.responseText, '[{"error": "whut"}]');
        testDone();
      }
    });
  });

  it('should get a sprig', function getSprig(testDone) {
    utils.sendJSONRequest({
      url: settings.baseURL,
      method: 'POST',
      jsonParams: [
        {
          id: 'sprig1req',
          opname: 'getSprig',
          params: {
            sprigId: 'sprig1'
          }
        }
      ],
      done: function doneGettingSprig(error, xhr) {
        assert.equal(xhr.responseText, JSON.stringify(caseDataSource));
        testDone();
      }
    });

  });

});
