// pages/achievement/achievement.js
const words = require('../../utils/words.js');

Page({
  data: {
    achievements: [],
    unlockedCount: 0,
    totalCount: 0
  },
  
  onShow() {
    this.loadAchievements();
  },
  
  loadAchievements() {
    const achievements = words.getAchievements();
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    
    this.setData({
      achievements,
      unlockedCount,
      totalCount: achievements.length
    });
  }
});
