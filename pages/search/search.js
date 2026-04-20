// pages/search/search.js
const words = require('../../utils/words.js');

Page({
  data: {
    keyword: '',
    results: [],
    searched: false
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
    
    const allWords = words.getWords();
    const results = allWords.filter(w => 
      w.word.toLowerCase().includes(keyword) || 
      w.meaning.includes(keyword) ||
      w.category.includes(keyword)
    );
    
    this.setData({ results, searched: true });
  },
  
  onLoad() {
    // 可以预加载一些常用词
  }
});
