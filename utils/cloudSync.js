// utils/cloudSync.js - 云同步工具
const storage = require('./storage.js');

/**
 * 云同步模块
 * 支持：数据上云、多设备同步、离线优先
 */

// 云开发配置（需在微信开发者工具中开通云开发）
const CLOUD_ENV = 'ciyu-miniprogram'; // TODO: 替换为你的云环境ID

let db = null;
let cloud = null;
let openId = null;

/**
 * 初始化云开发
 */
function initCloud() {
  if (!wx.cloud) {
    console.warn('请在微信开发者工具中开通云开发环境');
    return false;
  }
  
  try {
    cloud = wx.cloud;
    cloud.init({
      env: CLOUD_ENV
    });
    db = cloud.database();
    console.log('云开发已初始化');
    return true;
  } catch (err) {
    console.error('云开发初始化失败', err);
    return false;
  }
}

/**
 * 获取用户openId（通过云函数）
 */
async function getOpenId() {
  if (openId) return openId;
  
  try {
    const result = await cloud.callFunction({
      name: 'getOpenId'
    });
    openId = result.result.openId;
    console.log('获取openId成功', openId);
    return openId;
  } catch (err) {
    console.error('获取openId失败', err);
    return null;
  }
}

/**
 * 上传数据到云端（调用云函数）
 * @param {Object} userData - 用户数据
 */
async function uploadData(userData) {
  if (!userData) {
    userData = storage.exportData();
  }
  
  // 添加同步元数据
  userData.lastSyncTime = Date.now();
  userData._deviceId = wx.getStorageSync('deviceId') || generateDeviceId();
  
  try {
    const result = await cloud.callFunction({
      name: 'syncUserData',
      data: { userData }
    });
    
    if (result.result && result.result.success) {
      console.log('数据已同步到云端');
      return { success: true };
    } else {
      console.error('同步失败', result.result.message);
      return { success: false, message: result.result.message };
    }
  } catch (err) {
    console.error('上传失败', err);
    return { success: false, message: err.message };
  }
}

/**
 * 从云端下载数据
 */
async function downloadData() {
  try {
    const result = await cloud.callFunction({
      name: 'getUserData'
    });
    
    if (result.result && result.result.success) {
      const cloudData = result.result.data;
      
      // 检查时间戳进行合并
      const localData = storage.exportData();
      const cloudTime = cloudData.lastSyncTime || 0;
      const localTime = localData.lastSyncTime || 0;
      
      if (cloudTime > localTime) {
        // 云端数据更新，覆盖本地
        storage.importData(cloudData);
        console.log('数据已从云端同步');
        return { success: true, message: '已更新' };
      } else {
        // 本地数据更新，需要上传
        console.log('本地已是最新');
        return { success: true, message: '本地已是最新' };
      }
    } else {
      return { success: false, message: result.result.message };
    }
  } catch (err) {
    console.error('下载失败', err);
    return { success: false, message: err.message };
  }
}

/**
 * 自动同步
 * 策略：先下后上，冲突以最新时间戳为准
 */
async function sync() {
  // 检查网络
  const network = await checkNetwork();
  if (!network) {
    console.log('无网络，跳过同步');
    return { success: false, message: '无网络' };
  }
  
  // 确保有openId
  const oid = await getOpenId();
  if (!oid) {
    return { success: false, message: '无法获取openId' };
  }
  
  // 尝试从云端下载
  const downloadResult = await downloadData();
  
  // 如果云端不是最新，上传本��数据
  if (downloadResult.message !== '本地已是最新') {
    await uploadData();
  }
  
  return { success: true };
}

/**
 * 检查网络状态
 */
function checkNetwork() {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: (res) => {
        const hasNetwork = res.networkType !== 'none';
        resolve(hasNetwork);
      },
      fail: () => resolve(false)
    });
  });
}

/**
 * 生成设备ID
 */
function generateDeviceId() {
  const deviceId = wx.getStorageSync('deviceId');
  if (deviceId) return deviceId;
  
  const newId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  wx.setStorageSync('deviceId', newId);
  return newId;
}

/**
 * 手动触发同步（供页面调用）
 */
function manualSync() {
  wx.showLoading({ title: '同步中...' });
  
  sync().then((result) => {
    wx.hideLoading();
    
    if (result.success) {
      wx.showToast({ title: '已同步', icon: 'success' });
    } else {
      wx.showToast({ title: result.message || '同步失败', icon: 'none' });
    }
  }).catch((err) => {
    wx.hideLoading();
    wx.showToast({ title: '同步失败', icon: 'none' });
  });
}

/**
 * 定时同步（通过后台定时器）
 * 注意：小程序没有真正的后台定时器，需依赖用户打开
 */
function scheduleSync() {
  const lastSync = wx.getStorageSync('lastCloudSync') || 0;
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  // 每天首次使用自动同步
  if (now - lastSync > ONE_DAY) {
    manualSync();
    wx.setStorageSync('lastCloudSync', now);
  }
}

module.exports = {
  initCloud,
  getOpenId,
  uploadData,
  downloadData,
  sync,
  manualSync,
  scheduleSync,
  checkNetwork
};