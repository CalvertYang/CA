/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

var bcrypt = require('bcrypt');

module.exports.bootstrap = function (cb) {

  Admin.count().exec(function (err, count){
    if (count > 0) {
      return cb();
    } else {
      var adminObj = {};
      adminObj.account = 'admin';
      adminObj.encryptedPassword = bcrypt.hashSync("password", bcrypt.genSaltSync(10));
      adminObj.name = 'Admin';

      Admin.create(adminObj, function (err, event) {
        if (err) {
          console.log(err);
        }
      });
    }
  });

  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};