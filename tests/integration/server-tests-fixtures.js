var Immutable = require('immutable');
var Writable = require('stream').Writable;

var testSprigs = Immutable.Map({
  server_sprig_1: {
    id: 'server_sprig_1',
    title: 'Server Sprig 1',
    tags: [
      'server',
      'one'
    ],
    body: 'This is the body of sprig 1.',
    children: [
      'demo_sprig_5'
    ]
  },
  server_sprig_2: {
    id: 'server_sprig_2',
    title: 'Server Sprig 2',
    tags: [
      'server',
      'one'
    ],
    body: 'This is the body of sprig 2!',
    children: [
      'demo_sprig_4'
    ]
  }
});

var testBodies = Immutable.Map({
  test_body_a: {
    id: 'test_body_a',
    fragment: '<i>This</i> is a body labeled "a".'
  },
  test_body_b: {
    id: 'test_body_b',
    fragment: 'Body B!'
  },
  test_body_c: {
    id: 'test_body_c',
    fragment: '<p>This is test body C.</p>'
  },
  test_body_d: {
    id: 'test_body_d',
    fragment: '<h2>D!</h2>'
  }
});

// Expect this function to make number of expected results + 1 assertions.
function createCheckStream(opts) {
  var checkStream = Writable();
  var chunkIndex = 0;
  var expectedResults = [];
  var t;

  if (opts) {
    t = opts.t;
    expectedResults = opts.expectedResults;
  }

  checkStream._write = function checkChunk(chunk, enc, next) {
    t.deepEqual(
      JSON.parse(chunk.toString()),
      expectedResults[chunkIndex]
    );
    chunkIndex += 1;
    next();
  };

  checkStream.on('finish', function confirmStreamFinish() {
    t.pass('http stream finishes.');
  });

  return checkStream;
}

function failOnError(error) {
  if (error) {
    console.log(error);
  }
  t.fail('Request completes without error');
}

module.exports = {
  sprigs: testSprigs,
  bodies: testBodies,
  createCheckStream: createCheckStream,
  failOnError: failOnError
};
