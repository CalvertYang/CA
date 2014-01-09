/**
 * MemberController
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

var moment = require('moment');

module.exports = {
    
  index: function (req, res, next) {
    var keyword = req.param('search') ? req.param('search') : '';
    var condition = {};

    condition.email = new RegExp(keyword);

    Member.find(condition).done(function (err, members) {
      // If there's an error
      if (err) {
        console.log(err);
        req.session.flash = {
          err: err
        }
      }

      // Change datetime format
      members.forEach(function (member) {
        member.birthday = moment(member.birthday).format('YYYY/MM/DD');
      });

      return res.view({ members: members, keyword: keyword });
    })
  },

  create: function (req, res, next) {

  },

  detail: function (req, res, next) {

  },

  update: function (req, res, next) {

  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to MemberController)
   */
  _config: {}

  
};
