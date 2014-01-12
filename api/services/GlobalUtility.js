var moment = require('moment');
var querystring = require('querystring');
var http = require('http');

// Pad a number with leading zeros
function padNumber(number, pad) {
  var N = Math.pow(10, pad);
  return number < N ? ('' + (N + number)).slice(1) : '' + number;
}

module.exports = {
  generateOrderNumber: function generateOrderNumber (callback) {
    System.find().done(function (err, systems) {
      if (err) {
        return callback(err, null);
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
            return callback('Oops, order serial is reached limit quota', null);
          }

          systemObj = {
            orderSerial: systems[0].orderSerial + 1
          };
        }

        // Update system config
        System.update({ id: systems[0].id }, systemObj, function (err, system) {
          if (err) {
           return callback(err, null);
          }

          var orderNumber = moment(system[0].orderDate).format('YYYYMMDD') + padNumber(system[0].orderSerial, 6);
          return callback(null, orderNumber);
        });
      } else {
        return callback('System config not found', null);
      }
    });
  },

  getFullZipCode: function getFullZipCode (address, callback) {
    var postData = querystring.stringify({
      addr: address,
      token: sails.config.myConf.addressApi.token
    });

    var options = {
      hostname: sails.config.myConf.addressApi.url,
      port: 80,
      path: '/getZipCode?' + postData,
      method: 'POST'
    };

    var req = http.request(options, function(res) {
      res.setEncoding('utf8');

      var buffer = '';
      res.on('data', function (chunk) {
        buffer += chunk;
      });

      res.on('end', function() {
        return callback(null, JSON.parse(buffer));
      });
    });

    req.on('error', function(e) {
      console.log(e.message);
      return callback(e.message, null);
    });

    req.end();
  }
};