// pages/profile/profile.js
const words = require('../../utils/words.js');

Page({
  data: {
    stats: {},
    records: {}
  },
  
  onLoad() {
    this.loadData();
  },
  
  onShow() {
    this.loadData();
  },
  
  loadData() {
    const stats = words.getStats();
    const records = words.getRecords();
    this.setData({ stats, records });
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
  }
});
