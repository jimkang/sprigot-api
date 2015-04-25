var through2 = require('through2');
var _ = require('lodash');

function createStream(opts) {
  var indentString = null;
  var followupString = '';
  if (opts) {
    if (opts.indentString) {
      indentString = opts.indentString;
    }
    if (opts.followupString) {
      followupString = opts.followupString;
    }
  }

  var stringifyThroughStream = through2(
    {
      objectMode: true
    },
    function stringifyChunk(result, enc, callback) {
      var adaptedResult = result;
      if (result.error) {
        var adaptedResult = _.cloneDeep(result);
        adaptedResult.error = summarizeError(result.error);
      }
      this.push(
        JSON.stringify(adaptedResult, null, indentString) + followupString
      );
      callback();
    }
  );

  return stringifyThroughStream;  
}

function summarizeError(error) {
  // TODO: Consider logging the stack.
  return {
    message: error.message,
    detail: error.detail
    // stack: error.stack
  };
}
module.exports = createStream;
