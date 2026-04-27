// pages/notebook/notebook.js
const words = require('../../utils/words.js');

Page({
  data: {
    notebook: [],
    sortType: 'time', // time: 按时间, alpha: 按字母
    filterCategory: '',
    categories: [],
    stats: {}
  },
  
  onShow() {
    this.loadData();
  },
  
  loadData() {
    let notebook = words.getNotebook();
    const categories = [...new Set(notebook.map(w => w.category).filter(c => c))];
    
    // 排序
    if (this.data.sortType === 'alpha') {
      notebook = notebook.sort((a, b) => a.word.localeCompare(b.word));
    } else {
      notebook = notebook.sort((a, b) => b.addedAt - a.addedAt);
    }
    
    // 筛选
    if (this.data.filterCategory) {
      notebook = notebook.filter(w => w.category === this.data.filterCategory);
    }
    
    const stats = {
      total: words.getNotebook().length,
      categories: categories.length
    };
    
    this.setData({ notebook, categories, stats });
  },
  
  // 切换排序方式
  onSortChange(e) {
    const sortType = e.currentTarget.dataset.type;
    this.setData({ sortType });
    this.loadData();
  },
  
  // 筛选分类
  onFilterChange(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ filterCategory: category === this.data.filterCategory ? '' : category });
    this.loadData();
  },
  
  // 学习单词
  studyWord(e) {
    const word = e.currentTarget.dataset.word;
    wx.setStorageSync('currentWord', word);
    wx.navigateTo({
      url: '/pages/learn/learn?mode=single'
    });
  },
  
  // 删除单词
  deleteWord(e) {
    const wordId = e.currentTarget.dataset.id;
    const that = this;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要从生词本中删除这个单词吗？',
      success: (res) => {
        if (res.confirm) {
          // 删除震动反馈
          if (wx.vibrateShort) {
            wx.vibrateShort();
          }
          words.removeFromNotebook(wordId);
          that.loadData();
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
        }
      }
    });
  },
  
  // 导出生词本
  exportNotebook() {
    const notebook = words.getNotebook();
    if (notebook.length === 0) {
      wx.showToast({ title: '生词本为空', icon: 'none' });
      return;
    }
    
    const text = notebook.map(w => `${w.word} - ${w.meaning}`).join('\n');
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' });
      }
    });
  },
  
  // 搜索生词本
  onSearchInput(e) {
    const keyword = e.detail.value.toLowerCase();
    const allWords = words.getNotebook();
    
    if (!keyword) {
      this.setData({ notebook: allWords });
      return;
    }
    
    const filtered = allWords.filter(w => 
      w.word.toLowerCase().includes(keyword) || 
      w.meaning.toLowerCase().includes(keyword)
    );
    this.setData({ notebook: filtered });
  },
  
  // 分享生词本
  onShareAppMessage() {
    const stats = words.getNotebook();
    return {
      title: `我的词途生词本 - ${stats.length}个单词`,
      path: '/pages/notebook/notebook'
    };
  }
});
