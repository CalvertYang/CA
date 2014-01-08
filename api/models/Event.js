/**
 * Event
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

    // 活動名稱
    // Ex: 美國隊長路跑
    title: {
      type: 'string',
      required: true
    },

    // 活動描述
    // Ex: 無
    description: {
      type: 'string'
    },

    // 活動地點
    // Ex: xx河濱公園
    place: {
      type: 'string',
    },

    // 地址
    // Ex: 台北市 xx 路 xx 巷 x 號
    address: {
      type: 'json'
    },

    // 活動開始時間
    // Ex: 2014-02-01 09:00:00.000Z
    startOn: {
      type: 'datetime',
      required: true
    },

    // 活動結束時間
    // Ex: 2014-02-01 16:00:00.000Z
    endOn: {
      type: 'datetime',
      required: true
    },

    // 報名開始時間
    // Ex: 2014-01-15 00:00:00.000Z
    registrationStartOn: {
      type: 'datetime',
      required: true
    },

    // 報名截止時間
    // Ex: 2014-01-25 00:00:00.000Z
    registrationEndOn: {
      type: 'datetime',
      required: true
    },

    // 主辦單位
    // Ex: Marvel
    sponsor: {
      type: 'string'
    },

    // 聯絡人
    // Ex: Zuck
    contact: {
      type: 'string'
    },

    // 聯絡電話
    // Ex: 0912345678
    contactPhone: {
      type: 'string'
    },

    // 聯絡電子郵件
    // Ex: zuck@facebook.com
    contactEmail: {
      type: 'string',
      email: true
    },

    // 報名所需資料
    registrationData: {
      type: 'array'
    },

    // 報名人數限制
    quantity: {
      type: 'integer',
      defaultsTo: 0
    }

  }

};
