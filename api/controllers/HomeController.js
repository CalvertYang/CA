/**
 * HomeController
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

var jade = require('jade');
var fs = require('fs');

module.exports = {
  leading: function (req, res, next) {
    res.view();
  },

  index: function (req, res, next) {
    res.view();
  },

  // 條款
  term: function (req, res, next) {
    res.view();
  },

  // 填寫訂單資料
  register: function (req, res, next) {
    if (req.method != 'POST') {
      return res.view({ id: req.param('id') });
    } else {
      return res.view({ id: req.param('id') });
    }
  },

  // 修改訂單資料
  editOrder: function (req, res, next) {
    res.view();
  },

  // 填寫信用卡資訊
  payment: function (req, res, next) {
    res.view();
  },

  // 訂單資料
  query: function (req, res, next) {
    res.view();
  },

  generateForm: function (req, res, next) {
    Event.findOne(req.param('id'), function(err, event) {
      // If there's an error
      if (err) {
        console.log(err);
        req.session.flash = {
          err: err
        }
      }

      fs.readFile('views/partials/registerForm.jade', 'utf8', function (err, data) {
        // If there's an error
        if (err) {
          console.log(err);
          throw err;
        }

        var fn = jade.compile(data);
        var html = fn({ count: req.param('count'), registrationData: event.registrationData });
        return res.send(html);
      });
    });
  },
  


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to HomeController)
   */
  _config: {}

  
};
