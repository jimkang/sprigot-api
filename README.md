sprigot-api
===========

The API server for [Sprigot](http://sprigot.com), a tree document presenter. This is the next generation version of the API, not currently deployed.

Installation
------------

- Clone this repo.
- Run `npm install`.
- Install pm2:

    [sudo] npm install -g pm2

  This isn't absolutely necessary, but the Makefile target depends on it. Without it, you can just run the server directly with Node.

- Run with either `make start` if you've installed pm2. Otherwise `node server.js`.

Store API
---------

  - getSprig/saveSprig
  - getBody/saveBody
  - getSprigsByTag (TODO)
  - getSprigsUnderRoot
  - getBodies
  - getTreeKit (getSprigsUnderRoot and getBodies of those sprigs)
  - deleteSprig (TODO)
  - detleteBody (TODO)

  Implementation details:

  - Each kind of thing gets its own namespace/sublevel in the DB.
  - Each sprig gets stored under sprig|sprig-id, but also under tags, e.g. tags|tagName|sprig-id. (TODO)
  - Putting together trees is not the responsibility of the store. Clients can walk the dictionary of sprigs either all at once to build a tree in advance or lazily.

REST API
--------

All of the Store API methods are available via http. I should explain this better later, but basically, request is expected to be a POST with a [shunt](https://github.com/jimkang/shunt)-style array of operations as the body. e.g. Here is the body of a request that saves three sprigs, then retrieves a tree:

    [
      [
        {
          id: 'save_3_1',
          op: 'saveSprig',
          params: fixtures.sprigs.get('tree').tree_sprig_1
        },
        {
          id: 'save_3_3',
          op: 'saveSprig',
          params: fixtures.sprigs.get('tree').tree_sprig_3
        },
        {
          id: 'save_3_4',
          op: 'saveSprig',
          params: fixtures.sprigs.get('tree').tree_sprig_4
        },
        {
          id: 'get_tree_3',
          op: 'getTreeKit',
          params: 'tree_sprig_1'
        }
      ]

Store data schema
-----------------

Sharing a tree vs. sharing a body:
  - You share a tree in order to move entire hierarchies.
  - You share a body in order to share content without having it to bring its hierarchy with it.
  - There is no concept of a "document" like there was in the previous version of the API.

Sprig:

  - Has an id.
  - Has a urlName (Maybe later).
  - Has a title.
  - Has tags.
  - Has a body id.
  - Has child ids.

Body:

  - Has an id.
  - Has a fragment (probably html or text).

Tag:

  - Is a string.

Tests
-----

Run with:

    make test
    make test-integration

License
-------

MIT.
