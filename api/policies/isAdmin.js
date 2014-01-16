/**
 * Allow any authenticated user.
 */
/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated admin
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function (req, res, next) {
  // User is allowed, proceed to controller
  if (req.session.authenticated && req.session.Admin) {
    return next();
  }

  // User is not allowed
  else {
    var requireAdminError = [{name: 'requireAdminError', message: '權限不足'}]
    req.session.flash = {
      err: requireAdminError
    }
    return res.redirect('/root/login');
  }
};