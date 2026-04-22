// pages/index/index.js
const words = require('../../utils/words.js');

Page({
  data: {
    stats: {},
    todayWords: [],
    greeting: '',
    dailyGoal: 20,
    todayProgress: 0
  },
  
  onLoad() {
    this.loadData();
    this.setGreeting();
  },
  
  onShow() {
    this.loadData();
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
  
  loadData() {
    const stats = words.getStats();
    const todayWords = words.getWordsBatch(5);
    const todayProgress = wx.getStorageSync('todayLearnCount') || 0;
    const dailyGoal = wx.getStorageSync('dailyGoal') || 20;
    
    this.setData({ 
      stats, 
      todayWords,
      todayProgress,
      dailyGoal
    });
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
    wx.navigateTo({
      url: '/pages/daily/daily'
    });
  },
  
  goToNotebook() {
    wx.navigateTo({
      url: '/pages/notebook/notebook'
    });
  },
  
  goToReview() {
    wx.navigateTo({
      url: '/pages/review/review'
    });
  },
  
  goToListen() {
    wx.navigateTo({
      url: '/pages/listen/listen'
    });
  },
  
  goToSearch() {
    wx.navigateTo({
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
  }
});
