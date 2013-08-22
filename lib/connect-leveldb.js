"use strict";
/*
 * connect-leveldb
 * https://github.com/wolfeidau/connect-leveldb
 *
 * Copyright (c) 2013 Mark Wolfe
 * Licensed under the MIT license.
 */

var debug = require('debug')('connect:leveldb')
var level = require('level')
var util = require("util")

var oneDay = 86400

module.exports = function (connect) {

  var Store = connect.session.Store

  function LeveldbStore(options) {
    var self = this

    options = options || {}

    Store.call(this, options)

    this.prefix = !options.prefix ? 'session:' : options.prefix

    this.db = options.db || level(options.dbLocation, {valueEncoding: 'json'})

    this.db.on('closed', function () {
      self.emit('closed')
    })
    this.db.on('ready', function () {
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
      if (err) {
        debug('err', err.name)
        return cb("NotFoundError" === err.name ? null : err);
      }
      if (!value) return cb()
      var currentTime = new Date().getTime()
      // if the expiry has past destroy the session
      if(value.expires < currentTime){
        self.destroy(sid, function(err){
          cb(err)
        })
      } else {
        delete value.expires;
        debug('get','value', value)
        cb(null, value)
      }
    })
  }

  LeveldbStore.prototype.set = function(sid, session, cb){
    sid = this.prefix + sid
    var maxAge = session.cookie.maxAge
    // ttl in seconds
    var ttl = this.ttl || ('number' == typeof maxAge ? maxAge / 1000| 0 : oneDay)
    if(session.expires) return cb(new Error('expires is a reserved attribute'))
    var currentTime = new Date().getTime()
    // seed the expiry date
    session.expires = currentTime + ttl*1000
    debug('put', sid, 'expires in', session.expires -  currentTime, 'ms')
    this.db.put(sid, session, function(err){
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
