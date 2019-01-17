var api = require('../config/api.js');

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('.') + ' ' + [hour, minute].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function formatDate(date, split) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  split = split || '.'

  return [year, month, day].map(formatNumber).join(split)
}

/**
 * 微信的的request
 */
function request(url, data = {}, method = "GET", needLoading = false, extra = {}) {
  return new Promise(function(resolve, reject) {
    if (needLoading) {
      wx.showLoading()
    }
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'token': wx.getStorageSync('token')
      },
      success: function(res) {
        if (res.data.code == '00000') {
          resolve(res.data);
        } else {
          if (res.data.code == 'token_01' || res.data.code == 'token_02') {
            //token_01 未携带token,token_02 后台token失效 转到登录
            const user = require('../services/user.js');
            console.log("未携带token---extra:", extra);
            user.loginByWeixin(extra);
          } else if (res.data.code == 'no_register'){
            console.log("no_register---extra:", extra);
            if (extra.sharednumber) {
              let str = "";
              str += "sharednumber=" + extra.sharednumber+"&id="+extra.id;
              wx.redirectTo({
                url: '/pages/load/index?' + str + '&url=' + extra.url,
              })
            }else{
              wx.redirectTo({
                url: '/pages/load/index',
              })
            }
            
          }else {
            reject(res.errMsg);
          }

        }

      },
      fail: function(err) {
        console.log("error:", err);
        reject(err)
      },
      complete: function() {
        if (needLoading) {
          wx.hideLoading()
        }
      }
    })
  });
}

/**
 * 检查微信会话是否过期
 */
function checkSession() {
  return new Promise(function(resolve, reject) {
    wx.checkSession({
      success: function() {
        resolve(true);
      },
      fail: function() {
        reject(false);
      }
    })
  });
}

/**
 * 调用微信登录
 */
function login() {
  return new Promise(function(resolve, reject) {
    wx.login({
      success: function(res) {
        if (res.code) {
          //登录远程服务器
          resolve(res);
        } else {
          reject(res);  
        }
      },
      fail: function(err) {
        reject(err);
      }
    });
  });
}

function showErrorToast(msg) {
  wx.showToast({
    title: msg,
    image: '/static/images/icon_error.png'
  })
}

module.exports = {
  formatTime,
  request,
  showErrorToast,
  checkSession,
  login,
  formatDate
}