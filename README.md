# connect-leveldb

This module provides a session store for connect which uses leveldb.

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
var RedisStore = require('connect-leveldb')(express)
```

# Licence

Copyright (c) 2013 Mark Wolfe
Licensed under the MIT license.