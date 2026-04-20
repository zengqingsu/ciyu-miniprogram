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
  }
});
