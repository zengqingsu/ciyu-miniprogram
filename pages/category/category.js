// pages/category/category.js
const words = require('../../utils/words.js');

Page({
  data: {
    categories: [],
    selectedLevel: 0, // 0: 全部, 1: 简单, 2: 中等, 3: 困难
    levelStats: {}
  },
  
  onLoad() {
    this.loadCategories();
  },
  
  onShow() {
    this.loadCategories();
  },
  
  loadCategories() {
    const allWords = words.getWords();
    const categories = [...new Set(allWords.map(w => w.category))];
    const level = this.data.selectedLevel;
    
    // 统计各难度单词数
    const levelStats = {
      1: allWords.filter(w => w.level === 1).length,
      2: allWords.filter(w => w.level === 2).length,
      3: allWords.filter(w => w.level === 3).length
    };
    
    const categoryData = categories.map(cat => {
      let categoryWords = allWords.filter(w => w.category === cat);
      if (level > 0) {
        categoryWords = categoryWords.filter(w => w.level === level);
      }
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
    }).filter(c => c.count > 0);
    
    this.setData({ 
      categories: categoryData,
      levelStats
    });
  },
  
  // 切换难度筛选
  onLevelChange(e) {
    const level = parseInt(e.currentTarget.dataset.level);
    this.setData({ selectedLevel: level });
    this.loadCategories();
  },
  
  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    wx.setStorageSync('selectedCategory', category.name);
    wx.setStorageSync('selectedLevel', this.data.selectedLevel);
    wx.navigateTo({
      url: '/pages/learn/learn?mode=category'
    });
  }
});
