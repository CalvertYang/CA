var moment = require('moment');

// Pad a number with leading zeros
function padNumber(number, pad) {
  var N = Math.pow(10, pad);
  return number < N ? ('' + (N + number)).slice(1) : '' + number;
}

module.exports = {
  generateOrderNumber: function generateOrderNumber (callback) {
    System.find().done(function (err, systems) {
      if (err) {
        return callback({status: 'error', message: err});
      }

      if (systems) {
        var isNeedReset = moment(systems[0].orderDate).format('YYYY-MM-DD') != moment().format('YYYY-MM-DD');

        var systemObj;
        if (isNeedReset) {
          systemObj = {
            orderDate: new Date(moment().format('YYYY-MM-DD')),
            orderSerial: 1
          };
        } else {
          // Check orderSerial quota
          if (systems[0].orderSerial >= 999999) {
            return callback({ err: 'Oops, order serial is reached limit quota', serial: null });
          }

          systemObj = {
            orderSerial: systems[0].orderSerial + 1
          };
        }

        // Update system config
        System.update({ id: systems[0].id }, systemObj, function (err, system) {
          if (err) {
           return callback({ err: err, serial: null });
          }

          var orderNumber = moment(system[0].orderDate).format('YYYYMMDD') + padNumber(system[0].orderSerial, 6);
          return callback({ err: null, serial: orderNumber });
        });
      } else {
        return callback({ err: 'System config not found', serial: null });
      }
    });
  }
};