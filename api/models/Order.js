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

    // 歸屬活動 ID
    // Ex: 52ccbf04a7c658ce1cd45c55
    eventId: {
      type: 'string',
      required: true
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

    // 收件人電話
    // Ex: 0912345678
    contactPhone: {
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
    // Ex: {
    //   zipCode: '10000',
    //   address: '台北市 xx 路 xx 巷 xx 號'
    // }
    contactAddress: {
      type: 'json',
      required: true
    },

    // 收件人生日
    // Ex: 1984/05/14
    contactBirthday: {
      type: 'date',
      required: true
    },

    // 配送方式
    // Ex: 1-現場領取 / 2-宅配
    delivery: {
      type: 'integer',
      required: true
    },

    // 商品資料
    commodity: {
      type: 'json',
      required: true
    },

    // 報名資料
    // 資料格式視建立活動時所建立之欄位而變動
    registrationData: {
      type: 'array',
      defaultsTo: []
    },

    // 付款總額
    grandTotal: {
      type: 'integer',
      required: true
    },

    // 付款資料
    paymentDetail: {
      type: 'json',
      required: true
    },

    // 付款方式
    // Ex: 1-ibon / 2-線上刷卡
    paymentType: {
      type: 'integer',
      required: true
    },

    // 付款狀態
    // Ex: 1-未繳費 / 2-已繳費 / 3-逾期繳費 / 4-刷卡授權失敗 / 5-退費
    paymentStatus: {
      type: 'integer',
      required: true
    },

    // 物流處理進度
    // Ex: 1-未處理 / 2-處理中 / 3-已寄送
    expressStauts: {
      type: 'integer',
      defaultsTo: 1
    },

    // 配送單號
    // Ex: 52-3831-9003
    trackingNumber: {
      type: 'string',
      defaultsTo: ''
    }
    
  }

};
