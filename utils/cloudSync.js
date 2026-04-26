// utils/cloudSync.js - 云同步工具（技术验证版）
const storage = require('./storage.js');

/**
 * 云同步模块
 * 说明：此为技术验证原型，需开通云开发环境后投入使用
 */

// 云数据库引用（需在app.js中初始化）
let db = null;
let cloud = null;

/**
 * 初始化云开发
 */
function initCloud() {
  if (!wx.cloud) {
    console.warn('请开通云开发环境');
    return false;
  }
  
  cloud = wx.cloud;
  db = cloud.database();
  
  // 设置环境ID（需在project.config.json中配置）
  // cloud.init({ env: 'your-env-id' });
  
  console.log('云开发已初始化');
  return true;
}

/**
 * 获取用户唯一标识（(openId）
 */
async function getOpenId() {
  return new Promise((resolve, reject) => {
    cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        resolve(res.result.openId);
      },
      fail: err => {
        console.error('获取openId失败', err);
        resolve(null);
      }
    });
  });
}

/**
 * 上传数据到云端
 * @param {string} openId - 用户唯一标识
 */
async function uploadData(openId) {
  if (!db) {
    return { success: false, message: '云数据库未初始化' };
  }
  
  try {
    // 1. 导出本地数据
    const localData = storage.exportData();
    localData.lastSyncTime = Date.now();
    localData._openId = openId;
    
    // 2. 尝试获取云端数据（用于判断新增或更新）
    let cloudData = null;
    try {
      cloudData = await db.collection('userData').doc(openId).get();
    } catch (e) {
      // 不存在，创建新的
    }
    
    // 3. 上传到云端
    if (cloudData) {
      // 更新
      await db.collection('userData').doc(openId).update({
        data: localData
      });
    } else {
      // 新增
      await db.collection('userData').doc(openId).set({
        data: localData
      });
    }
    
    console.log('数据已同步到云端');
    return { success: true };
  } catch (err) {
    console.error('上传失败', err);
    return { success: false, message: err.message };
  }
}

/**
 * 从云端下载数据
 * @param {string} openId - 用户唯一标识
 */
async function downloadData(openId) {
  if (!db) {
    return { success: false, message: '云数据库未初始化' };
  }
  
  try {
    const result = await db.collection('userData').doc(openId).get();
    
    if (!result.data) {
      return { success: false, message: '云端无数据' };
    }
    
    const cloudData = result.data;
    const localData = storage.exportData();
    
    // 检查时间戳，决定是否合并
    const cloudTime = cloudData.lastSyncTime || 0;
    const localTime = localData.lastSyncTime || 0;
    
    if (cloudTime > localTime) {
      // 云端数据更新，覆盖本地
      storage.importData(cloudData);
      console.log('数据已从云端同步');
      return { success: true, message: '已更新' };
    } else {
      return { success: true, message: '本地已是最新' };
    }
  } catch (err) {
    console.error('下载失败', err);
    return { success: false, message: err.message };
  }
}

/**
 * 自动同步（当有网络时）
 */
async function autoSync(openId) {
  // 先尝试下载云端数据
  const downloadResult = await downloadData(openId);
  
  // 再上传本地数据
  if (downloadResult.message !== '本地已是最新') {
    await uploadData(openId);
  }
}

/**
 * 检查网络状态并同步
 */
async function checkAndSync() {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: async (res) => {
        if (res.networkType === 'wifi' || res.networkType === '4g') {
          // 有网络，执行同步
          const openId = await getOpenId();
          await autoSync(openId);
          resolve(true);
        } else {
          resolve(false);
        }
      },
      fail: () => resolve(false)
    });
  });
}

module.exports = {
  initCloud,
  getOpenId,
  uploadData,
  downloadData,
  autoSync,
  checkAndSync
};