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
      eventObj.startOn = new Date(moment(req.param('startOn')).zone(-8).format());
      eventObj.endOn = new Date(moment(req.param('endOn')).zone(-8).format());
      eventObj.registrationStartOn = new Date(moment(req.param('registrationStartOn')).zone(-8).format());
      eventObj.registrationEndOn = new Date(moment(req.param('registrationEndOn')).zone(-8).format());
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
      eventObj.startOn = new Date(moment(req.param('startOn')).zone(-8).format());
      eventObj.endOn = new Date(moment(req.param('endOn')).zone(-8).format());
      eventObj.registrationStartOn = new Date(moment(req.param('registrationStartOn')).zone(-8).format());
      eventObj.registrationEndOn = new Date(moment(req.param('registrationEndOn')).zone(-8).format());
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


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to EventController)
   */
  _config: {}

  
};
