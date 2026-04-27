// pages/profile/profile.js
const words = require('../../utils/words.js');

Page({
  data: {
    stats: {},
    records: {},
    isLoading: true
  },
  
  // 导航提示
  showNavigateToast(title) {
    wx.showToast({
      title,
      icon: 'none',
      duration: 800
    });
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
      
      // 云同步状态
      const lastSync = wx.getStorageSync('lastSyncTime') || null;
      const syncStatus = lastSync ? `上次同步: ${new Date(lastSync).toLocaleString()}` : '未同步';
      
      this.setData({ 
        stats, 
        records,
        todayCount,
        timeText,
        syncStatus,
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
    this.showNavigateToast('⚙️ 设置');
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },
  
  // 跳转到提醒设置
  goToRemind() {
    this.showNavigateToast('🔔 提醒设置');
    wx.navigateTo({
      url: '/pages/remind/remind'
    });
  },
  
  // 跳转到生词本
  goToNotebook() {
    this.showNavigateToast('⭐ 生词本');
    wx.navigateTo({
      url: '/pages/notebook/notebook'
    });
  },
  
  // 跳转到测试
  goToQuiz() {
    this.showNavigateToast('📝 能力测试');
    wx.navigateTo({
      url: '/pages/quiz/quiz'
    });
  },
  
  // 跳转到成就
  goToAchievement() {
    this.showNavigateToast('🏆 成就徽章');
    wx.navigateTo({
      url: '/pages/achievement/achievement'
    });
  },
  
  // 跳转到搜索
  goToSearch() {
    this.showNavigateToast('🔍 单词搜索');
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },
  
  // 跳转到每日任务
  goToDaily() {
    this.showNavigateToast('📅 每日任务');
    wx.navigateTo({
      url: '/pages/daily/daily'
    });
  },
  
  // 跳转到学习计划
  goToPlan() {
    this.showNavigateToast('📋 学习计划');
    wx.navigateTo({
      url: '/pages/plan/plan'
    });
  },
  
  // 跳转到错题复习
  goToReview() {
    this.showNavigateToast('📖 错题复习');
    wx.navigateTo({
      url: '/pages/review/review'
    });
  },
  
  // 跳转到听力练习
  goToListen() {
    this.showNavigateToast('👂 听力练习');
    wx.navigateTo({
      url: '/pages/listen/listen'
    });
  },
  
  // 跳转到排行榜
  goToLeaderboard() {
    this.showNavigateToast('📊 排行榜');
    wx.navigateTo({
      url: '/pages/leaderboard/leaderboard'
    });
  },
  
  // 跳转到好友PK
  goToPK() {
    this.showNavigateToast('⚔️ 好友PK');
    wx.navigateTo({
      url: '/pages/pk/pk'
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
