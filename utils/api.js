// utils/api.js - API请求工具
const API_BASE = 'https://your-api-domain.com'; // 需要替换为实际后端地址

/**
 * 发起网络请求
 */
function request(url, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 获取每日单词
 */
function getDailyWords(count = 10) {
  return request('/words/daily', 'GET', { count });
}

/**
 * 提交测试结果
 */
function submitTestResults(wordIds, results) {
  return request('/words/test', 'POST', {
    word_ids: wordIds,
    results: results
  });
}

/**
 * 获取学习进度
 */
function getProgress() {
  return request('/words/progress', 'GET');
}

/**
 * 用户登录
 */
function login(code) {
  return request('/users/login', 'POST', { code });
}

/**
 * 用户注册
 */
function register(userInfo) {
  return request('/users/register', 'POST', userInfo);
}

/**
 * 获取用户资料
 */
function getProfile() {
  return request('/users/profile', 'GET');
}

module.exports = {
  request,
  getDailyWords,
  submitTestResults,
  getProgress,
  login,
  register,
  getProfile,
  setApiBase: (base) => { API_BASE = base; }
};
