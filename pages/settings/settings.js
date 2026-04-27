// pages/settings/settings.js
const api = require('../../utils/api.js');
const words = require('../../utils/words.js');
const cloudSync = require('../../utils/cloudSync.js');

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
    autoSync: true
  },
  
  onLoad() {
    // 读取保存的API地址
    const apiBase = wx.getStorageSync('apiBase') || '';
    const lastSync = wx.getStorageSync('lastCloudSync');
    const autoSync = wx.getStorageSync('autoSync');
    
    this.setData({ 
      apiBase,
      localCount: words.getWords().length,
      lastSyncTime: lastSync ? new Date(lastSync).toLocaleString() : '从未同步',
      autoSync: autoSync !== false // 默认开启
    });
    api.setApiBase(apiBase);
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
      const result = await cloudSync.sync();
      
      if (result.success) {
        this.setData({ 
          syncStatus: '✅ 同步成功',
          lastSyncTime: new Date().toLocaleString()
        });
      } else {
        this.setData({ syncStatus: '⚠️ ' + result.message });
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
  
  // 查看缓存大小
  getCacheSize() {
    const info = wx.getStorageInfoSync();
    const sizeKB = (info.currentSize / 1024).toFixed(2);
    return sizeKB;
  }
});