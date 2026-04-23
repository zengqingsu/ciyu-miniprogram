// pages/profile/profile.js
const words = require('../../utils/words.js');

Page({
  data: {
    stats: {},
    records: {},
    isLoading: true
  },
  
  onLoad() {
    this.loadData();
  },
  
  onShow() {
    this.loadData();
  },
  
  loadData() {
    this.setData({ isLoading: true });
    try {
      const stats = words.getStats();
      const records = words.getRecords();
      
      // 获取学习时长
      const totalTime = wx.getStorageSync('totalLearnTime') || 0;
      const todayKey = 'todayLearnCount';
      const today = new Date().toDateString();
      const lastDate = wx.getStorageSync('lastLearnDate');
      let todayCount = wx.getStorageSync(todayKey) || 0;
      if (lastDate !== today) {
        todayCount = 0;
      }
      
      // 格式化学习时长
      const totalMinutes = Math.floor(totalTime / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const timeText = hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;
      
      this.setData({ 
        stats, 
        records,
        todayCount,
        timeText,
        isLoading: false
      });
    } catch (e) {
      this.setData({ isLoading: false });
    }
  },
  
  // 清除学习记录
  clearRecords() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有学习记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('learningRecords');
          this.loadData();
          wx.showToast({
            title: '已清除',
            icon: 'success'
          });
        }
      }
    });
  },
  
  // 跳转到设置页面
  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },
  
  // 跳转到提醒设置
  goToRemind() {
    wx.navigateTo({
      url: '/pages/remind/remind'
    });
  },
  
  // 跳转到生词本
  goToNotebook() {
    wx.navigateTo({
      url: '/pages/notebook/notebook'
    });
  },
  
  // 跳转到测试
  goToQuiz() {
    wx.navigateTo({
      url: '/pages/quiz/quiz'
    });
  },
  
  // 跳转到成就
  goToAchievement() {
    wx.navigateTo({
      url: '/pages/achievement/achievement'
    });
  },
  
  // 跳转到搜索
  goToSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },
  
  // 跳转到每日任务
  goToDaily() {
    wx.navigateTo({
      url: '/pages/daily/daily'
    });
  },
  
  // 跳转到学习计划
  goToPlan() {
    wx.navigateTo({
      url: '/pages/plan/plan'
    });
  },
  
  // 跳转到错题复习
  goToReview() {
    wx.navigateTo({
      url: '/pages/review/review'
    });
  },
  
  // 跳转到听力练习
  goToListen() {
    wx.navigateTo({
      url: '/pages/listen/listen'
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
