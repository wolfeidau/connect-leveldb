"use strict";
/*
 * connect-leveldb
 * https://github.com/wolfeidau/connect-leveldb
 *
 * Copyright (c) 2013 Mark Wolfe
 * Licensed under the MIT license.
 */

var debug = require('debug')('connect:leveldb')
var level  = require('level')
var ttl      = require('level-ttl')
var sublevel = require('level-sublevel')
var util = require("util")

var oneDay = 86400

module.exports = function (connect) {

  var Store = connect.session.Store

  function LeveldbStore(options) {
    var self = this

    options = options || {}

    Store.call(this, options)

    this.prefix = options.prefix || 'session:'

    var db = options.db || level(options.dbLocation, {valueEncoding: 'json'})

    // wrap the wrap with more wrap
    this.db = ttl(sublevel(db), { checkFrequency: 1000 })

    this.db.on('closed', function () {
      debug('db', 'closed')
      self.emit('closed')
    })
    this.db.on('ready', function () {
      debug('db', 'ready')
      self.emit('connect')
    })

    this.ttl = options.ttl
  }

  util.inherits(LeveldbStore, Store)

  LeveldbStore.prototype.get = function(sid, cb){
    debug('get',sid)
    var self = this
    sid = this.prefix + sid
    this.db.get(sid, function(err, value){
      if (err) return cb(err)
      debug('get','value', value)
      cb(null, value)
    })
  }

  LeveldbStore.prototype.set = function(sid, session, cb){
    sid = this.prefix + sid
    var maxAge = session.cookie.maxAge // this is seconds
    var ttl = this.ttl || ('number' == typeof maxAge ? maxAge * 1000 : oneDay)
    debug('put', sid, 'ttl', ttl)
    this.db.put(sid, session, ttl, function(err){
      cb(err, err || true)
    })
  }

  LeveldbStore.prototype.destroy = function(sid, cb){
    debug('destroy',sid)
    sid = this.prefix + sid
    this.db.del(sid, function(err, ok){
      cb(err, err || true)
    })
  }

  return LeveldbStore
}
