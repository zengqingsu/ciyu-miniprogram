// app.js
const storage = require('./utils/storage.js');
const performance = require('./utils/performance.js');

App({
  onLaunch() {
    console.log('小程序启动');
    this.initApp();
  },
  
  // 初始化应用
  initApp() {
    // 检查并初始化每日学习数据
    this.checkDailyReset();
    
    // 检查连续学习天数
    this.checkStreak();
    
    // 自动备份数据
    storage.autoBackup();
    
    // 显示欢迎信息
    const hasShownWelcome = wx.getStorageSync('hasShownWelcome');
    if (!hasShownWelcome) {
      wx.setStorageSync('hasShownWelcome', true);
      wx.showToast({
        title: '欢迎使用词途！',
        icon: 'success',
        duration: 2000
      });
    }
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
  
  globalData: {
    userInfo: null,
    version: '1.5'
  }
});
