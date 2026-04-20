// pages/notebook/notebook.js
const words = require('../../utils/words.js');

Page({
  data: {
    notebook: []
  },
  
  onShow() {
    this.loadData();
  },
  
  loadData() {
    const notebook = words.getNotebook();
    this.setData({ notebook });
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
          words.removeFromNotebook(wordId);
          that.loadData();
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
        }
      }
    });
  }
});
