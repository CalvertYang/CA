/**
 * Member
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

    // Facebook Id
    // Ex: 4
    fbid: {
      type: 'string',
      required: true,
      unique: true
    },

    // 全名
    // Ex: Mark Zuckerberg
    name: {
      type: 'string'
    },

    // 名
    // Ex: Mark
    firstName: {
      type: 'string'
    },

    // 姓
    // Ex: Zuckerberg
    lastName: {
      type: 'string'
    },

    // Facebook 連結
    // Ex: https://www.facebook.com/zuck
    link: {
      type: 'string'
    },

    // Facebook 名稱
    // Ex: zuck
    username: {
      type: 'string'
    },

    // 生日
    // Ex: 1984/05/14
    birthday: {
      type: 'date'
    },

    // 性別
    // Ex: male
    gender: {
      type: 'string'
    },

    // 電子郵件
    // Ex: zuck@facebook.com
    email: {
      type: 'string',
      email: true
    },

    // 時區
    // Ex: -8
    timezone: {
      type: 'integer'
    },

    // 語系
    // Ex: en_US
    locale: {
      type: 'string'
    },

    // 已驗證
    // Ex: true
    verified: {
      type: 'boolean'
    },

    // Facebook 資料更新日期
    // Ex: 2014-01-01 00:00:00.000Z
    updatedTime: {
      type: 'datetime'
    }
    
  }

};
