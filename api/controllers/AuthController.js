/**
 * AuthController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var bcrypt = require('bcrypt');
var passport = require('passport');

module.exports = {

  facebook: function (req, res, next) {
    passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login', scope: ['email', 'user_birthday'] },
      function (err, user) {
        req.logIn(user, function (err) {
          if (err) {
            console.log(err);
            return res.serverError(err);
          }

          var hour = 3600000;
          req.session.cookie.expires = new Date(Date.now() + hour);
          if (req.header('Referer')) {
            return res.redirect(req.header('Referer'));
          } else {
            return res.redirect('/');
          }
        });
      }
    )(req, res, next);
  },

  admin: function (req, res, next) {
    if (req.method != 'POST') {
      return res.redirect('/root/login');
    }

    if (req.session.authenticated) {
      return res.redirect('/root/index');
    } else {
      Admin.findOneByAccount(req.param('account'), function (err, admin) {
        if (err) return next(err);

        // If no admin is found...
        if (!admin) {
          var noAccountError = [{ name: 'noAccount', message: '帳號錯誤' }];
          req.session.flash = {
            err: noAccountError
          };
          return res.redirect('/');
        }

        // Compare password from the form params to the encrypted password of the admin found.
        bcrypt.compare(req.param('password'), admin.encryptedPassword, function (err, valid) {
          if (err) return next(err);

          // If the password from the form doesn't match the password from the database...
          if (!valid) {
            var adminAccountPasswordMismatchError = [{ name: 'adminAccountPasswordMismatch', message: '錯誤的帳號密碼' }];
            req.session.flash = {
              err: adminAccountPasswordMismatchError
            };
            return res.redirect('/');
          }

          // Log user in and let session expired after an hour
          var hour = 3600000;
          req.session.cookie.expires = new Date(Date.now() + hour);
          req.session.authenticated = true;
          req.session.Admin = admin.toJSON();

          return res.redirect('/event/index');
        });
      });
    }
  },

  logout: function (req, res, next) {
    req.logout();
    req.session.destroy();
    res.redirect('/');
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AuthController)
   */
  _config: {}

  
};
