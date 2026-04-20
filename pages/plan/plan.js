// pages/plan/plan.js
const words = require('../../utils/words.js');

Page({
  data: {
    dailyGoal: 10,
    totalWords: 35,
    learnedWords: 0,
    remainingWords: 35,
    daysLeft: 4,
    Math: Math
  },
  
  onLoad() {
    this.loadPlan();
  },
  
  onShow() {
    this.loadPlan();
  },
  
  loadPlan() {
    const dailyGoal = wx.getStorageSync('dailyGoal') || 10;
    const totalWords = words.getWords().length;
    const records = words.getRecords();
    const learnedWords = records.known.length;
    const remainingWords = totalWords - learnedWords;
    const daysLeft = Math.ceil(remainingWords / dailyGoal);
    
    this.setData({
      dailyGoal,
      totalWords,
      learnedWords,
      remainingWords,
      daysLeft
    });
  },
  
  setGoal(e) {
    const goal = parseInt(e.currentTarget.dataset.goal);
    wx.setStorageSync('dailyGoal', goal);
    this.setData({ dailyGoal: goal });
    this.loadPlan();
    
    wx.showToast({
      title: '目标已更新',
      icon: 'success'
    });
  }
});
