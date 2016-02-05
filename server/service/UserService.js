'use strict';

var monk = require('monk');

module.exports = class UserService {
  constructor() {
    this.db = monk(process.env.MONGO_URL);
  }

  getByUserId(id) {
    return new Promise((resolve, reject) => {
      var coll = this.db.get('users');

      coll.findOne({ user_id: id }, function(e, doc) {
        if (e) {
          reject(e);
        }

        resolve(doc);
      });

    });
  }

  upsert(user) {
    return new Promise((resolve, reject) => {
      if (!('user_id' in user))
        reject(new Error('no user id'));

      var coll = this.db.get('users');

      coll.findAndModify({user_id: user.user_id }, user, { upsert: true, new: true }, function(e, doc) {
        if (e) {
          reject(e);
        }

        resolve(true);
      });
    });
  }
}
