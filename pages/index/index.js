// pages/index/index.js
const words = require('../../utils/words.js');

Page({
  data: {
    stats: {},
    todayWords: []
  },
  
  onLoad() {
    this.loadData();
  },
  
  onShow() {
    this.loadData();
  },
  
  loadData() {
    const stats = words.getStats();
    const todayWords = words.getWordsBatch(5);
    this.setData({ stats, todayWords });
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
  
  goToNotebook() {
    wx.navigateTo({
      url: '/pages/notebook/notebook'
    });
  }
});
