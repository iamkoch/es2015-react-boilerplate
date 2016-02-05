var UserService = require('../server/service/UserService'),
    monk = require('monk'),
    chai = require('chai'),
    chaiAsPromised = require("chai-as-promised");
    chai.should();

chai.use(chaiAsPromised);
UserService.prototype.close = function() { this.db.close(); };
var sut = new UserService();
var db = monk(process.env.MONGO_URL);

describe('UserService', function() {

  describe('#upsert', function() {
    it('should upsert a user', function(done) {
      sut.upsert({ user_id: 123456, name: 'geoff' }).should.eventually.equal(true).notify(done);
    });

    it('should fail if user_id not present', function(done) {
      sut.upsert({}).should.eventually.be.rejectedWith(Error).notify(done);
    });

    it('should overwrite the same user by user_id', function(done) {
      sut.upsert({ user_id: 123456, name: 'geoff' }).should.eventually.equal(true);
      sut.upsert({ user_id: 123456, name: 'geoff' }).should.eventually.equal(true);
      sut.upsert({ user_id: 123456, name: 'geoff' }).should.eventually.equal(true);
      sut.upsert({ user_id: 123456, name: 'geoff' }).should.eventually.equal(true);
      sut.upsert({ user_id: 123456, name: 'geoff' }).should.eventually.equal(true);

      var coll = db.get('users');

      coll.find({ user_id: 123456 }, function(e, docs) {
        docs.length.should.equal(1);
        done();
      });
    });
  });

  describe('#getByUserId', function() {

    describe('when a user doesnt exist in the system', function() {
      it('should return null', function(done) {

        sut.getByUserId('sldkfj').should.eventually.equal(null).notify(done);

      });
    });

    describe('when a user does exist', function() {
      beforeEach(function(done) {
        var coll = db.get('users');

        coll.findAndModify(
            { user_id: 'abcd1234' },
            { user_id: 'abcd1234', name: 'dave' },
            { upsert: true, new: true },
            function(e, d) {
              done();
            });

      });

      it('should return them', function(done) {

        var result = sut.getByUserId('abcd1234');

        result.should.eventually.have.property('user_id').and.equal('abcd1234');
        result.should.eventually.have.property('name').and.equal('dave').notify(done);

      });
    });
  });

  after(function() {
    db.close();
    sut.close();
  });
});
