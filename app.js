// app.js
const storage = require('./utils/storage.js');
const performance = require('./utils/performance.js');
const cloudSync = require('./utils/cloudSync.js');
const offlineStorage = require('./utils/offlineStorage.js');
const syncManager = require('./utils/syncManager.js');
const networkManager = require('./utils/networkManager.js');
const themeManager = require('./utils/themeManager.js');
const deviceAdapter = require('./utils/deviceAdapter.js');

App({
  onLaunch() {
    console.log('词途小程序 v1.8 启动');
    this.initApp();
  },
  
  // 初始化应用
  initApp() {
    // 1. 初始化设备适配器
    deviceAdapter.init();
    
    // 2. 初始化离线存储
    offlineStorage.initOfflineStorage();
    
    // 3. 初始化网络管理器
    networkManager.init();
    
    // 4. 初始化主题管理器
    themeManager.init();
    
    // 5. 初始化云开发
    cloudSync.initCloud();
    
    // 6. 检查并初始化每日学习数据
    this.checkDailyReset();
    
    // 7. 检查连续学习天数
    this.checkStreak();
    
    // 8. 自动备份数据（本地）
    storage.autoBackup();
    
    // 9. 自动云同步（检查是否开启）
    const autoSync = wx.getStorageSync('autoSync');
    if (autoSync !== false) {
      cloudSync.scheduleSync();
    }
    
    // 10. 显示欢迎信息
    const hasShownWelcome = wx.getStorageSync('hasShownWelcome');
    if (!hasShownWelcome) {
      wx.setStorageSync('hasShownWelcome', true);
      wx.showToast({
        title: '欢迎使用词途！',
        icon: 'success',
        duration: 2000
      });
    }
    
    // 11. 检查是否需要恢复离线数据
    this.checkOfflineData();
    
    console.log('应用初始化完成');
  },
  
  // 检查并重置每日数据
  checkDailyReset() {
    const today = new Date().toDateString();
    const lastDate = wx.getStorageSync('lastLearnDate');
    
    if (lastDate && lastDate !== today) {
      // 新的一天，重置当日计数
      wx.setStorageSync('todayLearnCount', 0);
    }
  },
  
  // 检查连续学习天数
  checkStreak() {
    const today = new Date().toDateString();
    const lastDate = wx.getStorageSync('streakDate');
    const yesterday = this.getYesterday();
    
    if (lastDate === yesterday) {
      // 昨天学习了，连续学习继续
      const streak = wx.getStorageSync('streak') || 0;
      // streak 会在学习页面更新
    } else if (lastDate !== today) {
      // 中断了连续学习
      wx.setStorageSync('streak', 0);
    }
  },
  
  // 获取昨天的日期字符串
  getYesterday() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toDateString();
  },
  
  // 检查离线数据
  checkOfflineData() {
    const hasOfflineData = offlineStorage.getLearningDatabase();
    if (hasOfflineData && hasOfflineData.records && hasOfflineData.records.length > 0) {
      console.log('发现离线数据:', hasOfflineData.records.length, '条记录');
    }
  },
  
  // 触发同步
  triggerSync() {
    return syncManager.triggerSync();
  },
  
  // 获取网络状态
  getNetworkStatus() {
    return networkManager.getStatus();
  },
  
  // 获取主题状态
  getThemeStatus() {
    return themeManager.getStatus();
  },
  
  // 获取设备信息
  getDeviceInfo() {
    return deviceAdapter.getStatus();
  },
  
  // 切换主题
  toggleTheme() {
    themeManager.toggleTheme();
  },
  
  globalData: {
    userInfo: null,
    version: '1.8',
    // 导出模块供页面使用
    offlineStorage,
    syncManager,
    networkManager,
    themeManager,
    deviceAdapter
  }
});
