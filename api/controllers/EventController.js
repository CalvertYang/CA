/**
 * EventController
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
var nodeExcel = require('excel-export');

module.exports = {
    
  index: function (req, res, next) {
    var keyword = req.param('search') ? req.param('search') : '';
    var condition = {};

    condition.title = new RegExp(keyword);

    Event.find(condition).done(function (err, events) {
      // If there's an error
      if (err) {
        console.log(err);
        req.session.flash = {
          err: err
        }
        return next(err);
      }

      if (events) {
        // Change datetime format
        events.forEach(function (event) {
          event.startOn = moment(event.startOn).zone(-8).format('YYYY/MM/DD HH:mm');
          event.endOn = moment(event.endOn).zone(-8).format('YYYY/MM/DD HH:mm');
          event.registrationStartOn = moment(event.registrationStartOn).zone(-8).format('YYYY/MM/DD HH:mm');
          event.registrationEndOn = moment(event.registrationEndOn).zone(-8).format('YYYY/MM/DD HH:mm');
        });
      }

      return res.view({ events: events, keyword: keyword });
    });
  },

  create: function (req, res, next) {
    if (req.method != 'POST') {
      return res.view();
    } else {
      var eventObj = {};
      eventObj.title = req.param('title');
      eventObj.startOn = moment(req.param('startOn')).zone(+8)._d;
      eventObj.endOn = moment(req.param('endOn')).zone(+8)._d;
      eventObj.registrationStartOn = moment(req.param('registrationStartOn')).zone(+8)._d;
      eventObj.registrationEndOn = moment(req.param('registrationEndOn')).zone(+8)._d;
      eventObj.sponsor = req.param('sponsor');
      eventObj.contact = req.param('contact');
      eventObj.contactPhone = req.param('contactPhone');
      eventObj.contactEmail = req.param('contactEmail');
      eventObj.quota = req.param('quota');

      // Create ticketTypeObject
      var ticketNames = sails.util._.flatten(req.param('ticketName'));
      var ticketPrices = sails.util._.flatten(req.param('ticketPrice'));
      eventObj.ticketType = [];

      for(var i = 0, len = ticketNames.length; i < len; i++) {
        var ticketTypeItem = {};
        ticketTypeItem.name = ticketNames[i];
        ticketTypeItem.price = ticketPrices[i];

        eventObj.ticketType.push(ticketTypeItem);
      }

      // Create registrationDataObj
      var registrationDatas = sails.util._.flatten(req.param('registrationData'));
      var registrationDataTypes = sails.util._.flatten(req.param('registrationDataType'));
      eventObj.registrationData = [];

      for(var i = 0, selectCount = 0, len = registrationDatas.length; i < len; i++) {
        var registrationDataItem = {};
        registrationDataItem.name = registrationDatas[i];
        registrationDataItem.type = registrationDataTypes[i];

        if (registrationDataItem.type == 'select') {
          registrationDataItem.value = req.param('selectItem')[selectCount];
          selectCount++;
        }

        eventObj.registrationData.push(registrationDataItem);
      }

      // Add record
      Event.create(eventObj, function eventCreated (err, event) {
        // If there's an error
        if (err) {
          console.log(err);
          req.session.flash = {
            err: err
          }
        }

        return res.redirect('/event/index');
      });
    }
  },

  detail: function (req, res, next) {
    Event.findOne(req.param('id')).done(function (err, event) {
      // If there's an error
      if (err) {
        console.log(err);
        req.session.flash = {
          err: err
        }
        return next(err);
      }

      // Change datetime format
      event.startOn = moment(event.startOn).zone(-8).format('YYYY/MM/DD HH:mm');
      event.endOn = moment(event.endOn).zone(-8).format('YYYY/MM/DD HH:mm');
      event.registrationStartOn = moment(event.registrationStartOn).zone(-8).format('YYYY/MM/DD HH:mm');
      event.registrationEndOn = moment(event.registrationEndOn).zone(-8).format('YYYY/MM/DD HH:mm');

      return res.view({ event: event });
    });
  },

  update: function (req, res, next) {
    if (req.method != 'POST') {
      Event.findOne(req.param('id')).done(function (err, event) {
        // If there's an error
        if (err) {
          console.log(err);
          req.session.flash = {
            err: err
          }
          return next(err);
        }

        // Change datetime format
        event.startOn = moment(event.startOn).zone(-8).format('YYYY/MM/DD HH:mm');
        event.endOn = moment(event.endOn).zone(-8).format('YYYY/MM/DD HH:mm');
        event.registrationStartOn = moment(event.registrationStartOn).zone(-8).format('YYYY/MM/DD HH:mm');
        event.registrationEndOn = moment(event.registrationEndOn).zone(-8).format('YYYY/MM/DD HH:mm');

        return res.view({ event: event });
      });
    } else {
      var eventObj = {};
      eventObj.title = req.param('title');
      eventObj.startOn = moment(req.param('startOn')).zone(+8)._d;
      eventObj.endOn = moment(req.param('endOn')).zone(+8)._d;
      eventObj.registrationStartOn = moment(req.param('registrationStartOn')).zone(+8)._d;
      eventObj.registrationEndOn = moment(req.param('registrationEndOn')).zone(+8)._d;
      eventObj.sponsor = req.param('sponsor');
      eventObj.contact = req.param('contact');
      eventObj.contactPhone = req.param('contactPhone');
      eventObj.contactEmail = req.param('contactEmail');
      eventObj.quota = req.param('quota');

      // Create ticketTypeObject
      var ticketNames = sails.util._.flatten(req.param('ticketName'));
      var ticketPrices = sails.util._.flatten(req.param('ticketPrice'));
      eventObj.ticketType = [];

      for(var i = 0, len = ticketNames.length; i < len; i++) {
        var ticketTypeItem = {};
        ticketTypeItem.name = ticketNames[i];
        ticketTypeItem.price = ticketPrices[i];

        eventObj.ticketType.push(ticketTypeItem);
      }

      // Create registrationDataObj
      var registrationDatas = sails.util._.flatten(req.param('registrationData'));
      var registrationDataTypes = sails.util._.flatten(req.param('registrationDataType'));
      eventObj.registrationData = [];

      for(var i = 0, selectCount = 0, len = registrationDatas.length; i < len; i++) {
        var registrationDataItem = {};
        registrationDataItem.name = registrationDatas[i];
        registrationDataItem.type = registrationDataTypes[i];

        if (registrationDataItem.type == 'select') {
          registrationDataItem.value = req.param('selectItem')[selectCount];
          selectCount++;
        }

        eventObj.registrationData.push(registrationDataItem);
      }

      Event.update(req.param('id'), eventObj, function (err, events) {
        // If there's an error
        if (err) {
          console.log(err);
          req.session.flash = {
            err: err
          }
          return next(err);
        }

        return res.redirect('/event/index');
      });
    }
  },

  orderlist: function(req, res, next) {
    var keyword = req.param('search') ? req.param('search') : '';
    // var condition = {};

    // condition.orderNo = new RegExp(keyword);

    Order.find({ eventId: req.param('id'), orderNo: new RegExp(keyword) }, function(err, orders) {
      // If there's an error
      if (err) {
        console.log(err);
        req.session.flash = {
          err: err
        }
        return next(err);
      }

      if (orders) {
        var paidAmount = 0;
        var unPaidAmount = 0;

        for(var i = 0, len = orders.length; i < len; i++) {
          if (orders[i].paymentStatus === 1) {
            unPaidAmount += orders[i].grandTotal;
          } else if (orders[i].paymentStatus === 2) {
            paidAmount += orders[i].grandTotal;
          }
          orders[i].createdAt = moment(orders[i].createdAt).zone(-8).format('YYYY/MM/DD HH:mm');
        }
      }

      res.view({ eventId: req.param('id'), orders: orders, paidAmount: paidAmount, unPaidAmount: unPaidAmount, keyword: keyword });
    });
  },

  generateReport: function(req, res, next) {
    Event.findOne(req.param('id')).done(function (err, event) {
      if (err) console.log(err);

      if (event) {
        Order.find({ where: { eventId: event.id, paymentStatus: 2 }, sort: 'orderNo ASC' }).done(function (err, orders) {
          // create Json data
          // orderNo, receiver, type, address, mobile
          var conf = {};
          conf.cols = [];
          conf.rows = [];
          conf.cols.push({ caption: 'ID', type: 'string' });
          conf.cols.push({ caption: '訂單編號', type: 'string' });
          conf.cols.push({ caption: '報名日期', type: 'string' });
          conf.cols.push({ caption: '訂單明細', type: 'string' });
          conf.cols.push({ caption: '收件人姓名', type: 'string' });
          conf.cols.push({ caption: '收件人電話', type: 'string' });
          conf.cols.push({ caption: '收件人生日', type: 'string' });
          conf.cols.push({ caption: '郵遞區號', type: 'string' });
          conf.cols.push({ caption: '寄送地址', type: 'string' });
          conf.cols.push({ caption: 'Email', type: 'string' });
          conf.cols.push({ caption: '配送方式', type: 'string' });

          for (var i = 0, m = orders.length; i < m; i++) {
            var data = [];
            data.push(i + 1);
            data.push(orders[i].orderNo);
            data.push(moment(orders[i].createdAt).zone(-8).format('YYYY/MM/DD HH:mm'));
            data.push(orders[i].commodity.name + ' x ' + orders[i].commodity.quantity);
            data.push(orders[i].contactName);
            data.push(orders[i].contactPhone);
            data.push(moment(orders[i].contactBirthday).format('YYYY/MM/DD'));
            if (orders[i].delivery === 1) {
              data.push('');
              data.push('');
            } else {
              data.push(orders[i].contactAddress.zipCode);
              data.push(orders[i].contactAddress.address);
            }
            data.push(orders[i].contactEmail);
            if (orders[i].delivery === 1) {
              data.push('現場領取');
            } else {
              data.push('宅配');
            }

            if (orders[i].registrationData.length > 0) {
              for (var j = 0, n = orders[i].registrationData.length; j < n; j++) {
                if (j > 0) {
                  var data = [];
                  data.push('');
                  data.push('');
                  data.push('');
                  data.push('');
                  data.push('');
                  data.push('');
                  data.push('');
                  data.push('');
                  data.push('');
                  data.push('');
                  data.push('');
                }

                for (var k = 0, o = event.registrationData.length; k < o; k++) {
                  if (i == 0) {
                    conf.cols.push({ caption: event.registrationData[k].name, type: 'string' });
                  }
                  data.push(orders[i].registrationData[j]['field-' + k]);
                }
                conf.rows.push(data);
              }
            } else {
              for (var j = 0, n = event.registrationData.length; j < n; j++) {
                data.push('');
              }
              conf.rows.push(data);
            }
          }

          var result = nodeExcel.execute(conf);
          res.setHeader('Content-Type', 'application/vnd.openxmlformats');
          res.setHeader('Content-Disposition', 'attachment; filename=' + req.param('id') + '-Report.xlsx');
          res.end(result, 'binary');
        });
      } else {
        res.view('404');
        return;
      }
    });
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to EventController)
   */
  _config: {}

  
};
