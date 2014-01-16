/**
 * System
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

    // 訂單編號日期
    orderDate: {
      type: 'date',
      required: true
    },

    // 訂單流水號
    // orderDate 若不是當日，則重置流水號(於 GlobalUtility 重置)
    orderSerial: {
      type: 'integer',
      defaultsTo: 0
    }
    
  }

};
