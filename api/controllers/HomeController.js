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
    res.view();
  },

  // 修改訂單資料
  editOrder: function (req, res, next) {
    res.view();
  },

  // 填寫信用卡資訊
  payment: function (req, res, next) {
    res.view();
  }, 
  


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to HomeController)
   */
  _config: {}

  
};
