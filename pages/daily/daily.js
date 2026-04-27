// pages/daily/daily.js
const daily = require('../../utils/daily.js');

Page({
  data: {
    tasks: [],
    completedCount: 0,
    totalCount: 0,
    today: ''
  },
  
  onShow() {
    this.loadTasks();
  },
  
  loadTasks() {
    const tasks = daily.getDailyTasks();
    const completedCount = daily.getCompletedCount();
    const today = new Date().toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
    
    this.setData({
      tasks,
      completedCount,
      totalCount: tasks.length,
      today
    });
  },
  
  // 刷新任务
  refreshTasks() {
    this.loadTasks();
    wx.showToast({ title: '已刷新', icon: 'none' });
  },
  
  // 跳转学习
  goToLearn() {
    wx.switchTab({ url: '/pages/learn/learn' });
  },
  
  // 分享成就
  onShareAppMessage() {
    return {
      title: `今日完成${this.data.completedCount}/${this.data.totalCount}个任务`,
      path: '/pages/daily/daily'
    };
  }
});
