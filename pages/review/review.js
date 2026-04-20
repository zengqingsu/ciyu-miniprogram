// pages/review/review.js
const words = require('../../utils/words.js');

Page({
  data: {
    unknownWords: [],
    reviewedCount: 0,
    masteredCount: 0,
    reviewList: []
  },
  
  onShow() {
    this.loadReviewData();
  },
  
  loadReviewData() {
    const records = words.getRecords();
    const allWords = words.getWords();
    
    // 获取答错的单词
    const unknownIds = records.unknown || [];
    const unknownWords = unknownIds.map(id => {
      return allWords.find(w => w.id === id);
    }).filter(w => w).map(w => ({...w, showAnswer: false}));
    
    // 获取已复习记录
    const reviewList = wx.getStorageSync('reviewList') || [];
    
    this.setData({
      unknownWords,
      reviewedCount: reviewList.length,
      masteredCount: reviewList.filter(r => r.mastered).length
    });
  },
  
  toggleAnswer(e) {
    const index = e.currentTarget.dataset.index;
    const unknownWords = this.data.unknownWords;
    unknownWords[index].showAnswer = !unknownWords[index].showAnswer;
    this.setData({ unknownWords });
  },
  
  markAgain(e) {
    const index = e.currentTarget.dataset.index;
    const word = this.data.unknownWords[index];
    
    // 记录复习
    const reviewList = wx.getStorageSync('reviewList') || [];
    reviewList.push({
      wordId: word.id,
      time: Date.now(),
      mastered: false
    });
    wx.setStorageSync('reviewList', reviewList);
    
    // 移除当前单词
    const unknownWords = this.data.unknownWords.filter((_, i) => i !== index);
    this.setData({
      unknownWords,
      reviewedCount: this.data.reviewedCount + 1
    });
    
    wx.showToast({
      title: '加油！',
      icon: 'none'
    });
  },
  
  markGot(e) {
    const index = e.currentTarget.dataset.index;
    const word = this.data.unknownWords[index];
    
    // 记录复习
    const reviewList = wx.getStorageSync('reviewList') || [];
    reviewList.push({
      wordId: word.id,
      time: Date.now(),
      mastered: true
    });
    wx.setStorageSync('reviewList', reviewList);
    
    // 标记为认识
    words.markKnown(word.id);
    
    // 移除当前单词
    const unknownWords = this.data.unknownWords.filter((_, i) => i !== index);
    this.setData({
      unknownWords,
      reviewedCount: this.data.reviewedCount + 1,
      masteredCount: this.data.masteredCount + 1
    });
    
    wx.showToast({
      title: '记住了！🎉',
      icon: 'success'
    });
  },
  
  reviewAll() {
    // 将所有单词设为显示答案
    const unknownWords = this.data.unknownWords.map(w => ({...w, showAnswer: true}));
    this.setData({ unknownWords });
  },
  
  resetReview() {
    wx.removeStorageSync('reviewList');
    this.loadReviewData();
  }
});
