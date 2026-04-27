// pages/achievement/achievement.js
const words = require('../../utils/words.js');

Page({
  data: {
    achievements: [],
    unlockedCount: 0,
    totalCount: 0,
    isLoading: true
  },
  
  onShow() {
    this.loadAchievements();
  },
  
  loadAchievements() {
    this.setData({ isLoading: true });
    try {
      const achievements = words.getAchievements();
      const unlockedCount = achievements.filter(a => a.unlocked).length;
      
      this.setData({
        achievements,
        unlockedCount,
        totalCount: achievements.length,
        isLoading: false
      });
    } catch (e) {
      this.setData({ isLoading: false });
    }
  },
  
  // 刷新成就
  refreshAchievements() {
    this.loadAchievements();
    wx.showToast({ title: '已刷新', icon: 'none' });
  },
  
  // 分享成就
  onShareAppMessage() {
    return {
      title: `我在词途已解锁${this.data.unlockedCount}个成就！`,
      path: '/pages/achievement/achievement'
    };
  }
});
