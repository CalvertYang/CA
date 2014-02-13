/**
 * ApiController
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

var crypto = require('crypto');
var moment = require('moment');
var async = require('async');

module.exports = {
    
  // 客樂得線上刷卡授權完成回報(HTTP Verb: GET)
  // 接收資料欄位如下：
  //  ret: 授權狀態識別，授權成功時為 "OK"
  //  cust_order_no: 契客訂單編號
  //  order_amount: 訂單/交易金額
  //  send_time: 原先的訂單傳送時間(為契客新增訂單內輸入之傳送時間)，格式為 YYYY-MM-DD HH:NN:SS，例如: 2012-04-03 07:17:25
  //  acquire_time: 收單交易時間(取得授權時間)，格式為 YYYY-MM-DD HH:NN:SS，例如:2013-04-03 07:19:32
  //  auth_code: 授權碼
  //  card_no: 卡號後四碼
  //  notify_time: 通報時間，為本次傳送訊息的時間(每一次傳輸均會更新)，格式為 YYYY-MM-DD HH:NN:SS，例如: 2013-04-03 07:19:46
  //  chk: 檢核碼，檢核碼產生方式為將 hash_base、order_amount、send_time、ret、acquire_time、auth_code、card_no、notify_time 及 cust_order_no
  //       各欄位以 '$' 串接，再以 MD5 演算法取得。
  cltCardAuthSuccess: function(req, res, next) {
    if (req.param('ret') == 'OK') {
      var data = sails.config.myConf.CLT_CONFIG.cocsHashBase + '$' + req.param('order_amount') + '$' + req.param('send_time') + '$' +
                 req.param('ret') + '$' + req.param('acquire_time') + '$' + req.param('auth_code') + '$' +
                 req.param('card_no') + '$' + req.param('notify_time') + '$' + req.param('cust_order_no');
      var chk = crypto.createHash('md5').update(data).digest("hex");

      if (req.param('chk') === chk) {
        // Update user's order here
        Order.findOne({ orderNo: req.param('cust_order_no') }, function (err, order) {
          if (err) return next(err);
          if (!order) {
            return res.redirect('/finish?message=查無訂單資料');
          }

          order.paymentDetail.authReport = {
            status: req.param('ret'),
            orderAmount: req.param('order_amount'),
            authCode: req.param('auth_code'),
            cardNo: req.param('card_no'),
            sendTime: new Date(req.param('send_time')),
            acquireTime: new Date(req.param('acquire_time')),
            notifyTime: new Date(req.param('notify_time'))
          };
          order.paymentStatus = 2;

          order.save(function(err, order2) {
            if (err) return next(err);
          });

          return res.redirect('/finish?message=交易完成，訂單資料可至查詢頁查詢，謝謝');
        });
      } else {
        return res.redirect('/finish?message=訂單資料驗證失敗');
      }
    } else {
      return res.redirect('/');
    }
  },

  // 客樂得線上刷卡授權失敗回報(HTTP Verb: GET)
  // 接收資料欄位如下：
  //  ret: 授權狀態識別，授權失敗時為 "FAIL"
  //  cust_order_no: 契客訂單編號
  //  order_amount: 訂單/交易金額
  //  send_time: 原先的訂單傳送時間(為契客新增訂單內輸入之傳送時間)，格式為 YYYY-MM-DD HH:NN:SS，例如: 2012-04-03 07:17:25
  //  notify_time: 通報時間，為本次傳送訊息的時間(每一次傳輸均會更新)，格式為 YYYY-MM-DD HH:NN:SS，例如: 2013-04-03 07:19:46
  //  chk: 檢核碼，檢核碼產生方式為將 hash_base、order_amount、send_time、ret、notify_time 及 cust_order_no
  //       各欄位以 '$' 串接，再以 MD5 演算法取得。
  cltCardAuthFail: function(req, res, next) {
    if (req.param('ret') == 'FAIL') {
      var data = sails.config.myConf.CLT_CONFIG.cocsHashBase + '$' + req.param('order_amount') + '$' + req.param('send_time') + '$' +
                 req.param('ret') + '$' + req.param('notify_time') + '$' + req.param('cust_order_no');
      var chk = crypto.createHash('md5').update(data).digest("hex");

      if (req.param('chk') === chk) {
        // Update user's order here
        Order.findOne({ orderNo: req.param('cust_order_no') }, function (err, order) {
          if (err) return next(err);
          if (!order) {
            return res.redirect('/finish?message=查無訂單資料');
          }

          order.paymentDetail.authReport = {
            status: req.param('ret'),
            orderAmount: req.param('order_amount'),
            sendTime: new Date(req.param('send_time')),
            notifyTime: new Date(req.param('notify_time'))
          };
          order.paymentStatus = 4;

          order.save(function(err, order2) {
            if (err) return next(err);
          });

          return res.redirect('/finish?message=線上刷卡授權失敗');
        });
      } else {
        return res.redirect('/finish?message=訂單資料驗證失敗');
      }
    } else {
      return res.redirect('/');
    }
  },

  getTicketType: function(req, res, next) {
    var token = '1K8zsd99EOy8k2NKD59ZTnCAaH4z8is9';

    if (req.method !== 'POST' || req.param('token') !== token) {
      return res.forbidden();
    } else {
      Event.findOne(req.param('id'), function(err, event) {
        if (err) {
          return res.serverError(err);
        } else {
          if (event) {
            return res.json(event.ticketType);
          } else {
            return res.json({ msg: 'Event not found.' });
          }
        }
      });
    }
  },


  getOrderInfo: function(req, res, next) {
    var token = '1K8zsd99EOy8k2NKD59ZTnCAaH4z8is9';

    if (req.method !== 'POST' || req.param('token') !== token) {
      return res.forbidden();
    } else {
      Event.findOne(req.param('id'), function(err, event) {
        if (err) {
          return res.serverError(err);
        } else {
          if (event) {
            var order = {};
            order._id = 'order id //唯一且自動產生';
            order.orderNo = '訂單編號 //string & unique & require';
            order.eventId = '歸屬活動 ID //string & require';
            order.fbid = '訂購人facebook id //string & require';
            order.contactName = '收件人姓名 //string & require';
            order.contactEmail = '收件人Email //string & equire';
            order.contactPhone = '收件人電話 //string & require';
            order.contactBirthday = '收件人生日 Ex: 1984/05/14 //date & require';

            order.contactAddress = {};
            order.contactAddress.zipCode = '訂購人地址五碼';
            order.contactAddress.city = '訂購人地址縣市 //require';
            order.contactAddress.area = '訂購人地址鄉鎮市區 //require';
            order.contactAddress.address = '訂購人詳細地址 //require';

            order.delivery = '配送方式 Ex: 1-現場領取 / 2-宅配 //integer & require';
            order.expressStauts ='物流處理進度 Ex: 1-未處理 / 2-處理中 / 3-已寄送 //integer & default 1';
            order.trackingNumber = '配送單號 //string & default \'\'';

            order.commodity = {}
            order.commodity.name = '票種名稱 //require';
            order.commodity.quantity = '票種數量 //require';

            order.grandTotal = '付款總額 //integer & require';
            order.paymentDetail = {TBD: '付款資料 請自行定義payemntDetail所需欄位 //json & require'};
            // order.paymentDetail.info = '付款資料 //請自行定義payemntDetail所需欄位 & require';
            order.paymentStatus = '付款狀態 Ex: 1-未繳費 / 2-已繳費 / 3-逾期繳費 / 4-刷卡授權失敗 / 5-退費 //integer & require';
            order.paymentType = '付款方式 Ex: 1-ibon / 2-線上刷卡 //integer & require';
            order.raceFinished = '完賽註記 Ex: true/ false //boolean & default false';

            order.registrationData = []; 
            order.registrationData[0] = {};
            for(var i = 0, len = event.registrationData.length; i < len; i++){
              if(event.registrationData[i].type == 'select'){
                order.registrationData[0]['field-' + i] = {};
                for(var j = 0, selectLen = event.registrationData[i].value.length; j <  selectLen; j++){
                    order.registrationData[0]['field-' + i][event.registrationData[i].value[j]] = '報名資料: ' + event.registrationData[i].name;
                }
              }else{
                order.registrationData[0]['field-' + i] = '報名資料: ' + event.registrationData[i].name;
              }
            }  

            order.createdAt = '訂單建立時間 //自動產生';
            order.updatedAt = '訂單修改時間 //自動產生';

            return res.json(order);
          } else {
            return res.json({ msg: 'Event not found.' });
          }
        }
      });
    }
  },

  getMemberInfo: function(req, res, next) {
    var token = '1K8zsd99EOy8k2NKD59ZTnCAaH4z8is9';

    if (req.method !== 'POST' || req.param('token') !== token) {
      return res.forbidden();
    } else {
      var member = {};
      member._id = 'member id //唯一且自動產生';
      member.fbid = 'Facebook Id //string & require & unique';
      member.name = '全名';
      member.firstName = '名';
      member.lastName = '姓';
      member.link = 'Facebook 連結';
      member.username = 'Facebook 名稱';
      member.birthday = '生日';
      member.gender = '性別';
      member.email = '電子郵件';
      member.timezone = '時區 Ex: -8';
      member.locale = '語系 Ex: en_US';
      member.verified = '驗證註記';
      member.updatedTime = 'Facebook 資料更新日期';
      member.createdAt = '會員建立時間 //自動產生';
      member.updatedAt = '會員更新時間 //自動產生';

      return res.json(member);
    }
  },

  createMember: function(req, res, next) {
    var token = '1K8zsd99EOy8k2NKD59ZTnCAaH4z8is9';
    var memberSource;
    try {
      memberSource = JSON.parse(req.param('member'));
    } catch (parserError) {
      return res.json({msg: 'please check your member json'});
    }
    if (req.method !== 'POST' || req.param('token') !== token) {
      return res.forbidden();
    } else if (!memberSource.fbid){
      return res.json({msg: 'no fbid value'});
    } else {
      Member.findOne({ fbid: memberSource.fbid}).done(function (err, dbMember){
        if(dbMember.length > 0){
          return res.json({msg: 'fbid is exist'});
        }else{
          var member = {};
          member.fbid = memberSource.fbid;
          member.name = memberSource.name || '';
          member.firstName = memberSource.firstName || '';
          member.lastName = memberSource.lastName || '';
          member.link = memberSource.link || '';
          member.username = memberSource.username || '';
          memberSource.birthday ? member.birthday =  new Date(memberSource.birthday) : member.birthday = new Date();
          member.gender = memberSource.gender || '';
          member.email = memberSource.email || '';
          member.timezone = memberSource.timezone || '';
          member.locale = memberSource.locale || '';
          member.verified = memberSource.verified || '';
          member.updatedTime = memberSource.updatedTime || '';
          Member.create(member, function(err, memberCreate){
            if(err){
              console.dir(JSON.stringify(err));
              return res.json({msg: 'db error', err: err});
            }else{
              return res.json(memberCreate);
            }
          });
        };
      });
    }
  },

  createOrder: function(req, res, next) {
    var token = '1K8zsd99EOy8k2NKD59ZTnCAaH4z8is9';
    var orderSource;
    try {
      orderSource = JSON.parse(req.param('order'));
    } catch (parserError) {
      return res.json({msg: 'please check your order json'});
    }
    if (req.method !== 'POST' || req.param('token') !== token) {
      return res.forbidden();
    } else if (
        !(orderSource.fbid 
          && orderSource.orderNo 
          && orderSource.eventId 
          && orderSource.contactName 
          && orderSource.contactPhone
          && orderSource.contactEmail
          && orderSource.contactAddress
          && orderSource.contactBirthday
          && orderSource.delivery
          && orderSource.commodity
          && orderSource.grandTotal
          && orderSource.paymentDetail
          && orderSource.paymentType
          && orderSource.paymentStatus)){
      return res.json({msg: 'missing some order params'});
    } else {
      async.waterfall([
        function(callback) {
          Event.findOne(orderSource.eventId, function(err, event) {
            if(err) callback('db error', err);
            event ? callback(null) : callback('not find this event(' + orderSource.eventId + ').', null);
          });
        },
        function(callback){
          Member.findOne({fbid: orderSource.fbid}, function(err, member){
            if(err) callback('db error', err);
            member ? callback(null) : callback('not find this user(' + orderSource.fbid + ').', null);
          })
        },
        function(callback){
          Order.findOne({orderNo: orderSource.orderNo}, function(err, order){
            if(err) callback('db error', err);
            order ? callback('this orderNo(' + orderSource.orderNo + ') is duplicated.', null) : callback(null);
          })
        },
        function(callback){
          var order = {};
          order.orderNo = orderSource.orderNo;
          order.eventId = orderSource.eventId;
          order.fbid = orderSource.fbid;

          order.contactName = orderSource.contactName || '';
          order.contactEmail = orderSource.contactEmail || '';
          order.contactPhone = orderSource.contactPhone || '';
          order.contactBirthday = orderSource.contactBirthday || '';

          order.contactAddress = {};
          order.contactAddress.zipCode = (orderSource.contactAddress ? orderSource.contactAddress.zipCode || '' : '');
          order.contactAddress.city = (orderSource.contactAddress ? orderSource.contactAddress.city || '' : '');
          order.contactAddress.area = (orderSource.contactAddress ? orderSource.contactAddress.area || '' : '');
          order.contactAddress.address = (orderSource.contactAddress ? orderSource.contactAddress.address || '' : '');

          order.delivery = orderSource.delivery || '';
          order.expressStauts = orderSource.expressStauts || '';
          order.trackingNumber = orderSource.trackingNumber || '';

          order.commodity = {};
          order.commodity.name = (orderSource.commodity ? orderSource.commodity.name || '' : '');
          order.commodity.quantity = (orderSource.commodity ? orderSource.commodity.quantity || '' : '');

          order.grandTotal = orderSource.grandTotal || '';
          order.paymentDetail = orderSource.paymentDetail || {};
          order.paymentStatus = orderSource.paymentStatus || '';
          order.paymentType = orderSource.paymentType || '';
          order.raceFinished = orderSource.raceFinished || '';

          order.registrationData = orderSource.registrationData || [];

          Order.create(order, function(err, orderCreate){
            if(err){
              callback('db error', err);
            }else{
              callback(null, orderCreate);
            }
          })
        }
      ], function(err, result){
        if(err){
          console.dir(JSON.stringify(result));
          return res.json({msg: err,err: result});
        }else{
          return res.json(result);
        }
      });
    }
  },

  updateMember: function(req, res, next){
    var token = '1K8zsd99EOy8k2NKD59ZTnCAaH4z8is9';
    var memberSource;
    try {
      memberSource = JSON.parse(req.param('member'));
    } catch (parserError) {
      console.dir(parserError);
      return res.json({msg: 'please check your member json', err: parserError});
    }
    if (req.method !== 'POST' || req.param('token') !== token) {
      return res.forbidden();
    }else if (!memberSource.fbid){
      return res.json({msg: 'no fbid value'});
    }else{
      Member.findOne({fbid: memberSource.fbid}).done(function(err, dbMember){
        if(err){
          console.log(JSON.stringify(err));
          return res.json({msg: 'db error', err: err});
        }
        if(dbMember){
          var member = {};
          if (typeof(memberSource.name) != 'undefined')  member.name = memberSource.name;
          if (typeof(memberSource.firstName) !=  'undefined')  member.firstName = memberSource.firstName;
          if (typeof(memberSource.lastName) !=  'undefined')  member.lastName = memberSource.lastName;
          if (typeof(memberSource.link) != 'undefined')  member.link = memberSource.link;
          if (typeof(memberSource.username) != 'undefined')  member.username = memberSource.username;
          if (typeof(memberSource.birthday) != 'undefined')  member.birthday =  new Date(memberSource.birthday);
          if (typeof(memberSource.gender) !=  'undefined')  member.gender = memberSource.gender;
          if (typeof(memberSource.email) !=  'undefined')  member.email = memberSource.email;
          if (typeof(memberSource.timezone) !=  'undefined')  member.timezone = memberSource.timezone;
          if (typeof(memberSource.locale) !=  'undefined')  member.locale = memberSource.locale;
          if (typeof(memberSource.verified) !=  'undefined')  member.verified = memberSource.verified ;
          if (typeof(memberSource.updatedTime) !=  'undefined')  member.updatedTime = memberSource.updatedTimee;
          Member.update({fbid: memberSource.fbid}, member, function(err, memberUpdate){
            if(err){
              console.log(JSON.stringify(err));
              return res.json({msg: 'db error', err: err});
            }else{
              return res.json(memberUpdate);
            }
          })
        }else{
          return res.json({msg: 'not find this user(' + memberSource.fbid + ').'});
        }
      })
    }
  },

  updateOrder: function(req, res, next){
    var token = '1K8zsd99EOy8k2NKD59ZTnCAaH4z8is9';
    var orderSource;
    try {
     orderSource = JSON.parse(req.param('order'));
    } catch (parserError) {
      console.dir(parserError);
      return res.json({msg: 'please check your order json', err: parserError});
    }
    if (req.method !== 'POST' || req.param('token') !== token) {
      return res.forbidden();
    }else if (!orderSource.orderNo){
      return res.json({msg: 'no orderNo'});
    }else{
      Order.findOne({orderNo: orderSource.orderNo}).done(function(err, dbOrder){
        if(err){
          console.log(JSON.stringify(err));
          return res.json({msg: 'db error', err: err});
        }
        if(dbOrder){
          var order = {};
          // if (typeof(orderSource.eventId) != 'undefined')  order.eventId = orderSource.eventId;
          // if (typeof(orderSource.fbid) != 'undefined')  order.fbid = orderSource.fbid;

          if (typeof(orderSource.contactName) != 'undefined')  order.contactName = orderSource.contactName;
          if (typeof(orderSource.contactEmail) != 'undefined')  order.contactEmail = orderSource.contactEmail;
          if (typeof(orderSource.contactBirthday) != 'undefined')  order.contactBirthday = new Date(orderSource.contactBirthday);

          if (typeof(orderSource.contactAddress) != 'undefined'){
            order.contactAddress = {};
            order.contactAddress.zipCode = orderSource.contactAddress.zipCode || dbOrder.contactAddress.zipCode || '';
            order.contactAddress.city = orderSource.contactAddress.city || dbOrder.contactAddress.city || '';
            order.contactAddress.area = orderSource.contactAddress.area || dbOrder.contactAddress.area || '';
            order.contactAddress.address = orderSource.contactAddress.address || dbOrder.contactAddress.address || '';
          }

          if (typeof(orderSource.delivery) != 'undefined')  order.delivery = orderSource.delivery;
          if (typeof(orderSource.expressStauts) != 'undefined')  order.expressStauts = orderSource.expressStauts;
          if (typeof(orderSource.trackingNumber) != 'undefined')  order.trackingNumber = orderSource.trackingNumber;

          if (typeof(orderSource.commodity) != 'undefined'){
            order.commodity = {};
            order.commodity.name = orderSource.commodity.name || dbOrder.commodity.name;
            order.commodity.quantity = orderSource.commodity.quantity || dbOrder.commodity.quantity;
          }

          if (typeof(orderSource.grandTotal) != 'undefined')  order.grandTotal = orderSource.grandTotal;
          if (typeof(orderSource.paymentDetail) != 'undefined')  order.paymentDetail = orderSource.paymentDetail;
          if (typeof(orderSource.paymentStatus) != 'undefined')  order.paymentStatus = orderSource.paymentStatus;
          if (typeof(orderSource.paymentType) != 'undefined')  order.paymentType = orderSource.paymentType;
          if (typeof(orderSource.raceFinished) != 'undefined')  order.raceFinished = orderSource.raceFinished;
          if (typeof(orderSource.registrationData) != 'undefined')  order.registrationData = orderSource.registrationData;

          Order.update({orderNo: orderSource.orderNo}, order, function(err, orderUpdate){
            if(err){
              console.log(JSON.stringify(err));
              return res.json({msg: 'db error', err: err});
            }else{
              return res.json(orderUpdate);
            }
          })
        }else{
          return res.json({msg: 'not find this order(' + orderSource.orderNo + ').'});
        }
      })
    }
  },
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ApiController)
   */
  _config: {}

  
};
