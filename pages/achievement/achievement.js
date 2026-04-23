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
  }
});
