# connect-leveldb

[![NPM](https://nodei.co/npm/connect-leveldb.png)](https://nodei.co/npm/connect-leveldb/)
[![NPM](https://nodei.co/npm-dl/connect-leveldb.png)](https://nodei.co/npm/connect-leveldb/)

[![Build Status](https://travis-ci.org/wolfeidau/connect-leveldb.png?branch=master)](https://travis-ci.org/wolfeidau/connect-leveldb)

This module provides a session store for connect which uses leveldb and is heavily based on
the [connect-redis](https://github.com/visionmedia/connect-redis) module.

# Installation

```
npm install connect-leveldb
```

# Options

* `db` An existing db
* `dbLocation` The location of the database to open / create.
* `ttl` Session time to live (TTL) in seconds.
* `prefix` Key prefix defaults to "sess:"

# Usage

Very simple to setup.

```
var connect = require('connect')
var LeveldbStore = require('connect-leveldb')(connect)

connect()
  .use(connect.session({ store: new LeveldbStore(options), secret: 'keyboard cat' }))
```

Express users.

```
var LeveldbStore = require('connect-leveldb')(express)
```

With Sublevel you need to specify the value encoding:

```
var LevelUp = require('level');
var Sublevel = require('level-sublevel');
var LeveldbStore = require('connect-leveldb')(express);
var db = Sublevel(LevelUp(__dirname + '/db'));
var sessions = db.sublevel('sessions', { valueEncoding: 'json' });
```

# Things to Note

This module uses a lazy deletion model which means it will only clean up sessions IF a user access the
site after they expire. It is primarily designed for use on sites with users who regularly revisit the
site for updates.

# Licence

Copyright (c) 2013 Mark Wolfe
Licensed under the MIT license.
