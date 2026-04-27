// pages/learn/learn.js
const words = require('../../utils/words.js');

Page({
  data: {
    word: {},
    showMeaning: false,
    currentIndex: 0,
    learnedCount: 0,
    stats: {},
    progress: 0,
    isAnimating: false,
    startTime: null,
    sessionTime: 0,
    history: [],
    // 发音设置
    speechRate: 1.0, // 0.5-2.0
    speechPitch: 1.0,
    pronunciationUrl: ''
  },
  
  onLoad() {
    this.loadStats();
    this.loadNextWord();
    this.startTimer();
    this.loadAudioSettings();
    this.resumeSession();
  },
  
  // 恢复上次学习进度
  resumeSession() {
    const progress = wx.getStorageSync('learnProgress');
    if (progress && progress.learnedCount > 0) {
      // 显示欢迎回来提示
      wx.showModal({
        title: '继续学习',
        content: `上次学习了 ${progress.learnedCount} 个单词，是否继续？`,
        confirmText: '继续',
        cancelText: '重新开始',
        success: (res) => {
          if (!res.confirm) {
            // 重新开始，清除进度
            wx.removeStorageSync('learnProgress');
          }
        }
      });
    }
  },
  
  onShow() {
    this.loadStats();
    this.startTimer();
  },
  
  onHide() {
    this.pauseTimer();
  },
  
  onUnload() {
    this.pauseTimer();
    // 保存学习进度
    this.saveProgress();
  },
  
  // 保存学习进度
  saveProgress() {
    const progress = {
      learnedCount: this.data.learnedCount,
      historyLength: this.data.history.length,
      sessionTime: this.data.sessionTime,
      lastWord: this.data.word
    };
    wx.setStorageSync('learnProgress', progress);
  },
  
  startTimer() {
    if (!this.data.startTime) {
      this.setData({ startTime: Date.now() });
    }
    // 启动计时器
    this.timerInterval = setInterval(() => {
      const duration = Date.now() - this.data.startTime;
      const minutes = Math.floor(duration / 60000);
      this.setData({ sessionTime: minutes });
    }, 60000); // 每分钟更新一次
  },
  
  pauseTimer() {
    if (this.data.startTime) {
      const duration = Date.now() - this.data.startTime;
      const totalTime = wx.getStorageSync('totalLearnTime') || 0;
      wx.setStorageSync('totalLearnTime', totalTime + duration);
      this.setData({ startTime: null });
    }
    // 清除计时器
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },
  
  loadStats() {
    const stats = words.getStats();
    this.setData({ stats });
  },
  
  loadNextWord() {
    // 检查是否有预加载的单词
    const currentWord = wx.getStorageSync('currentWord');
    if (currentWord && !this.data.isAnimating) {
      wx.removeStorageSync('currentWord');
      this.setData({ 
        word: currentWord, 
        showMeaning: false,
        isAnimating: false
      });
      return;
    }
    const word = words.getRandomWord();
    this.setData({ 
      word, 
      showMeaning: false,
      isAnimating: false
    });
  },
  
  showAnswer() {
    this.setData({ showMeaning: true });
  },
  
  markKnow() {
    if (this.data.isAnimating) return;
    
    this.setData({ isAnimating: true });
    words.markKnown(this.data.word.id);
    
    // 震动反馈
    if (wx.vibrateShort) {
      wx.vibrateShort();
    }
    
    // 记录学习历史
    const history = [...this.data.history, { ...this.data.word, known: true }];
    this.setData({ history });
    
    // 更新今日学习计数
    const todayKey = 'todayLearnCount';
    const today = new Date().toDateString();
    const lastDate = wx.getStorageSync('lastLearnDate');
    let count = wx.getStorageSync(todayKey) || 0;
    if (lastDate !== today) {
      count = 0;
    }
    count += 1;
    wx.setStorageSync(todayKey, count);
    wx.setStorageSync('lastLearnDate', today);
    
    this.setData({
      learnedCount: this.data.learnedCount + 1,
      progress: Math.min(100, this.data.progress + 5)
    });
    
    // 更新连续学习天数
    this.updateStreak();
    
    // 动画效果后加载下一个
    setTimeout(() => {
      this.loadNextWord();
      this.loadStats();
    }, 300);
  },
  
  // 更新连续学习天数
  updateStreak() {
    const today = new Date().toDateString();
    const yesterday = this.getYesterday();
    const lastStreakDate = wx.getStorageSync('streakDate');
    const currentStreak = wx.getStorageSync('streak') || 0;
    
    if (lastStreakDate === yesterday) {
      // 昨天学习了，今天继续则连续
      wx.setStorageSync('streak', currentStreak + 1);
    } else if (lastStreakDate !== today) {
      // 不是昨天也不是今天，重置
      wx.setStorageSync('streak', 1);
    }
    wx.setStorageSync('streakDate', today);
  },
  
  // 获取昨天日期
  getYesterday() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toDateString();
  },
  
  markForget() {
    if (this.data.isAnimating) return;
    
    this.setData({ isAnimating: true });
    words.markUnknown(this.data.word.id);
    
    // 震动反馈（不认识时震动不同模式）
    if (wx.vibrateShort) {
      wx.vibrateShort({ type: 'heavy' });
    }
    
    // 记录学习历史
    const history = [...this.data.history, { ...this.data.word, known: false }];
    this.setData({ history });
    
    // 更新今日学习计数
    const todayKey = 'todayLearnCount';
    const today = new Date().toDateString();
    const lastDate = wx.getStorageSync('lastLearnDate');
    let count = wx.getStorageSync(todayKey) || 0;
    if (lastDate !== today) {
      count = 0;
    }
    count += 1;
    wx.setStorageSync(todayKey, count);
    wx.setStorageSync('lastLearnDate', today);
    
    this.setData({
      learnedCount: this.data.learnedCount + 1,
      progress: Math.max(0, this.data.progress - 2)
    });
    
    // 动画效果后加载下一个
    setTimeout(() => {
      this.loadNextWord();
      this.loadStats();
    }, 300);
  },
  
  // 切换到下一个单词（不记录）
  skipWord() {
    this.loadNextWord();
  },
  
  // 加入生词本
  addToNotebook() {
    const word = this.data.word;
    const added = words.addToNotebook(word);
    if (added) {
      // 收藏成功震动
      if (wx.vibrateShort) {
        wx.vibrateShort();
      }
      wx.showToast({
        title: '已加入生词本 ⭐',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '已在生词本中',
        icon: 'none'
      });
    }
  },
  
  // 加载发音设置
  loadAudioSettings() {
    const audioSettings = wx.getStorageSync('audioSettings') || {};
    this.setData({
      speechRate: audioSettings.rate || 1.0,
      speechPitch: audioSettings.pitch || 1.0
    });
  },
  
  // 切换发音速度
  changeSpeed(e) {
    const rate = parseFloat(e.currentTarget.dataset.rate);
    this.setData({ speechRate: rate });
    wx.setStorageSync('audioSettings', {
      ...wx.getStorageSync('audioSettings'),
      rate: rate
    });
    // 测试新速度
    this.playAudio();
  },
  
  // 播放发音
  playAudio() {
    const word = this.data.word;
    const that = this;
    
    try {
      const plugin = requirePlugin('WechatSI');
      if (plugin && plugin.textToSpeech) {
        plugin.textToSpeech({
          content: word.word,
          success: (res) => {
            console.log('播放成功', res);
          },
          fail: (err) => {
            that.fallbackPlayAudio(word.word);
          }
        });
      } else {
        that.fallbackPlayAudio(word.word);
      }
    } catch (e) {
      that.fallbackPlayAudio(word.word);
    }
  },
  
  // 备用发音（显示文字）
  fallbackPlayAudio(wordText) {
    // 如果没有插件，显示文字发音
    wx.showToast({
      title: `🔊 ${wordText}`,
      icon: 'none',
      duration: 1500
    });
  },
  
  // 长按复制单词
  copyWord() {
    wx.setClipboardData({
      data: this.data.word.word,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        });
      }
    });
  },
  
  // 上一词
  prevWord() {
    const history = this.data.history;
    if (history.length > 0) {
      const prevWord = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      this.setData({
        word: prevWord,
        history: newHistory,
        showMeaning: false,
        learnedCount: Math.max(0, this.data.learnedCount - 1)
      });
    }
  },
  
  // 分享学习成就
  shareAchievement() {
    const stats = words.getStats();
    const streak = wx.getStorageSync('streak') || 0;
    
    wx.showModal({
      title: '📤 分享成就',
      content: `今日学习: ${this.data.learnedCount} 词\n连续学习: ${streak} 天\n掌握单词: ${stats.known || 0} 个\n\n快来和我一起学习吧！`,
      confirmText: '分享',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 触发分享
          this.onShareAppMessage();
        }
      }
    });
  },
  
  // 分享给朋友
  onShareAppMessage() {
    const streak = wx.getStorageSync('streak') || 0;
    return {
      title: `我在词途连续学习${streak}天啦！`,
      path: '/pages/index/index'
    };
  }
});
