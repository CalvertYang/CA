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
var async = require('async');

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
      Event.findOne(req.param('id'), function (err, event) {
        return res.view({ event: event });
      });
    } else {
      // Parse attender quantity
      var ticketQuantity = parseInt(req.param('quantity'));

      // Check required parameter
      if(!req.param('buyerName') || !req.param('buyerBirthday') || !req.param('buyerPhone') || !req.param('buyerEmail') || !req.param('way') || !req.param('paymentType') || !ticketQuantity || ticketQuantity < 1 || ticketQuantity > 10) {
        console.log('Missing required parameter!!');
        return res.view({ id: req.param('id') });
      } else {
        async.waterfall([
          // Check quota
          function(callback) {
            Event.findOne(req.param('id'), function(err, event) {
              // If there's an error
              if (err) {
                return callback(err, null);
              }

              // Check quota
              if (event.quota > 0 && event.registedQuantity + ticketQuantity > event.quota) {
                return callback('Reach limit quota', null);
              }

              return callback(null, event);
            });
          },
          // Get order number
          function(event, callback) {
            GlobalUtility.generateOrderNumber(function (err, orderNo) {
              // If there's an error
              if (err) {
                return callback(err, null);
              }

              callback(null, event, orderNo);

            });
          },
          // Get contact address
          function(event, orderNo, callback) {
            if (req.param('way') === 'express') {
              var address = req.param('expressAddressCity') + req.param('expressAddressArea') + req.param('expressAddress');
              GlobalUtility.getFullZipCode(address, function (err, addrInfo) {
                if (err) {
                  return callback(err, null);
                }

                return callback(null, event, orderNo, addrInfo);
              });
            } else {
              return callback(null, event, orderNo, null);
            }
          },
          // Create order
          function(event, orderNo, addrInfo, callback) {
            var orderObj = {};
            orderObj.orderNo = orderNo;
            orderObj.eventId = req.param('id');
            orderObj.fbid = req.user.fbid;
            orderObj.contactName = req.param('buyerName');
            orderObj.contactPhone = req.param('buyerPhone');
            orderObj.contactEmail = req.param('buyerEmail');
            if (req.param('way') === 'express') {
              orderObj.contactAddress = {
                zipCode: addrInfo.zipCode,
                address: addrInfo.addrSource
              };
            }
            orderObj.contactBirthday = new Date(req.param('buyerBirthday'));
            orderObj.delivery = req.param('way') === 'express' ? 2 : 1; // 1-現場領取 / 2-宅配
            for (var i = 0, len = event.ticketType.length; i < len; i++) {
              if (event.ticketType[i].name === req.param('ticket')) {
                orderObj.commodity = {
                  name: event.ticketType[i].name,
                  quantity: ticketQuantity
                };
                orderObj.grandTotal = event.ticketType[i].price * ticketQuantity;
              }
            }
            orderObj.registrationData = [];
            for(var i = 0, len = ticketQuantity; i < len; i++) {
              orderObj.registrationData[i] = {};
              for(var j = 0, regDataLen = event.registrationData.length; j < regDataLen; j++) {
                orderObj.registrationData[i]['field-' + j] = req.param('attenderField-' + i)[j];
              }
            }
            orderObj.paymentDetail = {};
            orderObj.paymentType = req.param('paymentType') === 'ibon' ? 1 : 2; // 1-ibon / 2-線上刷卡
            orderObj.paymentStatus = 1;
            orderObj.expressStauts = '';
            orderObj.trackingNumber = '';

            // Write order to database
            Order.create(orderObj, function (err, order) {
              // If there's an error
              if (err) {
                return callback(err, null);
              }

              return callback(null, event, orderObj);
            });
          },
          // Call clt-api
          function(event, orderInfo, callback) {
            return callback(null, 'done');
          }
        ], function (err, result) {
          // If there's an error
          if (err) {
            console.log(err);
            req.session.flash = {
              err: err
            }
          } else {
            // Redirect to finish page
            return res.redirect('/home/finish');
          }
        });
      }
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

      if (event.registrationData.length > 0) {
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
      } else {
        return res.send('');
      }
    });
  },
  


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to HomeController)
   */
  _config: {}

  
};
