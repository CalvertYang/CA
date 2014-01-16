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
  cltCardAuthSuccess: function (req, res, next) {
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
            sendTime: new Date(moment(req.param('send_time')).zone(0).format()),
            acquireTime: new Date(moment(req.param('acquire_time')).zone(0).format()),
            notifyTime: new Date(moment(req.param('notify_time')).zone(0).format())
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
  cltCardAuthFail: function (req, res, next) {
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
            sendTime: new Date(moment(req.param('send_time')).zone(0).format()),
            notifyTime: new Date(moment(req.param('notify_time')).zone(0).format())
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


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ApiController)
   */
  _config: {}

  
};
