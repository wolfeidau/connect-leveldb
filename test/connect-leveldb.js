"use strict";

var connect = require('connect')
var sinon = require('sinon')
var LeveldbStore = require('../index.js')(connect)

var expect = require('chai').expect

var store;

describe('Connect Leveldb', function () {

  var clock;

  before(function (done) {
    var currentTime = new Date().getTime()
    clock = sinon.useFakeTimers(currentTime)
    store = new LeveldbStore({dbLocation: './myDb'})
      .on('connect', function () {
        done()
      })
  })

  after(function () {
    clock.restore()
  })


  it('should be open', function () {
    expect(store.db.isOpen()).to.be.true
  })

  it('should have default prefix set', function(){
    expect(store.prefix).to.equal('session:')
  })

  it('should persist a session successfully', function (done) {
    store.set('123', { cookie: { maxAge: 1000 }, name: 'wolfeidau' }, function (err, ok) {
      expect(err).to.not.exist
      expect(ok).to.be.true
      done()
    })
  })

  it('should retrieve a session successfully', function (done) {

    store.get('123', function (err, value) {
      expect(err).to.not.exist
      expect(value.cookie.maxAge).to.equal(1000)
      expect(value.name).to.equal('wolfeidau')
      done()
    })

  })

  it('should return null on missing session', function (done) {

    store.get('1234', function (err, value) {
      expect(err).to.not.exist
      expect(value).to.not.exist
      done()
    })

  })

  it('should destroy a session successfully', function (done) {
    store.destroy(123, function (err) {
      expect(err).to.not.exist
      done()
    })
  })


  describe('Session Expiry', function () {

    it('should expire persisted sessions', function (done) {

      function doGet(){
        clock.tick(2001)
        store.get('456', function (err, value) {
          expect(err).to.not.exist
          expect(value).to.not.exist
          done()
        })
      }

      store.set('456', { cookie: { maxAge: 1000 }, name: 'wolfeidau' }, function (err, ok) {
        expect(err).to.not.exist
        expect(ok).to.be.true
        doGet()
      })

    })
  })

})