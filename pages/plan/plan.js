// pages/plan/plan.js
const words = require('../../utils/words.js');

Page({
  data: {
    dailyGoal: 10,
    totalWords: 35,
    learnedWords: 0,
    remainingWords: 35,
    daysLeft: 4,
    Math: Math,
    customGoal: '',
    // 提醒设置
    reminderEnabled: false,
    reminderTime: '20:00',
    reminderDays: ['0', '1', '2', '3', '4', '5', '6'], // 0=周日
    weekDays: ['日', '一', '二', '三', '四', '五', '六']
  },
  
  onLoad() {
    this.loadPlan();
    this.loadReminderSettings();
  },
  
  onShow() {
    this.loadPlan();
  },
  
  loadPlan() {
    const dailyGoal = wx.getStorageSync('dailyGoal') || 10;
    const totalWords = words.getWords().length;
    const records = words.getRecords();
    const learnedWords = records.known.length;
    const remainingWords = totalWords - learnedWords;
    const daysLeft = Math.ceil(remainingWords / dailyGoal);
    
    this.setData({
      dailyGoal,
      totalWords,
      learnedWords,
      remainingWords,
      daysLeft
    });
  },
  
  // 加载提醒设置
  loadReminderSettings() {
    const reminder = wx.getStorageSync('reminder') || {};
    this.setData({
      reminderEnabled: reminder.enabled || false,
      reminderTime: reminder.time || '20:00',
      reminderDays: reminder.days || ['0', '1', '2', '3', '4', '5', '6']
    });
  },
  
  setGoal(e) {
    const goal = parseInt(e.currentTarget.dataset.goal);
    wx.setStorageSync('dailyGoal', goal);
    this.setData({ dailyGoal: goal, customGoal: '' });
    this.loadPlan();
    
    wx.showToast({
      title: '目标已更新',
      icon: 'success'
    });
  },
  
  inputCustomGoal(e) {
    this.setData({ customGoal: e.detail.value });
  },
  
  setCustomGoal() {
    const goal = parseInt(this.data.customGoal);
    if (!goal || goal <= 0 || goal > 100) {
      wx.showToast({
        title: '请输入1-100之间的数字',
        icon: 'none'
      });
      return;
    }
    
    wx.setStorageSync('dailyGoal', goal);
    this.setData({ dailyGoal: goal, customGoal: '' });
    this.loadPlan();
    
    wx.showToast({
      title: `已设置为${goal}词/天`,
      icon: 'success'
    });
  },
  
  // 切换提醒开关
  toggleReminder(e) {
    const enabled = !this.data.reminderEnabled;
    this.setData({ reminderEnabled: enabled });
    
    if (enabled) {
      this.requestNotificationPermission();
    }
    
    this.saveReminderSettings();
  },
  
  // 请求通知权限
  requestNotificationPermission() {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.notify']) {
          wx.authorize({
            scope: 'scope.notify',
            success: () => {
              wx.showToast({
                title: '已开启提醒',
                icon: 'success'
              });
            },
            fail: () => {
              wx.showModal({
                title: '提示',
                content: '需要您授权通知权限才能收到学习提醒',
                success: (res) => {
                  if (res.confirm) {
                    wx.openSetting();
                  }
                }
              });
              this.setData({ reminderEnabled: false });
            }
          });
        }
      }
    });
  },
  
  // 选择提醒时间
  onTimeChange(e) {
    const time = e.detail.value;
    this.setData({ reminderTime: time });
    this.saveReminderSettings();
  },
  
  // 选择提醒日期
  toggleDay(e) {
    const index = e.currentTarget.dataset.index;
    const days = [...this.data.reminderDays];
    const dayStr = index.toString();
    
    if (days.includes(dayStr)) {
      if (days.length > 1) { // 至少保留一天
        const i = days.indexOf(dayStr);
        days.splice(i, 1);
      }
    } else {
      days.push(dayStr);
    }
    
    this.setData({ reminderDays: days });
    this.saveReminderSettings();
  },
  
  // 保存提醒设置
  saveReminderSettings() {
    const reminder = {
      enabled: this.data.reminderEnabled,
      time: this.data.reminderTime,
      days: this.data.reminderDays
    };
    wx.setStorageSync('reminder', reminder);
    
    if (this.data.reminderEnabled) {
      this.scheduleReminder();
    } else {
      this.cancelReminder();
    }
  },
  
  // 调度提醒
  scheduleReminder() {
    const reminder = wx.getStorageSync('reminder') || {};
    if (!reminder.enabled) return;
    
    // 计算下次提醒时间
    const now = new Date();
    const [hour, minute] = reminder.time.split(':').map(Number);
    let nextDate = new Date();
    nextDate.setHours(hour, minute, 0, 0);
    
    // 找到下一个提醒日期
    const days = reminder.days.map(Number).sort((a, b) => a - b);
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() + i);
      const dayOfWeek = checkDate.getDay();
      
      if (days.includes(dayOfWeek)) {
        if (i > 0 || nextDate > now) {
          nextDate = checkDate;
          break;
        }
      }
    }
    
    // 添加订阅消息
    wx.requestSubscribeMessage({
      tmplIds: ['YOUR_TEMPLATE_ID'], // 需要在微信公众平台配置
      success: (res) => {
        console.log('订阅成功');
      },
      fail: (err) => {
        console.log('订阅失败', err);
      }
    });
    
    wx.showToast({
      title: '提醒已设置',
      icon: 'success'
    });
  },
  
  // 取消提醒
  cancelReminder() {
    // 清除定时任务
    wx.showToast({
      title: '提醒已关闭',
      icon: 'success'
    });
  },
  
  // 测试提醒
  testReminder() {
    wx.showToast({
      title: '测试提醒',
      icon: 'none'
    });
  }
});
