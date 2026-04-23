// pages/plan/plan.js
const words = require('../../utils/words.js');

Page({
  data: {
    dailyGoal: 10,
    totalWords: 35,
    learnedWords: 0,
    remainingWords: 35,
    daysLeft: 4,
    Math: Math,
    customGoal: ''
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
    this.setData({ dailyGoal: goal, customGoal: '' });
    this.loadPlan();
    
    wx.showToast({
      title: '目标已更新',
      icon: 'success'
    });
  },
  
  inputCustomGoal(e) {
    this.setData({ customGoal: e.detail.value });
  },
  
  setCustomGoal() {
    const goal = parseInt(this.data.customGoal);
    if (!goal || goal <= 0 || goal > 100) {
      wx.showToast({
        title: '请输入1-100之间的数字',
        icon: 'none'
      });
      return;
    }
    
    wx.setStorageSync('dailyGoal', goal);
    this.setData({ dailyGoal: goal, customGoal: '' });
    this.loadPlan();
    
    wx.showToast({
      title: `已设置为${goal}词/天`,
      icon: 'success'
    });
  }
});
