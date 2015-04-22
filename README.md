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

Document:

  - Has an id.
  - Has a title.
  - Has root ids.
  - Has a default root id.
  - Has a pool of head references.
    - This is important for providing non-tree views of the document.
    - Could be retrieved by searching references for document tag.

Head:

  - Has an id.
  - Has a urlName.
  - Has a title.
  - Has tags.
  - Has a body id.

Body:

  - Has an id.
  - Has a fragment (probably html or text).
  - Has child head ids.

Tag:

  - Can correspond to a document. ('_d_documentname')
    - Multiple tags on one head can reference several documents.
  - Can be anything else.

**Store**

  - getDocument/setDocument
  - getHead/setHead
  - getBody/setBody

  Implementation details:

  - Each kind of thing gets its own namespace/sublevel in the DB.
  - Each head gets stored under heads|head-id, but under every other property it has except body id, e.g. urlNames|urlName, titles|title.

  - Putting together trees is not the responsibility of the store.

Tests
-----

There are none. Dant dant dah!

License
-------

MIT.
