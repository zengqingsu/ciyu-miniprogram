// utils/offlineStorage.js - 离线数据存储模块
// 提供完整的本地数据存储和增量同步能力

const DB_VERSION = '1.8.0';

// 存储键名常量
const OFFLINE_KEYS = {
  VERSION: 'offlineVersion',
  LAST_SYNC: 'lastSyncTime',
  SYNC_STATUS: 'syncStatus',
  PENDING_CHANGES: 'pendingChanges',
  WORDS_DB: 'wordsDatabase',
  LEARNING_DB: 'learningDatabase',
  USER_PROFILE: 'userProfile',
  WORD_PROGRESS: 'wordProgress',
  REVIEW_SCHEDULE: 'reviewSchedule',
  SETTINGS: 'userSettings',
  CACHE_INDEX: 'cacheIndex'
};

/**
 * 初始化离线存储
 */
function initOfflineStorage() {
  const currentVersion = wx.getStorageSync(OFFLINE_KEYS.VERSION);
  
  if (currentVersion !== DB_VERSION) {
    // 版本升级，执行迁移
    migrateFromV17();
    wx.setStorageSync(OFFLINE_KEYS.VERSION, DB_VERSION);
  }
  
  // 初始化同步状态
  if (!wx.getStorageSync(OFFLINE_KEYS.LAST_SYNC)) {
    wx.setStorageSync(OFFLINE_KEYS.LAST_SYNC, 0);
  }
  
  console.log('离线存储初始化完成', DB_VERSION);
  return { version: DB_VERSION };
}

/**
 * 从v1.7迁移数据
 */
function migrateFromV17() {
  // 迁移现有学习记录
  const learningRecords = wx.getStorageSync('learningRecords');
  if (learningRecords) {
    saveLearningDatabase(learningRecords);
  }
  
  // 迁移复习计划
  const reviewList = wx.getStorageSync('reviewList');
  if (reviewList) {
    saveReviewSchedule(reviewList);
  }
  
  console.log('数据迁移完成');
}

/**
 * 保存词库数据（完整覆盖）
 */
function saveWordsDatabase(wordsData) {
  const data = {
    words: wordsData.words || [],
    categories: wordsData.categories || [],
    updateTime: Date.now()
  };
  
  wx.setStorageSync(OFFLINE_KEYS.WORDS_DB, data);
  addPendingChange('words', 'update', data);
  
  return true;
}

/**
 * 获取本地词库
 */
function getWordsDatabase() {
  return wx.getStorageSync(OFFLINE_KEYS.WORDS_DB) || { words: [], categories: [], updateTime: 0 };
}

/**
 * 保存学习数据
 */
function saveLearningDatabase(learningData) {
  const data = {
    records: learningData.records || [],
    stats: learningData.stats || {},
    updateTime: Date.now()
  };
  
  wx.setStorageSync(OFFLINE_KEYS.LEARNING_DB, data);
  addPendingChange('learning', 'update', data);
  
  return true;
}

/**
 * 获取本地学习数据
 */
function getLearningDatabase() {
  return wx.getStorageSync(OFFLINE_KEYS.LEARNING_DB) || { records: [], stats: {}, updateTime: 0 };
}

/**
 * 保存用户进度
 */
function saveWordProgress(wordId, progress) {
  const allProgress = wx.getStorageSync(OFFLINE_KEYS.WORD_PROGRESS) || {};
  
  allProgress[wordId] = {
    ...progress,
    updateTime: Date.now()
  };
  
  wx.setStorageSync(OFFLINE_KEYS.WORD_PROGRESS, allProgress);
  addPendingChange('progress', 'update', { wordId, progress });
  
  return allProgress[wordId];
}

/**
 * 获取单词进度
 */
function getWordProgress(wordId) {
  const allProgress = wx.getStorageSync(OFFLINE_KEYS.WORD_PROGRESS) || {};
  return allProgress[wordId] || null;
}

/**
 * 获取所有单词进度
 */
function getAllWordProgress() {
  return wx.getStorageSync(OFFLINE_KEYS.WORD_PROGRESS) || {};
}

/**
 * 保存复习日程
 */
function saveReviewSchedule(reviewData) {
  const data = {
    schedule: reviewData.schedule || [],
    lastReviewTime: reviewData.lastReviewTime || 0,
    nextReviewTime: reviewData.nextReviewTime || 0,
    updateTime: Date.now()
  };
  
  wx.setStorageSync(OFFLINE_KEYS.REVIEW_SCHEDULE, data);
  addPendingChange('review', 'update', data);
  
  return true;
}

/**
 * 获取复习日程
 */
function getReviewSchedule() {
  return wx.getStorageSync(OFFLINE_KEYS.REVIEW_SCHEDULE) || { 
    schedule: [], 
    lastReviewTime: 0, 
    nextReviewTime: 0 
  };
}

/**
 * 保存用户设置
 */
function saveUserSettings(settings) {
  const data = {
    ...settings,
    updateTime: Date.now()
  };
  
  wx.setStorageSync(OFFLINE_KEYS.SETTINGS, data);
  addPendingChange('settings', 'update', data);
  
  return true;
}

/**
 * 获取用户设置
 */
function getUserSettings() {
  return wx.getStorageSync(OFFLINE_KEYS.SETTINGS) || getDefaultSettings();
}

/**
 * 获取默认设置
 */
function getDefaultSettings() {
  return {
    offlineMode: false,
    syncOnWifiOnly: true,
    autoSync: true,
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    nightMode: false,
    notification: true,
    dailyGoal: 20,
    updateTime: Date.now()
  };
}

/**
 * 添加待同步变更
 */
function addPendingChange(type, action, data) {
  const pending = wx.getStorageSync(OFFLINE_KEYS.PENDING_CHANGES) || [];
  
  pending.push({
    type,
    action,
    data,
    timestamp: Date.now()
  });
  
  // 最多保留100条待同步记录
  if (pending.length > 100) {
    pending.shift();
  }
  
  wx.setStorageSync(OFFLINE_KEYS.PENDING_CHANGES, pending);
  wx.setStorageSync(OFFLINE_KEYS.SYNC_STATUS, 'pending');
}

/**
 * 获取待同步变更
 */
function getPendingChanges() {
  return wx.getStorageSync(OFFLINE_KEYS.PENDING_CHANGES) || [];
}

/**
 * 清除已同步的变更
 */
function clearPendingChanges() {
  wx.setStorageSync(OFFLINE_KEYS.PENDING_CHANGES, []);
  wx.setStorageSync(OFFLINE_KEYS.SYNC_STATUS, 'synced');
}

/**
 * 更新同步时间
 */
function updateSyncTime() {
  wx.setStorageSync(OFFLINE_KEYS.LAST_SYNC, Date.now());
  wx.setStorageSync(OFFLINE_KEYS.SYNC_STATUS, 'synced');
}

/**
 * 获取最后同步时间
 */
function getLastSyncTime() {
  return wx.getStorageSync(OFFLINE_KEYS.LAST_SYNC) || 0;
}

/**
 * 获取同步状态
 */
function getSyncStatus() {
  return wx.getStorageSync(OFFLINE_KEYS.SYNC_STATUS) || 'none';
}

/**
 * 检查是否有待同步数据
 */
function hasPendingChanges() {
  const pending = wx.getStorageSync(OFFLINE_KEYS.PENDING_CHANGES) || [];
  return pending.length > 0;
}

/**
 * 获取存储使用情况
 */
function getStorageUsage() {
  const keys = Object.values(OFFLINE_KEYS);
  let totalSize = 0;
  const details = [];
  
  keys.forEach(key => {
    const data = wx.getStorageSync(key);
    if (data) {
      const size = JSON.stringify(data).length;
      totalSize += size;
      details.push({ key, size });
    }
  });
  
  return {
    totalSize,
    totalSizeKB: (totalSize / 1024).toFixed(2),
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    details: details.sort((a, b) => b.size - a.size),
    pendingChanges: getPendingChanges().length,
    lastSyncTime: getLastSyncTime()
  };
}

/**
 * 清除所有离线数据
 */
function clearAllOfflineData() {
  const keys = Object.values(OFFLINE_KEYS);
  keys.forEach(key => {
    wx.removeStorageSync(key);
  });
  
  console.log('离线数据已清除');
  return true;
}

/**
 * 导出完整数据（用于迁移）
 */
function exportAllData() {
  return {
    version: DB_VERSION,
    exportTime: Date.now(),
    wordsDatabase: getWordsDatabase(),
    learningDatabase: getLearningDatabase(),
    wordProgress: getAllWordProgress(),
    reviewSchedule: getReviewSchedule(),
    userSettings: getUserSettings(),
    pendingChanges: getPendingChanges()
  };
}

/**
 * 导入数据（用于迁移）
 */
function importAllData(data) {
  if (!data || !data.version) {
    return { success: false, message: '数据格式错误' };
  }
  
  try {
    if (data.wordsDatabase) {
      wx.setStorageSync(OFFLINE_KEYS.WORDS_DB, data.wordsDatabase);
    }
    if (data.learningDatabase) {
      wx.setStorageSync(OFFLINE_KEYS.LEARNING_DB, data.learningDatabase);
    }
    if (data.wordProgress) {
      wx.setStorageSync(OFFLINE_KEYS.WORD_PROGRESS, data.wordProgress);
    }
    if (data.reviewSchedule) {
      wx.setStorageSync(OFFLINE_KEYS.REVIEW_SCHEDULE, data.reviewSchedule);
    }
    if (data.userSettings) {
      wx.setStorageSync(OFFLINE_KEYS.SETTINGS, data.userSettings);
    }
    
    wx.setStorageSync(OFFLINE_KEYS.VERSION, data.version);
    
    return { success: true, message: '数据导入成功' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

module.exports = {
  DB_VERSION,
  OFFLINE_KEYS,
  initOfflineStorage,
  saveWordsDatabase,
  getWordsDatabase,
  saveLearningDatabase,
  getLearningDatabase,
  saveWordProgress,
  getWordProgress,
  getAllWordProgress,
  saveReviewSchedule,
  getReviewSchedule,
  saveUserSettings,
  getUserSettings,
  getDefaultSettings,
  addPendingChange,
  getPendingChanges,
  clearPendingChanges,
  updateSyncTime,
  getLastSyncTime,
  getSyncStatus,
  hasPendingChanges,
  getStorageUsage,
  clearAllOfflineData,
  exportAllData,
  importAllData
};
