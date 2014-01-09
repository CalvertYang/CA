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
      }

      // Change datetime format
      events.forEach(function (event) {
        event.startOn = moment(event.startOn).format('YYYY/MM/DD HH:mm');
        event.endOn = moment(event.endOn).format('YYYY/MM/DD HH:mm');
        event.registrationStartOn = moment(event.registrationStartOn).format('YYYY/MM/DD HH:mm');
        event.registrationEndOn = moment(event.registrationEndOn).format('YYYY/MM/DD HH:mm');
      });

      return res.view({ events: events, keyword: keyword });
    });
  },

  create: function (req, res, next) {
    if (req.method != 'POST') {
      return res.view();
    } else {
      var eventObj = {};
      eventObj.title = req.param('title');
      eventObj.startOn = new Date(req.param('startOn'));
      eventObj.endOn = new Date(req.param('endOn'));
      eventObj.registrationStartOn = new Date(req.param('registrationStartOn'));
      eventObj.registrationEndOn = new Date(req.param('registrationEndOn'));
      eventObj.sponsor = req.param('sponsor');
      eventObj.contact = req.param('contact');
      eventObj.contactPhone = req.param('contactPhone');
      eventObj.contactEmail = req.param('contactEmail');
      eventObj.quantity = req.param('quantity');

      // Create registrationDataObj
      var registrationDatas = sails.util._.flatten(req.param('registrationData'));
      var registrationDataTypes = sails.util._.flatten(req.param('registrationDataType'));
      eventObj.registrationData = [];

      var selectCount = 0;
      for(var idx in registrationDatas) {
        var registrationDataItem = {};
        registrationDataItem.name = registrationDatas[idx];
        registrationDataItem.type = registrationDataTypes[idx];

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
      }

      // Change datetime format
      event.startOn = moment(event.startOn).format('YYYY/MM/DD HH:mm');
      event.endOn = moment(event.endOn).format('YYYY/MM/DD HH:mm');
      event.registrationStartOn = moment(event.registrationStartOn).format('YYYY/MM/DD HH:mm');
      event.registrationEndOn = moment(event.registrationEndOn).format('YYYY/MM/DD HH:mm');

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
        }

        // Change datetime format
        event.startOn = moment(event.startOn).format('YYYY/MM/DD HH:mm');
        event.endOn = moment(event.endOn).format('YYYY/MM/DD HH:mm');
        event.registrationStartOn = moment(event.registrationStartOn).format('YYYY/MM/DD HH:mm');
        event.registrationEndOn = moment(event.registrationEndOn).format('YYYY/MM/DD HH:mm');

        return res.view({ event: event });
      });
    } else {
      var eventObj = {};
      eventObj.title = req.param('title');
      eventObj.startOn = new Date(req.param('startOn'));
      eventObj.endOn = new Date(req.param('endOn'));
      eventObj.registrationStartOn = new Date(req.param('registrationStartOn'));
      eventObj.registrationEndOn = new Date(req.param('registrationEndOn'));
      eventObj.sponsor = req.param('sponsor');
      eventObj.contact = req.param('contact');
      eventObj.contactPhone = req.param('contactPhone');
      eventObj.contactEmail = req.param('contactEmail');
      eventObj.quantity = req.param('quantity');

      // Create registrationDataObj
      var registrationDatas = sails.util._.flatten(req.param('registrationData'));
      var registrationDataTypes = sails.util._.flatten(req.param('registrationDataType'));
      eventObj.registrationData = [];

      var selectCount = 0;
      for(var idx in registrationDatas) {
        var registrationDataItem = {};
        registrationDataItem.name = registrationDatas[idx];
        registrationDataItem.type = registrationDataTypes[idx];

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
        }

        return res.redirect('/event/index');
      });
    }
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to EventController)
   */
  _config: {}

  
};
