// pages/pk/pk.js
const app = getApp();

Page({
  data: {
    mode: 'create', // create, waiting, battling, result
    pkId: '',
    playerA: null,
    playerB: null,
    winner: null,
    myTotal: 0,
    myStreak: 0
  },

  onLoad(options) {
    const userData = wx.getStorageSync('userData') || {};
    this.setData({
      playerA: userData,
      myTotal: userData.total || 0,
      myStreak: userData.streak || 0
    });
    
    // 如果有 pkId 参数，说明是被邀请加入PK
    if (options.pkId) {
      this.joinPK(options.pkId);
    }
  },

  async createPK() {
    wx.showLoading({ title: '创建中...' });
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'createPK',
        data: {
          playerA: this.data.playerA,
          total: this.data.myTotal,
          streak: this.data.myStreak
        }
      });
      
      if (result.result.success) {
        this.setData({
          mode: 'waiting',
          pkId: result.result.pkId
        });
        
        // 生成邀请链接
        const inviteUrl = `pages/pk/pk?pkId=${result.result.pkId}`;
        wx.setStorageSync('pkInviteUrl', inviteUrl);
      }
    } catch (err) {
      wx.showToast({ title: '创建失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  async joinPK(pkId) {
    wx.showLoading({ title: '加入中...' });
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'joinPK',
        data: {
          pkId,
          playerB: this.data.playerA,
          total: this.data.myTotal,
          streak: this.data.myStreak
        }
      });
      
      if (result.result.success) {
        this.setData({
          mode: 'battling',
          pkId,
          winner: result.result.winner
        });
      } else {
        wx.showToast({ title: result.result.error, icon: 'none' });
      }
    } catch (err) {
      wx.showToast({ title: '加入失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  onShareAppMessage() {
    const url = wx.getStorageSync('pkInviteUrl') || `pages/pk/pk?pkId=${this.data.pkId}`;
    return {
      title: '词途PK挑战 - 来对战吧！',
      path: url
    };
  }
});