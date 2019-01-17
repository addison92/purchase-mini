/**
 * 用户相关服务
 */

const util = require('../utils/util.js');
const api = require('../config/api.js');
var app = getApp();


/**
 * 调用微信登录
 */
function loginByWeixin(extra = {}) {
    return new Promise(function(resolve, reject) {
        return util.login().then((res) => {
            console.log(res);
            //登录远程服务器
            util.request(api.AuthLoginByWeixin, {
                code: res.code
            }, 'GET', false, extra).then(res => {
                console.log('login response:', res);
                //token_01 未携带token
                //token_03 未注册
                if (res.code == '00000') {
                    //存储用户信息
                    console.log('存储token');
                    wx.setStorageSync('token', res.data.token);
                    resolve(res);
                    wx.reLaunch({
                        url: extra.fromUrl,
                    })
                } else {
                    reject(res);
                }
            }).catch((err) => {
                reject(err);
            });
        }).catch((err) => {
            reject(err);
        })
    });
}

function registerByWeixin(nickName, avatarUrl, sharednumber) {
    let code = null;
    return new Promise(function(resolve, reject) {
        return util.login().then((res) => {
            //登录远程服务器
            util.request(api.RegisterByWeixin, {
                code: res.code,
                nickName: nickName,
                avatarUrl: avatarUrl,
                referee: sharednumber || null
            }, 'POST', true).then(res => {
                if (res.code === '00000') {
                    //存储信息
                    wx.setStorageSync('token', res.data.token);
                    resolve(res);
                } else {
                    reject(res);
                }
            }).catch((err) => {
                reject(err);
            });
        }).catch((err) => {
            reject(err);
        })
    });
}

/**
 * 判断用户是否登录
 */
function checkLogin() {
    return new Promise(function(resolve, reject) {
        if (wx.getStorageSync('token')) {
            util.checkSession().then(() => {
                resolve(true);
            }).catch(() => {
                loginByWeixin().then(() => {
                    resolve(true);
                }).catch((err) => {
                    reject(err);
                });
            });
        } else {
            loginByWeixin().then(() => {
                resolve(true);
            }).catch((err) => {
                reject(err);
            });
        }
    });
}

/**
 * 获取用户资料
 */
function getUserInfo() {
    return new Promise(function(resolve, reject) {
        util.request(api.GetUserInfo).then(res => {
            if (res.code === 0) {
                // if (!res.data.real_name){
                //   wx.navigateTo({
                //     url: '/pages/improve/first/index',
                //   })
                // }        
                resolve(res);
            } else {
                reject(res);
            }
        }).catch((err) => {
            reject(err);
        });
    });
}


module.exports = {
    loginByWeixin,
    checkLogin,
    registerByWeixin,
    getUserInfo
};