// pages/settings/settings.js
const api = require('../../utils/api.js');
const words = require('../../utils/words.js');

Page({
  data: {
    apiBase: '',
    testing: false,
    testResult: '',
    syncing: false,
    localCount: 0,
    onlineCount: 0
  },
  
  onLoad() {
    // 读取保存的API地址
    const apiBase = wx.getStorageSync('apiBase') || '';
    this.setData({ 
      apiBase,
      localCount: words.getWords().length
    });
    api.setApiBase(apiBase);
  },
  
  onApiInput(e) {
    this.setData({ apiBase: e.detail.value });
  },
  
  async testApi() {
    if (!this.data.apiBase) {
      this.setData({ testResult: '请先输入API地址' });
      return;
    }
    
    this.setData({ testing: true, testResult: '' });
    api.setApiBase(this.data.apiBase);
    
    try {
      const data = await api.getDailyWords(1);
      this.setData({ 
        testResult: '✅ 连接成功！',
        onlineCount: data.words?.length || 0
      });
    } catch (err) {
      this.setData({ 
        testResult: '❌ 连接失败: ' + (err.errMsg || '网络错误')
      });
    } finally {
      this.setData({ testing: false });
    }
  },
  
  async syncWords() {
    this.setData({ syncing: true });
    
    try {
      const data = await api.getDailyWords(50);
      if (data.words && data.words.length > 0) {
        // 保存到本地存储
        wx.setStorageSync('onlineWords', data.words);
        this.setData({ 
          onlineCount: data.words.length,
          testResult: `✅ 同步成功！获取 ${data.words.length} 个单词`
        });
      }
    } catch (err) {
      this.setData({ 
        testResult: '❌ 同步失败: ' + (err.errMsg || '网络错误')
      });
    } finally {
      this.setData({ syncing: false });
    }
  },
  
  saveSettings() {
    wx.setStorageSync('apiBase', this.data.apiBase);
    api.setApiBase(this.data.apiBase);
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
    
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
});
