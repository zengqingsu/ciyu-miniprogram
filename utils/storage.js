// utils/storage.js - 数据持久化与备份工具
const STORAGE_KEYS = {
  LEARNING_RECORDS: 'learningRecords',
  REVIEW_RECORD: 'reviewRecord',
  NOTEBOOK: 'notebook',
  TODAY_LEARN_COUNT: 'todayLearnCount',
  LAST_LEARN_DATE: 'lastLearnDate',
  STREAK_DATE: 'streakDate',
  STREAK: 'streak',
  TOTAL_LEARN_TIME: 'totalLearnTime',
  ONLINE_WORDS: 'onlineWords',
  UNLOCKED_ACHIEVEMENTS: 'unlockedAchievements',
  REVIEW_LIST: 'reviewList',
  USER_PROGRESS: 'userProgress',
  DAILY_GOAL: 'dailyGoal',
  LEARN_PLAN: 'learnPlan'
};

/**
 * 备份所有学习数据
 */
function backupData() {
  const backup = {};
  const timestamp = Date.now();
  
  Object.keys(STORAGE_KEYS).forEach(key => {
    const storageKey = STORAGE_KEYS[key];
    const data = wx.getStorageSync(storageKey);
    if (data !== '') {
      backup[storageKey] = data;
    }
  });
  
  // 添加备份元数据
  backup._backupTime = timestamp;
  backup._version = '1.5';
  
  // 保存到备份存储
  const backupList = wx.getStorageSync('backupList') || [];
  backupList.push(backup);
  
  // 只保留最近5个备份
  if (backupList.length > 5) {
    backupList.shift();
  }
  
  wx.setStorageSync('backupList', backupList);
  wx.setStorageSync('latestBackup', timestamp);
  
  console.log('数据已备份', backupList.length, '个备份');
  return backupList.length;
}

/**
 * 恢复最近一次备份
 */
function restoreData() {
  const backupList = wx.getStorageSync('backupList') || [];
  if (backupList.length === 0) {
    return { success: false, message: '没有备份数据' };
  }
  
  const latestBackup = backupList[backupList.length - 1];
  
  // 恢复数据
  Object.keys(STORAGE_KEYS).forEach(key => {
    const storageKey = STORAGE_KEYS[key];
    if (latestBackup[storageKey] !== undefined) {
      wx.setStorageSync(storageKey, latestBackup[storageKey]);
    }
  });
  
  return { 
    success: true, 
    message: '数据已恢复',
    backupTime: latestBackup._backupTime
  };
}

/**
 * 恢复指定时间戳的备份
 */
function restoreDataByTime(backupTime) {
  const backupList = wx.getStorageSync('backupList') || [];
  const backup = backupList.find(b => b._backupTime === backupTime);
  
  if (!backup) {
    return { success: false, message: '备份不存在' };
  }
  
  Object.keys(STORAGE_KEYS).forEach(key => {
    const storageKey = STORAGE_KEYS[key];
    if (backup[storageKey] !== undefined) {
      wx.setStorageSync(storageKey, backup[storageKey]);
    }
  });
  
  return { success: true, message: '数据已恢复' };
}

/**
 * 获取备份列表
 */
function getBackupList() {
  const backupList = wx.getStorageSync('backupList') || [];
  return backupList.map(b => ({
    time: b._backupTime,
    version: b._version,
    size: JSON.stringify(b).length
  }));
}

/**
 * 删除旧备份
 */
function clearOldBackups(keepCount = 3) {
  const backupList = wx.getStorageSync('backupList') || [];
  if (backupList.length <= keepCount) {
    return 0;
  }
  
  const newList = backupList.slice(-keepCount);
  wx.setStorageSync('backupList', newList);
  return backupList.length - keepCount;
}

/**
 * 自动备份（每天第一次学习时）
 */
function autoBackup() {
  const today = new Date().toDateString();
  const lastBackupDate = wx.getStorageSync('lastBackupDate');
  
  if (lastBackupDate !== today) {
    backupData();
    wx.setStorageSync('lastBackupDate', today);
    return true;
  }
  return false;
}

/**
 * 导出数据（用于迁移）
 */
function exportData() {
  const data = {};
  Object.keys(STORAGE_KEYS).forEach(key => {
    const storageKey = STORAGE_KEYS[key];
    const value = wx.getStorageSync(storageKey);
    if (value !== '') {
      data[storageKey] = value;
    }
  });
  
  return data;
}

/**
 * 导入数据（用于迁移）
 */
function importData(data) {
  if (!data || typeof data !== 'object') {
    return { success: false, message: '数据格式错误' };
  }
  
  Object.keys(data).forEach(key => {
    if (key.startsWith('_')) return; // 跳过元数据
    wx.setStorageSync(key, data[key]);
  });
  
  return { success: true, message: '数据导入成功' };
}

/**
 * 获取存储使用情况
 */
function getStorageUsage() {
  const keys = wx.getStorageSync('storageInfoKeys') || Object.keys(STORAGE_KEYS);
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
    details: details.sort((a, b) => b.size - a.size)
  };
}

module.exports = {
  STORAGE_KEYS,
  backupData,
  restoreData,
  restoreDataByTime,
  getBackupList,
  clearOldBackups,
  autoBackup,
  exportData,
  importData,
  getStorageUsage
};