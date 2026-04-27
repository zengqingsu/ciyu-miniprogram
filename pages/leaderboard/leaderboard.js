// pages/leaderboard/leaderboard.js
const app = getApp();

Page({
  data: {
    currentTab: 'total',
    list: [],
    myRank: null,
    loading: true
  },

  onLoad() {
    this.fetchLeaderboard();
  },

  onShow() {
    // 每次进入页面更新自己的排名
    this.updateMyRank();
  },

  switchTab(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ currentTab: type, loading: true });
    this.fetchLeaderboard();
  },

  async fetchLeaderboard() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'getLeaderboard',
        data: { type: this.data.currentTab }
      });
      
      if (result.result.success) {
        this.setData({
          list: result.result.list,
          loading: false
        });
      }
    } catch (err) {
      console.error('获取排行榜失败:', err);
    } finally {
      wx.hideLoading();
    }
  },

  async updateMyRank() {
    const userData = wx.getStorageSync('userData') || {};
    if (!userData.openId) return;
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'getLeaderboard',
        data: { type: this.data.currentTab }
      });
      
      if (result.result.success) {
        const list = result.result.list;
        const myRank = list.findIndex(u => u.openId === userData.openId) + 1;
        
        if (myRank > 0) {
          this.setData({ 
            myRank: {
              rank: myRank,
              ...list[myRank - 1]
            }
          });
        }
      }
    } catch (err) {
      console.error('获取排名失败:', err);
    }
  },

  onShareAppMessage() {
    return {
      title: '词途排行榜 - 来挑战吧！',
      path: '/pages/leaderboard/leaderboard'
    };
  }
});