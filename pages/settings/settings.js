// pages/settings/settings.js
const api = require('../../utils/api.js');
const words = require('../../utils/words.js');
const cloudSync = require('../../utils/cloudSync.js');
const offlineStorage = require('../../utils/offlineStorage.js');
const syncManager = require('../../utils/syncManager.js');
const networkManager = require('../../utils/networkManager.js');
const themeManager = require('../../utils/themeManager.js');
const deviceAdapter = require('../../utils/deviceAdapter.js');

Page({
  data: {
    apiBase: '',
    testing: false,
    testResult: '',
    syncing: false,
    localCount: 0,
    onlineCount: 0,
    cloudSyncing: false,
    lastSyncTime: '',
    syncStatus: '',
    autoSync: true,
    
    // v1.8 新功能设置
    offlineMode: false,
    syncOnWifiOnly: true,
    nightMode: 'auto',
    nightModeOptions: ['关闭', '开启', '自动'],
    networkStatus: 'wifi',
    storageUsage: {},
    pendingChanges: 0,
    deviceType: 'phone'
  },
  
  onLoad() {
    // 读取保存的API地址
    const apiBase = wx.getStorageSync('apiBase') || '';
    const lastSync = wx.getStorageSync('lastCloudSync');
    const autoSync = wx.getStorageSync('autoSync');
    
    // 读取离线存储设置
    const settings = offlineStorage.getUserSettings();
    
    this.setData({ 
      apiBase,
      localCount: words.getWords().length,
      lastSyncTime: lastSync ? new Date(lastSync).toLocaleString() : '从未同步',
      autoSync: autoSync !== false, // 默认开启
      offlineMode: settings.offlineMode || false,
      syncOnWifiOnly: settings.syncOnWifiOnly !== false,
      nightMode: settings.nightMode === true ? '开启' : (settings.nightMode === 'auto' ? '自动' : '关闭')
    });
    
    api.setApiBase(apiBase);
    
    // 获取网络状态
    this.updateNetworkStatus();
    
    // 获取存储使用情况
    this.updateStorageUsage();
    
    // 获取设备信息
    this.updateDeviceInfo();
  },
  
  onShow() {
    // 每次显示页面时更新状态
    this.updateSyncStatus();
    this.updateStorageUsage();
  },
  
  // 更新网络状态
  updateNetworkStatus() {
    const status = networkManager.getStatus();
    this.setData({
      networkStatus: status.isConnected ? status.networkType : 'offline'
    });
  },
  
  // 更新存储使用情况
  updateStorageUsage() {
    const usage = offlineStorage.getStorageUsage();
    this.setData({
      storageUsage: usage,
      pendingChanges: usage.pendingChanges
    });
  },
  
  // 更新设备信息
  updateDeviceInfo() {
    const info = deviceAdapter.getDeviceInfo();
    this.setData({
      deviceType: info.deviceType
    });
  },
  
  // 更新同步状态
  updateSyncStatus() {
    const status = syncManager.getStatus();
    this.setData({
      lastSyncTime: status.lastSyncTime ? new Date(status.lastSyncTime).toLocaleString() : '从未同步',
      syncStatus: status.syncStatus,
      pendingChanges: status.pendingChanges
    });
  },
  
  onApiInput(e) {
    this.setData({ apiBase: e.detail.value });
  },
  
  async testApi() {
    if (!this.data.apiBase) {
      this.setData({ testResult: '请先输入API地址' });
      return;
    }
    
    this.setData({ testing: true, testResult: '' });
    api.setApiBase(this.data.apiBase);
    
    try {
      const data = await api.getDailyWords(1);
      this.setData({ 
        testResult: '✅ 连接成功！',
        onlineCount: data.words?.length || 0
      });
    } catch (err) {
      this.setData({ 
        testResult: '❌ 连接失败: ' + (err.errMsg || '网络错误')
      });
    } finally {
      this.setData({ testing: false });
    }
  },
  
  async syncWords() {
    this.setData({ syncing: true });
    
    try {
      const data = await api.getDailyWords(50);
      if (data.words && data.words.length > 0) {
        // 保存到本地存储
        wx.setStorageSync('onlineWords', data.words);
        this.setData({ 
          onlineCount: data.words.length,
          testResult: `✅ 同步成功！获取 ${data.words.length} 个单词`
        });
      }
    } catch (err) {
      this.setData({ 
        testResult: '❌ 同步失败: ' + (err.errMsg || '网络错误')
      });
    } finally {
      this.setData({ syncing: false });
    }
  },
  
  // 云同步 - 手动触发
  async manualCloudSync() {
    this.setData({ cloudSyncing: true, syncStatus: '同步中...' });
    
    try {
      const result = await syncManager.triggerSync();
      
      if (result.success) {
        this.setData({ 
          syncStatus: '✅ 同步成功',
          lastSyncTime: new Date().toLocaleString()
        });
        this.updateStorageUsage();
      } else {
        this.setData({ syncStatus: '⚠️ ' + result.reason });
      }
    } catch (err) {
      this.setData({ syncStatus: '❌ 同步失败: ' + err.message });
    } finally {
      this.setData({ cloudSyncing: false });
    }
  },
  
  // 智能同步
  async smartSync() {
    this.setData({ cloudSyncing: true, syncStatus: '智能同步中...' });
    
    try {
      const result = await syncManager.smartSync();
      
      if (result.success) {
        this.setData({ 
          syncStatus: '✅ 智能同步完成',
          lastSyncTime: new Date().toLocaleString()
        });
        this.updateStorageUsage();
      } else {
        this.setData({ syncStatus: '⚠️ ' + result.reason });
      }
    } catch (err) {
      this.setData({ syncStatus: '❌ 同步失败: ' + err.message });
    } finally {
      this.setData({ cloudSyncing: false });
    }
  },
  
  // 查看云端数据
  async viewCloudData() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const result = await cloudSync.downloadData();
      wx.hideLoading();
      
      if (result.success) {
        wx.showModal({
          title: '云端数据',
          content: result.message + '\n时间: ' + new Date().toLocaleString(),
          showCancel: false
        });
      } else {
        wx.showToast({ title: result.message, icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },
  
  saveSettings() {
    wx.setStorageSync('apiBase', this.data.apiBase);
    api.setApiBase(this.data.apiBase);
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
    
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },
  
  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？学习记录将被保留。',
      success: (res) => {
        if (res.confirm) {
          const keepKeys = ['learningRecords', 'notebook', 'unlockedAchievements', 'reviewRecord', 'apiBase', 'dailyGoal'];
          const allKeys = wx.getStorageInfoSync().keys;
          
          allKeys.forEach(key => {
            if (!keepKeys.includes(key)) {
              wx.removeStorageSync(key);
            }
          });
          
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          });
          
          this.updateStorageUsage();
        }
      }
    });
  },
  
  // 切换自动同步
  toggleAutoSync(e) {
    const autoSync = e.detail.value;
    wx.setStorageSync('autoSync', autoSync);
    this.setData({ autoSync });
    wx.showToast({
      title: autoSync ? '已开启自动同步' : '已关闭自动同步',
      icon: 'success'
    });
  },
  
  // 切换离线模式
  toggleOfflineMode(e) {
    const offlineMode = e.detail.value;
    const settings = offlineStorage.getUserSettings();
    settings.offlineMode = offlineMode;
    offlineStorage.saveUserSettings(settings);
    
    this.setData({ offlineMode });
    wx.showToast({
      title: offlineMode ? '已开启离线模式' : '已关闭离线模式',
      icon: 'success'
    });
  },
  
  // 切换仅WiFi同步
  toggleWifiOnly(e) {
    const syncOnWifiOnly = e.detail.value;
    const settings = offlineStorage.getUserSettings();
    settings.syncOnWifiOnly = syncOnWifiOnly;
    offlineStorage.saveUserSettings(settings);
    
    this.setData({ syncOnWifiOnly });
    wx.showToast({
      title: syncOnWifiOnly ? '已开启WiFi同步' : '已关闭WiFi同步',
      icon: 'success'
    });
  },
  
  // 切换夜间模式
  toggleNightMode(e) {
    const index = e.detail.value;
    const mode = ['关闭', '开启', '自动'][index];
    const settings = offlineStorage.getUserSettings();
    
    if (index === 0) {
      settings.nightMode = false;
      themeManager.disableNightMode();
    } else if (index === 1) {
      settings.nightMode = true;
      themeManager.enableNightMode();
    } else {
      settings.nightMode = 'auto';
      themeManager.enableAutoTheme();
    }
    
    offlineStorage.saveUserSettings(settings);
    this.setData({ nightMode: mode });
    
    wx.showToast({
      title: `已切换到${mode}模式`,
      icon: 'success'
    });
  },
  
  // 导出离线数据
  exportOfflineData() {
    const data = offlineStorage.exportAllData();
    const jsonStr = JSON.stringify(data, null, 2);
    
    wx.setStorageSync('offlineExportData', jsonStr);
    
    wx.showModal({
      title: '导出离线数据',
      content: `数据已准备好，共 ${data.wordsDatabase?.words?.length || 0} 个单词，${data.learningDatabase?.records?.length || 0} 条学习记录`,
      confirmText: '复制数据',
      success: (res) => {
        if (res.confirm) {
          // 复制到剪贴板
          wx.setClipboardData({
            data: jsonStr.substring(0, 10000) + '...', // 限制长度
            success: () => {
              wx.showToast({ title: '已复制到剪贴板', icon: 'success' });
            }
          });
        }
      }
    });
  },
  
  // 清除所有离线数据
  clearOfflineData() {
    wx.showModal({
      title: '清除离线数据',
      content: '确定要清除所有离线数据吗？这将删除本地缓存的所有数据。',
      success: (res) => {
        if (res.confirm) {
          offlineStorage.clearAllOfflineData();
          this.updateStorageUsage();
          wx.showToast({
            title: '离线数据已清除',
            icon: 'success'
          });
        }
      }
    });
  },
  
  // 查看缓存大小
  getCacheSize() {
    const info = wx.getStorageInfoSync();
    const sizeKB = (info.currentSize / 1024).toFixed(2);
    return sizeKB;
  }
});