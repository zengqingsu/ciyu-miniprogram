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
    history: []
  },
  
  onLoad() {
    this.loadStats();
    this.loadNextWord();
    this.startTimer();
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
  },
  
  startTimer() {
    if (!this.data.startTime) {
      this.setData({ startTime: Date.now() });
    }
  },
  
  pauseTimer() {
    if (this.data.startTime) {
      const duration = Date.now() - this.data.startTime;
      const totalTime = wx.getStorageSync('totalLearnTime') || 0;
      wx.setStorageSync('totalLearnTime', totalTime + duration);
      this.setData({ startTime: null });
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
  
  // 播放发音
  playAudio() {
    const word = this.data.word;
    try {
      // 使用微信朗读插件或模拟
      const plugin = requirePlugin('WechatSI');
      if (plugin && plugin.textToSpeech) {
        plugin.textToSpeech({
          content: word.word,
          success: (res) => {
            console.log('播放成功', res);
          },
          fail: (err) => {
            wx.showToast({
              title: '播放失败',
              icon: 'none'
            });
          }
        });
      } else {
        wx.showToast({
          title: `🔊 ${word.word}`,
          icon: 'none',
          duration: 2000
        });
      }
    } catch (e) {
      wx.showToast({
        title: `🔊 ${word.word}`,
        icon: 'none',
        duration: 2000
      });
    }
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
  }
});
