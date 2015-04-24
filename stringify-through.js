var through2 = require('through2');

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
    function stringifyChunk(chunk, enc, callback) {
      this.push(JSON.stringify(chunk, null, indentString) + followupString);
      callback();
    }
  );

  return stringifyThroughStream;  
}

module.exports = createStream;
