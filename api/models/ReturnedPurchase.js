/**
 * ReturnedPurchase
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

    // 訂單編號
    // Ex: 20140101000001
    orderNo: {
      type: 'string',
      required: true,
      unique: true
    },
    
    // 訂購人 Facebook Id
    // Ex: 4
    fbid: {
      type: 'string',
      required: true
    },

    // 退款原因
    // Ex: 缺錢花用
    reason: {
      type: 'string',
      required: true
    },

    // 聯絡電話
    // Ex: 0912345678
    contactMobile: {
      type: 'string',
      required: true
    },

    // 聯絡電子郵件
    // Ex: zuck@facebook.com
    contactEmail: {
      type: 'string',
      required: true,
      email: true
    }
    
  }

};
