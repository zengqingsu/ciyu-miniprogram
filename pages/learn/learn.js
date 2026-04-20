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
    isAnimating: false
  },
  
  onLoad() {
    this.loadStats();
    this.loadNextWord();
  },
  
  onShow() {
    this.loadStats();
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
  }
});
