sprigot
==================

A tree-based document presenter.

Installation
------------

1. Clone this repo.
2.

    npm install

3. Run a web server.

    python -m SimpleHTTPServer

4. Open a browser to http://localhost:8000

**Building the client for production**

1. In a directory at the same level as this repo, clone [sprigotclient](https://github.com/jimkang/sprigotclient).

2.

    cd client
    ./build.sh sprigotclient

3. cd over to sprigotclient, review changes, commit, test, and push.


Data Schema
-----------


Sharing a tree vs. sharing a body:
  - You share a tree in order to move entire hierarchies.
  - You share a body in order to share content without having it to bring its hierarchy with it.
  - So what is a document? Contains authors and other data that isn't used yet.
    - If we drop it, then a node can just be a document. sprigot.com/#/root-node/node

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

**Store API**

  - getSprig/saveSprig
  - getBody/saveBody
  - getSprigsByTag - Later
  - getSprigsUnderRoot
  - getBodies
  - getTreeKit (getSprigsUnderRoot and getBodies of those sprigs)

  Implementation details:

  - Each kind of thing gets its own namespace/sublevel in the DB.
  - Each node gets stored under nodes|node-id, but also under tags, e.g. tags|tagName|node-id.

  - Putting together trees is not the responsibility of the store.


Tests
-----

Run with:

    make test

License
-------

MIT.
