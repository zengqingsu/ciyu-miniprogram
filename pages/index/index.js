// pages/index/index.js
const words = require('../../utils/words.js');

Page({
  data: {
    stats: {},
    todayWords: [],
    greeting: '',
    dailyGoal: 20,
    todayProgress: 0,
    lastLoadTime: 0,
    isLoading: true  // 新增 loading 状态
  },
  
  // 导航提示
  showNavigateToast(title) {
    wx.showToast({
      title,
      icon: 'none',
      duration: 800
    });
  },
  
  onLoad() {
    this.loadData();
    this.setGreeting();
  },
  
  onShow() {
    // 节流：1秒内不重复加载
    const now = Date.now();
    if (now - this.data.lastLoadTime > 1000) {
      this.loadData();
    }
  },
  
  setGreeting() {
    const hour = new Date().getHours();
    let greeting = '早上好';
    if (hour >= 6 && hour < 9) greeting = '早上好';
    else if (hour >= 9 && hour < 12) greeting = '上午好';
    else if (hour >= 12 && hour < 14) greeting = '中午好';
    else if (hour >= 14 && hour < 18) greeting = '下午好';
    else if (hour >= 18 && hour < 22) greeting = '晚上好';
    else greeting = '夜深了';
    
    this.setData({ greeting });
  },
  
  loadData(force = false) {
    // 缓存：5秒内不重复加载
    const now = Date.now();
    if (!force && now - this.data.lastLoadTime < 5000) {
      return;
    }
    
    this.setData({ isLoading: true });  // 显示loading
    
    try {
      const stats = words.getStats();
      const todayWords = words.getWordsBatch(5);
      const todayProgress = wx.getStorageSync('todayLearnCount') || 0;
      const dailyGoal = wx.getStorageSync('dailyGoal') || 20;
      
      this.setData({ 
        stats, 
        todayWords,
        todayProgress,
        dailyGoal,
        lastLoadTime: now,
        isLoading: false
      });
    } catch (e) {
      this.setData({ isLoading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },
  
  goToLearn() {
    wx.switchTab({
      url: '/pages/learn/learn'
    });
  },
  
  goToProfile() {
    wx.switchTab({
      url: '/pages/profile/profile'
    });
  },
  
  goToCategory() {
    wx.navigateTo({
      url: '/pages/category/category'
    });
  },
  
  goToQuiz() {
    wx.navigateTo({
      url: '/pages/quiz/quiz'
    });
  },
  
  goToDaily() {
    this.showNavigateToast('📅 每日任务');
    wx.navigateTo({
      url: '/pages/daily/daily'
    });
  },
  
  goToNotebook() {
    this.showNavigateToast('⭐ 生词本');
    wx.navigateTo({
      url: '/pages/notebook/notebook'
    });
  },
  
  goToReview() {
    this.showNavigateToast('📖 错题复习');
    wx.navigateTo({
      url: '/pages/review/review'
    });
  },
  
  goToListen() {
    this.showNavigateToast('👂 听力练习');
    wx.navigateTo({
      url: '/pages/listen/listen'
    });
  },
  
  goToSearch() {
    this.showNavigateToast('🔍 单词搜索');
    wx.navigateTo({
      url: '/pages/search/search'
      url: '/pages/search/search'
    });
  },
  
  goToPlan() {
    wx.navigateTo({
      url: '/pages/plan/plan'
    });
  },
  
  // 今日推荐单词点击跳转学习
  goToWord(e) {
    const word = e.currentTarget.dataset.word;
    wx.setStorageSync('currentWord', word);
    wx.switchTab({
      url: '/pages/learn/learn'
    });
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.loadData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '已刷新',
        icon: 'success'
      });
    }, 500);
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: '词途 - 让背单词变得更简单',
      path: '/pages/index/index'
    };
  }
});
