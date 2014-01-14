/**
 * OrderController
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

  },

  create: function (req, res, next) {

  },

  detail: function (req, res, next) {
    Order.findOne(req.param('id'), function(err, order) {
      // If there's an error
      if (err) {
        console.log(err);
        req.session.flash = {
          err: err
        }
        return next(err);
      }

      // Change birthday format
      order.contactBirthday = moment(order.contactBirthday).format('YYYY/MM/DD');

      Event.findOne(order.eventId, function(err, event) {
        // If there's an error
        if (err) {
          console.log(err);
          req.session.flash = {
            err: err
          }
          return next(err);
        }

        res.view({ order: order, event: event });
      });
    });
  },

  update: function (req, res, next) {

  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to OrderController)
   */
  _config: {}

  
};
