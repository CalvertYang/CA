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
var clt = require('clt-api');
var moment = require('moment');

module.exports = {
  leading: function (req, res, next) {
    res.view();
  },

  notsupport: function (req, res, next) {
    res.view();
  },

  index: function (req, res, next) {
    res.view();
  },

  // 條款
  term: function (req, res, next) {
    Event.findOne(req.param('id'), function (err, event) {
      // If there's an error
      if (err) {
        console.log(err);
        req.session.flash = {
          err: err
        }
      }

      if (moment().zone(-8).isAfter(moment(event.registrationStartOn).zone(-8)) && moment().zone(-8).isBefore(moment(event.registrationEndOn).zone(-8))) {
        return res.view();
      } else {
        return res.redirect('/home/finish?message=報名尚未開始或已截止報名');
      }
    });
  },

  // 填寫訂單資料
  register: function (req, res, next) {
    if (req.method != 'POST') {
      Event.findOne(req.param('id'), function (err, event) {
        if (moment().zone(-8).isAfter(moment(event.registrationStartOn).zone(-8)) && moment().zone(-8).isBefore(moment(event.registrationEndOn).zone(-8))) {
          return res.view({ event: event });
        } else {
          return res.redirect('/home/finish?message=報名尚未開始或已截止報名');
        }
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
            } else {
              orderObj.contactAddress = {};
            }
            orderObj.contactBirthday = new Date(moment(req.param('buyerBirthday')).zone(-8).format());
            orderObj.delivery = req.param('way') === 'express' ? 2 : 1; // 1-現場領取 / 2-宅配
            for (var i = 0, len = event.ticketType.length; i < len; i++) {
              if (event.ticketType[i].name === req.param('ticket')) {
                orderObj.commodity = {
                  name: event.ticketType[i].name,
                  quantity: ticketQuantity
                };
                orderObj.grandTotal = event.ticketType[i].price * ticketQuantity;
                event.registedQuantity += ticketQuantity;
              }
            }
            // Add express charge
            if (req.param('way') === 'express') {
              orderObj.grandTotal = parseInt(orderObj.grandTotal) + 150;
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
            orderObj.expressStauts = 1;
            orderObj.trackingNumber = '';
            orderObj.raceFinished = false;

            // Write order to database
            Order.create(orderObj, function (err, order) {
              // If there's an error
              if (err) {
                return callback(err, null);
              }

              return callback(null, event, order);
            });
          },
          // Call clt-api
          function(event, orderData, callback) {
            // Call CLT API
            clt.config.update(sails.config.myConf.CLT_CONFIG);

            if (orderData.paymentType === 1) {
              // ibon
              var cvs = clt.CVS;

              cvs.orderRegister({
                OrderNumber: orderData.orderNo,
                Amount: orderData.grandTotal.toString(),
                Name: orderData.contactName,
                zipCode: orderData.contactAddress.zipCode,
                Address: orderData.contactAddress.address,
                CellPhone: orderData.contactPhone,
                Email: orderData.contactEmail
              }, function (err, result) {
                orderData.paymentDetail = {
                  orderAmount: result.response.order.order_amount,
                  billAmount: result.response.order.bill_amount,
                  ibonShopId: result.response.order.ibon_shopid,
                  ibonCode: result.response.order.ibon_code,
                  expireDate: new Date(moment(result.response.order.expire_date).zone(-8).format())
                }

                // Update order information
                Order.update(orderData.id, orderData, function (err, orders) {
                  // If there's an error
                  if (err) {
                    return callback(err, null);
                  }

                  return callback(null, event, 'done');
                });
              });
            } else {
              // credit card
              var cocs = clt.COCS;

              cocs.orderAppend({
                OrderNumber: orderData.orderNo,
                OrderAmount: orderData.grandTotal.toString(),
                OrderDetail: event.title + ' - ' + orderData.commodity.name + ' x ' + orderData.commodity.quantity
              }, function (err, result) {
                orderData.paymentDetail = {
                  url: result.url
                }

                // Update order information
                Order.update(orderData.id, orderData, function (err, orders) {
                  // If there's an error
                  if (err) {
                    return callback(err, null);
                  }

                  return callback(null, event, result.url);
                });
              });
            }
          },
          function(event, finishArg, callback) {
            // Update event registedQuantity
            Event.update(event.id, event, function (err, events) {
              // If there's an error
              if (err) {
                return callback(err, null);
              }

              return callback(null, finishArg);
            });
          }
        ], function (err, result) {
          // If there's an error
          if (err) {
            console.log(err);
            req.session.flash = {
              err: err
            }
          } else {
            if (req.param('paymentType') === 'ibon') {
              // Redirect to finish page after payment by ibon
              return res.redirect('/home/finish?message=完成交易，請收取簡訊及電子郵件並於期限內繳款完畢，謝謝');
            } else {
              // Redirect to api callback url
              return res.redirect(result);
            }
          }
        });
      }
    }
  },

  // 修改訂單資料
  editOrder: function (req, res, next) {
    if (req.method != 'POST') {
      Order.findOne(req.param('id'), function(err, order) {
        return res.view({ order: order });
      });
    } else {
      Order.findOne(req.param('id'), function(err, order) {
        // If there's an error
        if (err) {
          console.log(err);
          req.session.flash = {
            err: err
          }
        }

        Event.findOne(order.eventId, function(err, event) {
          // If there's an error
          if (err) {
            console.log(err);
            req.session.flash = {
              err: err
            }
          }

          order.registrationData = [];
          for(var i = 0, len = order.commodity.quantity; i < len; i++) {
            order.registrationData[i] = {};
            for(var j = 0, regDataLen = event.registrationData.length; j < regDataLen; j++) {
              order.registrationData[i]['field-' + j] = req.param('attenderField-' + i)[j];
            }
          }

          Order.update(order.id, order, function (err, orders) {
            // If there's an error
            if (err) {
              console.log(err);
              req.session.flash = {
                err: err
              }
            }

            return res.redirect('/finish?message=資料修改成功');
          });
        });
      });
    }
  },

  // 完成頁面
  finish: function (req, res, next) {
    res.view({ message: req.param('message') });
  },

  // 訂單資料
  query: function (req, res, next) {
    Order.find({ fbid: req.param('id') }, function(err, orders) {
      res.view({ orders: orders });
    });
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

          if (req.param('orderId')) {
            Order.findOne(req.param('orderId'), function(err, order) {
              var fn = jade.compile(data);
              var html = fn({ count: order.commodity.quantity, registrationData: event.registrationData, order: order });
              return res.send(html);
            });
          } else {
            var fn = jade.compile(data);
            var html = fn({ count: req.param('count'), registrationData: event.registrationData, order: null });
            return res.send(html);
          }
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
