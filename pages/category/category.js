// pages/category/category.js
const words = require('../../utils/words.js');

Page({
  data: {
    categories: []
  },
  
  onLoad() {
    this.loadCategories();
  },
  
  loadCategories() {
    const allWords = words.getWords();
    const categories = [...new Set(allWords.map(w => w.category))];
    
    const categoryData = categories.map(cat => {
      const categoryWords = allWords.filter(w => w.category === cat);
      const iconMap = {
        '食物': '🍎',
        '科技': '💻',
        '学习': '📚',
        '日常': '🏠',
        '人际': '👥',
        '情感': '❤️',
        '生活': '🌍',
        '工作': '💼',
        '娱乐': '🎮',
        '社会': '🏛️',
        '学术': '🎓'
      };
      return {
        name: cat,
        count: categoryWords.length,
        icon: iconMap[cat] || '📖'
      };
    });
    
    this.setData({ categories: categoryData });
  },
  
  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    wx.setStorageSync('selectedCategory', category.name);
    wx.navigateTo({
      url: '/pages/learn/learn?mode=category'
    });
  }
});
