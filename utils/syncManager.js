// utils/syncManager.js - 增量同步管理器
// 处理离线数据的增量同步机制

const offlineStorage = require('./offlineStorage.js');

/**
 * 同步管理器
 */
class SyncManager {
  constructor() {
    this.isSyncing = false;
    this.syncListeners = [];
    this.retryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 5000;
  }

  /**
   * 注册同步状态监听器
   */
  onSyncStatusChange(callback) {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * 通知监听器
   */
  notifyListeners(status, data) {
    this.syncListeners.forEach(cb => {
      try {
        cb(status, data);
      } catch (e) {
        console.error('同步监听器错误:', e);
      }
    });
  }

  /**
   * 检查网络状态
   */
  checkNetworkStatus() {
    return new Promise((resolve) => {
      wx.getNetworkType({
        success: (res) => {
          const isConnected = res.networkType !== 'none';
          resolve({
            isConnected,
            networkType: res.networkType,
            isWifi: res.networkType === 'wifi'
          });
        },
        fail: () => resolve({ isConnected: false, networkType: 'unknown', isWifi: false })
      });
    });
  }

  /**
   * 检查是否满足同步条件
   */
  async canSync() {
    const network = await this.checkNetworkStatus();
    const settings = offlineStorage.getUserSettings();
    
    // 检查是否启用离线模式
    if (settings.offlineMode) {
      return { canSync: false, reason: '离线模式已启用' };
    }
    
    // 检查网络连接
    if (!network.isConnected) {
      return { canSync: false, reason: '网络未连接' };
    }
    
    // 检查是否仅WiFi同步
    if (settings.syncOnWifiOnly && !network.isWifi) {
      return { canSync: false, reason: '已设置仅WiFi同步' };
    }
    
    // 检查是否有待同步数据
    if (!offlineStorage.hasPendingChanges()) {
      return { canSync: false, reason: '没有待同步数据' };
    }
    
    return { 
      canSync: true, 
      network,
      pendingChanges: offlineStorage.getPendingChanges().length 
    };
  }

  /**
   * 执行增量同步
   */
  async sync(options = {}) {
    if (this.isSyncing) {
      return { success: false, reason: '同步正在进行中' };
    }

    const { forceSync = false } = options;
    
    // 检查同步条件
    if (!forceSync) {
      const checkResult = await this.canSync();
      if (!checkResult.canSync) {
        this.notifyListeners('skipped', { reason: checkResult.reason });
        return { success: false, reason: checkResult.reason };
      }
    }

    this.isSyncing = true;
    this.notifyListeners('syncing', { startTime: Date.now() });

    try {
      // 1. 获取待同步变更
      const pendingChanges = offlineStorage.getPendingChanges();
      
      if (pendingChanges.length === 0) {
        this.isSyncing = false;
        this.notifyListeners('completed', { synced: 0 });
        return { success: true, synced: 0 };
      }

      // 2. 构建同步请求
      const syncData = {
        changes: pendingChanges,
        clientTime: Date.now(),
        lastSyncTime: offlineStorage.getLastSyncTime()
      };

      // 3. 发送到服务器（模拟）
      const result = await this.sendSyncRequest(syncData);

      if (result.success) {
        // 4. 同步成功，清除待同步记录
        offlineStorage.clearPendingChanges();
        offlineStorage.updateSyncTime();
        
        // 5. 合并服务器返回的数据
        if (result.serverData) {
          await this.mergeServerData(result.serverData);
        }

        this.retryCount = 0;
        this.isSyncing = false;
        this.notifyListeners('completed', { 
          synced: pendingChanges.length,
          serverTime: result.serverTime 
        });

        return { 
          success: true, 
          synced: pendingChanges.length,
          serverTime: result.serverTime
        };
      } else {
        throw new Error(result.error || '同步失败');
      }

    } catch (error) {
      console.error('同步失败:', error);
      this.isSyncing = false;
      
      // 自动重试
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        this.notifyListeners('retrying', { 
          retryCount: this.retryCount, 
          maxRetries: this.maxRetries,
          error: error.message 
        });
        
        await this.delay(this.retryDelay);
        return this.sync(options);
      }
      
      this.notifyListeners('failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * 发送同步请求（模拟云函数调用）
   */
  async sendSyncRequest(syncData) {
    // 模拟网络请求
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟成功响应
        resolve({
          success: true,
          serverTime: Date.now(),
          serverData: {
            // 服务器返回的增量更新
            words: [],
            settings: null
          }
        });
      }, 1000);
    });

    // 实际实现应该调用云函数：
    /*
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'syncData',
        data: syncData,
        success: (res) => {
          resolve({
            success: true,
            serverTime: res.result.serverTime,
            serverData: res.result.data
          });
        },
        fail: (err) => {
          resolve({ success: false, error: err.message });
        }
      });
    });
    */
  }

  /**
   * 合并服务器数据
   */
  async mergeServerData(serverData) {
    // 合并词库更新
    if (serverData.words && serverData.words.length > 0) {
      const localDb = offlineStorage.getWordsDatabase();
      const mergedWords = this.mergeWords(localDb.words, serverData.words);
      offlineStorage.saveWordsDatabase({ ...localDb, words: mergedWords });
    }
  }

  /**
   * 合并单词数据（去重）
   */
  mergeWords(localWords, serverWords) {
    const wordMap = new Map();
    
    // 先加入本地词汇
    localWords.forEach(word => {
      wordMap.set(word.id, word);
    });
    
    // 合并服务器词汇（服务器优先）
    serverWords.forEach(word => {
      wordMap.set(word.id, { ...word, synced: true });
    });
    
    return Array.from(wordMap.values());
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取同步状态
   */
  getStatus() {
    return {
      isSyncing: this.isSyncing,
      pendingChanges: offlineStorage.getPendingChanges().length,
      lastSyncTime: offlineStorage.getLastSyncTime(),
      syncStatus: offlineStorage.getSyncStatus(),
      retryCount: this.retryCount
    };
  }

  /**
   * 手动触发同步
   */
  async triggerSync() {
    return this.sync({ forceSync: true });
  }

  /**
   * 智能同步（根据网络状况自动选择最佳策略）
   */
  async smartSync() {
    const network = await this.checkNetworkStatus();
    const settings = offlineStorage.getUserSettings();
    
    if (!network.isConnected) {
      this.notifyListeners('offline', { networkType: network.networkType });
      return { success: false, reason: '网络不可用' };
    }
    
    // WiFi环境：完整同步
    if (network.isWifi) {
      this.notifyListeners('wifi-sync', {});
      return this.sync({ forceSync: true });
    }
    
    // 移动网络：仅同步小数据
    if (settings.autoSync && offlineStorage.hasPendingChanges()) {
      const pending = offlineStorage.getPendingChanges();
      const totalSize = JSON.stringify(pending).length;
      
      // 小于10KB的数据可以在移动网络同步
      if (totalSize < 10 * 1024) {
        this.notifyListeners('mobile-sync', { size: totalSize });
        return this.sync({ forceSync: true });
      }
    }
    
    return { success: false, reason: '等待WiFi环境同步' };
  }
}

// 导出单例
const syncManager = new SyncManager();

module.exports = {
  SyncManager,
  syncManager
};
