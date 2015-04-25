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
    body: 'tree_body_a',
    children: [
      'tree_sprig_5'
    ]
  },
  server_sprig_2: {
    id: 'server_sprig_2',
    title: 'Server Sprig 2',
    tags: [
      'server',
      'one'
    ],
    body: 'tree_body_b',
    children: [
      'demo_sprig_4'
    ]
  },

  tree: {
    // Has two children.
    tree_sprig_1: {
      id: 'tree_sprig_1',
      title: 'Tree Sprig 1',
      tags: [
        'test',
        'one'
      ],
      body: 'tree_body_a',
      children: [
        'tree_sprig_3',
        'tree_sprig_4'
      ]
    },
    // Has one child.
    tree_sprig_3: {
      id: 'tree_sprig_3',
      title: 'Tree Sprig 1',
      tags: [
        'test',
        'three'
      ],
      body: 'tree_body_c',
      children: [
        'tree_sprig_5'
      ]
    },
    // Has no children.
    tree_sprig_4: {
      id: 'tree_sprig_4',
      title: 'Tree Sprig 4',
      tags: [
        'test',
        'four'
      ],
      body: 'tree_body_d',
      children: []
    },
    // Does not have the 'test' tag; shares a body with tree_sprig_2.
    tree_sprig_5: {
      id: 'tree_sprig_5',
      title: 'Tree Sprig 5',
      tags: [
        'demo',
        'five'
      ],
      body: 'tree_body_b',
      children: []
    }
  }
});

var testBodies = Immutable.Map({
  tree: {
    tree_body_a: {
      id: 'tree_body_a',
      fragment: '<i>This</i> is a body labeled "a". It\'s the root of the tree.'
    },
    tree_body_b: {
      id: 'tree_body_b',
      fragment: 'Body B!'
    },
    tree_body_c: {
      id: 'tree_body_c',
      fragment: '<p>This is test body C.</p>'
    },
    tree_body_d: {
      id: 'tree_body_d',
      fragment: '<h2>D!</h2>'
    }
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
