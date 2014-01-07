/**
 * Admin
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

    // 帳號
    account: {
      type: 'string',
      required: true,
      unique: true
    },

    // 密碼
    encryptedPassword: {
      type: 'string',
      required: true
    },

    // 姓名
    name: {
      type: 'string'
    }
    
  }

};
