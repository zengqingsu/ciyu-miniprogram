// pages/search/search.js
const words = require('../../utils/words.js');

Page({
  data: {
    keyword: '',
    results: [],
    searched: false,
    isLoading: false,
    hotWords: ['apple', 'book', 'study', 'work', 'love', 'happy', 'time', 'food'],
    history: []
  },
  
  onLoad() {
    // 加载搜索历史
    const history = wx.getStorageSync('searchHistory') || [];
    this.setData({ history });
  },
  
  onInput(e) {
    this.setData({ keyword: e.detail.value });
  },
  
  onSearch() {
    const keyword = this.data.keyword.trim().toLowerCase();
    if (!keyword) {
      this.setData({ results: [], searched: false });
      return;
    }
    
    this.setData({ isLoading: true, searched: true });
    
    // 保存到搜索历史
    const history = this.data.history;
    if (!history.includes(keyword)) {
      history.unshift(keyword);
      if (history.length > 10) history.pop();
      wx.setStorageSync('searchHistory', history);
      this.setData({ history });
    }
    
    // 模拟网络延迟优化体验
    setTimeout(() => {
      const allWords = words.getWords();
      const results = allWords.filter(w => 
        w.word.toLowerCase().includes(keyword) || 
        w.meaning.includes(keyword) ||
        w.category.includes(keyword)
      );
      
      this.setData({ results, isLoading: false });
    }, 300);
  },
  
  // 点击热门搜索词
  onHotWordTap(e) {
    const word = e.currentTarget.dataset.word;
    this.setData({ keyword: word });
    this.onSearch();
  },
  
  // 清除搜索历史
  clearHistory() {
    wx.removeStorageSync('searchHistory');
    this.setData({ history: [] });
    wx.showToast({ title: '已清除历史', icon: 'success' });
  },
  
  // 学习单词
  studyWord(e) {
    const word = e.currentTarget.dataset.word;
    wx.setStorageSync('currentWord', word);
    wx.switchTab({
      url: '/pages/learn/learn'
    });
  },
  
  // 添加到生词本
  addToNotebook(e) {
    const word = e.currentTarget.dataset.word;
    const result = words.addToNotebook(word);
    if (result) {
      wx.showToast({ title: '已收藏 ⭐', icon: 'success' });
    } else {
      wx.showToast({ title: '已在生词本', icon: 'none' });
    }
  }
});
