// pages/remind/remind.js
Page({
  data: {
    enabled: false,
    time: '09:00',
    frequency: 'daily',
    frequencies: [
      { value: 'daily', label: '每天' },
      { value: 'weekday', label: '工作日' },
      { value: 'weekend', label: '周末' }
    ],
    previewText: '📚 词途提醒：今日单词已准备好，快来学习吧！'
  },
  
  onLoad() {
    this.loadSettings();
  },
  
  loadSettings() {
    const remindSettings = wx.getStorageSync('remindSettings') || {};
    this.setData({
      enabled: remindSettings.enabled || false,
      time: remindSettings.time || '09:00',
      frequency: remindSettings.frequency || 'daily'
    });
  },
  
  onSwitchChange(e) {
    this.setData({ enabled: e.detail.value });
  },
  
  onTimeChange(e) {
    this.setData({ time: e.detail.value });
  },
  
  onFrequencyChange(e) {
    this.setData({ frequency: e.detail.value });
  },
  
  saveSettings() {
    const { enabled, time, frequency } = this.data;
    
    // 保存设置
    wx.setStorageSync('remindSettings', { enabled, time, frequency });
    
    if (enabled) {
      // 设置订阅消息（需要用户授权）
      this.requestSubscribeMessage();
    } else {
      // 取消订阅
      this.cancelSubscribe();
    }
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
    
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },
  
  // 请求订阅消息权限
  requestSubscribeMessage() {
    wx.requestSubscribeMessage({
      tmplIds: ['YOUR_TEMPLATE_ID'], // 需要在微信公众平台配置
      success: (res) => {
        console.log('订阅成功', res);
      },
      fail: (err) => {
        console.log('订阅失败', err);
        // 即使失败也提示保存成功
      }
    });
  },
  
  // 取消订阅
  cancelSubscribe() {
    // 取消逻辑
    console.log('已关闭提醒');
  },
  
  // 测试推送（模拟）
  testPush() {
    wx.showToast({
      title: '模拟推送已发送',
      icon: 'none'
    });
  }
});
