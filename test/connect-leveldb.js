var connect = require('connect')
var sinon = require('sinon')
var LeveldbStore = require('../index.js')(connect)

var expect = require('chai').expect

var store;

describe('Connect Leveldb', function () {

  before(function (done) {
    store = new LeveldbStore({dbLocation: './myDb'})
      .on('connect', function () {
        done()
      })
  })

  it('should be open', function () {
    expect(store.db.isOpen()).to.be.true
  })

  it('should persist a session successfully', function (done) {
    store.set('123', { cookie: { maxAge: 2000 }, name: 'wolfeidau' }, function (err, ok) {
      expect(err).to.not.exist
      expect(ok).to.be.true
      done()
    })
  })

  it('should retrieve a session successfully', function (done) {

    store.get('123', function (err, value) {
      expect(err).to.not.exist
      expect(value.cookie.maxAge).to.equal(2000)
      expect(value.name).to.equal('wolfeidau')
      done()
    })

  })

  it('should destroy a session successfully', function (done) {
    store.destroy(123, function (err) {
      expect(err).to.not.exist
      done()
//      store.db.close(done)
    })
  })


  describe('Session Expiry', function () {

    var clock;

    beforeEach(function(){
      var currentTime = new Date().getTime()
      clock = sinon.useFakeTimers(currentTime)
    })

    afterEach(function () {
      clock.restore()
    })


    it('should expire persisted sessions', function (done) {

      function doGet(){
        clock.tick(2001)
        store.get('456', function (err, value) {
          expect(err).to.not.exist
          expect(value).to.not.exist
          done()
        })
      }

      store.set('456', { cookie: { maxAge: 2000 }, name: 'wolfeidau' }, function (err, ok) {
        expect(err).to.not.exist
        expect(ok).to.be.true
        doGet()
      })

    })
  })

})