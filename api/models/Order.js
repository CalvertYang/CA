/**
 * Order
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

    // 收件人姓名
    // Ex: Mark Zuckerberg
    contactName: {
      type: 'string',
      required: true
    },

    // 收件人電子郵件
    // Ex: zuck@facebook.com
    contactEmail: {
      type: 'string',
      email: true
    },

    // 收件人地址
    // Ex: 台北市 xx 路 xx 巷 xx 號
    contactAddress: {
      type: 'string',
      required: true
    },

    // 收件人生日
    // Ex: 1984/05/14
    contactBirthday: {
      type: 'date'
    },

    // 配送方式
    // Ex: 現場領取 / 宅配
    delivery: {
      type: 'string'
    },

    // 商品資料
    commodity: {
      type: 'json'
    },

    // 付款資料
    payment: {
      type: 'json'
    },

    // 付款方式
    // Ex: 1-ibon / 2-線上刷卡
    paymentType: {
      type: 'integer'
    },

    // 付款狀態
    // Ex: 1-未繳費 / 2-已繳費 / 3-逾期繳費 / 4-刷卡授權失敗 / 5-退費
    paymentStatus: {
      type: 'integer'
    },

    // 物流處理進度
    // Ex: 處理中 / 已寄送
    expressStauts: {
      type: 'string'
    },

    // 配送單號
    // Ex: 52-3831-9003
    trackingNumber: {
      type: 'string'
    }
    
  }

};
