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
    sessionTime: 0
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
    
    // 动画效果后加载下一个
    setTimeout(() => {
      this.loadNextWord();
      this.loadStats();
    }, 300);
  },
  
  markForget() {
    if (this.data.isAnimating) return;
    
    this.setData({ isAnimating: true });
    words.markUnknown(this.data.word.id);
    
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
  }
});
