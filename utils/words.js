// utils/words.js - 单词数据

// 基础词库
const localWords = [
  { id: 1, word: 'apple', pronunciation: 'ˈæpl', meaning: 'n. 苹果', example: 'I ate an apple for breakfast.', level: 1, category: '食物' },
  { id: 2, word: 'banana', pronunciation: 'bəˈnɑːnə', meaning: 'n. 香蕉', example: 'She peeled a banana.', level: 1, category: '食物' },
  { id: 3, word: 'orange', pronunciation: 'ˈɒrɪndʒ', meaning: 'n. 橙子', example: 'I drank orange juice.', level: 1, category: '食物' },
  { id: 4, word: 'computer', pronunciation: 'kəmˈpjuːtər', meaning: 'n. 计算机', example: 'I use a computer for work.', level: 1, category: '科技' },
  { id: 5, word: 'book', pronunciation: 'bʊk', meaning: 'n. 书', example: 'I read a book every night.', level: 1, category: '学习' },
  { id: 6, word: 'hello', pronunciation: 'həˈləʊ', meaning: 'int. 你好', example: 'Hello, how are you?', level: 1, category: '日常' },
  { id: 7, word: 'world', pronunciation: 'wɜːld', meaning: 'n. 世界', example: 'Travel around the world.', level: 1, category: '日常' },
  { id: 8, word: 'friend', pronunciation: 'frend', meaning: 'n. 朋友', example: 'She is my best friend.', level: 1, category: '人际' },
  { id: 9, word: 'family', pronunciation: 'ˈfæməli', meaning: 'n. 家庭', example: 'My family lives in Beijing.', level: 1, category: '人际' },
  { id: 10, word: 'happy', pronunciation: 'ˈhæpi', meaning: 'adj. 快乐的', example: 'I am very happy today.', level: 1, category: '情感' },
  { id: 11, word: 'love', pronunciation: 'lʌv', meaning: 'v. 爱', example: 'I love my family.', level: 1, category: '情感' },
  { id: 12, word: 'time', pronunciation: 'taɪm', meaning: 'n. 时间', example: 'Time is money.', level: 1, category: '日常' },
  { id: 13, word: 'water', pronunciation: 'ˈwɔːtər', meaning: 'n. 水', example: 'I drink water every day.', level: 1, category: '食物' },
  { id: 14, word: 'food', pronunciation: 'fuːd', meaning: 'n. 食物', example: 'I like Chinese food.', level: 1, category: '食物' },
  { id: 15, word: 'house', pronunciation: 'haʊs', meaning: 'n. 房子', example: 'This is my house.', level: 1, category: '生活' },
  { id: 16, word: 'school', pronunciation: 'skuːl', meaning: 'n. 学校', example: 'I go to school every day.', level: 1, category: '学习' },
  { id: 17, word: 'study', pronunciation: 'ˈstʌdi', meaning: 'v. 学习', example: 'I study English every morning.', level: 1, category: '学习' },
  { id: 18, word: 'work', pronunciation: 'wɜːrk', meaning: 'v. 工作', example: 'I work from 9 to 5.', level: 1, category: '工作' },
  { id: 19, word: 'music', pronunciation: 'ˈmjuːzɪk', meaning: 'n. 音乐', example: 'I like listening to music.', level: 1, category: '娱乐' },
  { id: 20, word: 'movie', pronunciation: 'ˈmuːvi', meaning: 'n. 电影', example: 'Let\'s watch a movie.', level: 1, category: '娱乐' },
  { id: 21, word: 'travel', pronunciation: 'ˈtrævəl', meaning: 'v. 旅行', example: 'I want to travel abroad.', level: 2, category: '生活' },
  { id: 22, word: 'college', pronunciation: 'ˈkɒlɪdʒ', meaning: 'n. 大学', example: 'I go to college in Shanghai.', level: 2, category: '学习' },
  { id: 23, word: 'business', pronunciation: 'ˈbɪznəs', meaning: 'n. 商业', example: 'He runs a business.', level: 2, category: '工作' },
  { id: 24, word: 'technology', pronunciation: 'tɛkˈnɒlədʒi', meaning: 'n. 技术', example: 'Technology changes our lives.', level: 2, category: '科技' },
  { id: 25, word: 'environment', pronunciation: 'ɪnˈvaɪrənmənt', meaning: 'n. 环境', example: 'We must protect the environment.', level: 2, category: '社会' },
  { id: 26, word: 'culture', pronunciation: 'ˈkʌltʃər', meaning: 'n. 文化', example: 'Chinese culture is amazing.', level: 2, category: '社会' },
  { id: 27, word: 'communication', pronunciation: 'kəˌmjuːnɪˈkeɪʃən', meaning: 'n. 沟通', example: 'Good communication is important.', level: 2, category: '人际' },
  { id: 28, word: 'experience', pronunciation: 'ɪkˈspɪriəns', meaning: 'n. 经验', example: 'I have 5 years of experience.', level: 2, category: '工作' },
  { id: 29, word: 'important', pronunciation: 'ɪmˈpɔːrtənt', meaning: 'adj. 重要的', example: 'Health is important.', level: 2, category: '日常' },
  { id: 30, word: 'different', pronunciation: 'ˈdɪfərənt', meaning: 'adj. 不同的', example: 'We have different opinions.', level: 2, category: '日常' },
  { id: 31, word: 'collaborate', pronunciation: 'kəˈlæbəreɪt', meaning: 'v. 合作', example: 'We need to collaborate.', level: 3, category: '工作' },
  { id: 32, word: 'professional', pronunciation: 'prəˈfɛʃənəl', meaning: 'adj. 专业的', example: 'He is a professional.', level: 3, category: '工作' },
  { id: 33, word: 'hypothesis', pronunciation: 'haɪˈpɒθəsɪs', meaning: 'n. 假设', example: 'We need to test this hypothesis.', level: 3, category: '学术' },
  { id: 34, word: 'paradigm', pronunciation: 'ˈpærədaɪm', meaning: 'n. 范式', example: 'This is a paradigm shift.', level: 3, category: '学术' },
  { id: 35, word: 'conceptualize', pronunciation: 'kənˈsepʃʊəlaɪz', meaning: 'v. 概念化', example: 'It\'s hard to conceptualize.', level: 3, category: '学术' }
];

// 存储学习记录
let learningRecords = wx.getStorageSync('learningRecords') || {
  known: [],
  unknown: [],
  total: 0,
  streak: 0,
  lastDate: null
};

// 生词本
let notebook = wx.getStorageSync('notebook') || [];

// 成就系统
const achievements = [
  // 学习成就
  { id: 'first_learn', name: '初学者', desc: '完成第一次学习', icon: '🌟', condition: (r) => r.total >= 1 },
  { id: 'learn_10', name: '小试牛刀', desc: '学习10个单词', icon: '📚', condition: (r) => r.total >= 10 },
  { id: 'learn_50', name: '学而不厌', desc: '学习50个单词', icon: '🎓', condition: (r) => r.total >= 50 },
  { id: 'learn_100', name: '学霸', desc: '学习100个单词', icon: '🏆', condition: (r) => r.total >= 100 },
  { id: 'learn_200', name: '词汇大师', desc: '学习200个单词', icon: '🎯', condition: (r) => r.total >= 200 },
  // 连续学习成就
  { id: 'streak_3', name: '坚持不懈', desc: '连续学习3天', icon: '🔥', condition: (r) => r.streak >= 3 },
  { id: 'streak_7', name: '一周达人', desc: '连续学习7天', icon: '💪', condition: (r) => r.streak >= 7 },
  { id: 'streak_14', name: '两周坚持', desc: '连续学习14天', icon: '🌈', condition: (r) => r.streak >= 14 },
  { id: 'streak_30', name: '习惯养成', desc: '连续学习30天', icon: '👑', condition: (r) => r.streak >= 30 },
  // 生词本成就
  { id: 'notebook_5', name: '收藏家', desc: '收藏5个生词', icon: '⭐', condition: (r) => notebook.length >= 5 },
  { id: 'notebook_20', name: '词汇宝库', desc: '收藏20个生词', icon: '💎', condition: (r) => notebook.length >= 20 },
  // 掌握成就
  { id: 'master_10', name: '掌握者', desc: '掌握10个单词', icon: '✅', condition: (r) => r.known.length >= 10 },
  { id: 'master_20', name: '熟能生巧', desc: '掌握20个单词', icon: '🧠', condition: (r) => r.known.length >= 20 },
  { id: 'master_all', name: '全能王者', desc: '掌握所有单词', icon: '🌟', condition: (r) => r.known.length >= 35 }
];

// 获取单词列表
function getWordsList() {
  const onlineWords = wx.getStorageSync('onlineWords');
  if (onlineWords && onlineWords.length > 0) {
    return onlineWords;
  }
  return localWords;
}

// 艾宾浩斯复习提醒
function shouldReview(wordId) {
  const reviewRecord = wx.getStorageSync('reviewRecord') || {};
  const lastReview = reviewRecord[wordId];
  if (!lastReview) return true;
  
  const daysPassed = (Date.now() - lastReview) / (1000 * 60 * 60 * 24);
  const intervals = [1, 3, 7, 14, 30];
  
  return intervals.some(interval => Math.abs(daysPassed - interval) < 0.5);
}

module.exports = {
  getWords: () => getWordsList(),
  
  getRandomWord: () => {
    const words = getWordsList();
    return words[Math.floor(Math.random() * words.length)];
  },
  
  getWordsBatch: (count = 10) => {
    const words = getWordsList();
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },
  
  getWordsByLevel: (level) => {
    return localWords.filter(w => w.level === level);
  },
  
  getWordsByCategory: (category) => {
    return localWords.filter(w => w.category === category);
  },
  
  getCategories: () => {
    const categories = [...new Set(localWords.map(w => w.category))];
    return categories;
  },
  
  getReviewWords: () => {
    const allWords = getWordsList();
    return allWords.filter(w => shouldReview(w.id));
  },
  
  markKnown: (wordId) => {
    if (!learningRecords.known.includes(wordId)) {
      learningRecords.known.push(wordId);
      learningRecords.total++;
      learningRecords.lastDate = new Date().toDateString();
      wx.setStorageSync('learningRecords', learningRecords);
      
      const reviewRecord = wx.getStorageSync('reviewRecord') || {};
      reviewRecord[wordId] = Date.now();
      wx.setStorageSync('reviewRecord', reviewRecord);
    }
  },
  
  markUnknown: (wordId) => {
    if (!learningRecords.unknown.includes(wordId)) {
      learningRecords.unknown.push(wordId);
      learningRecords.total++;
      learningRecords.lastDate = new Date().toDateString();
      wx.setStorageSync('learningRecords', learningRecords);
    }
  },
  
  addToNotebook: (word) => {
    if (!notebook.find(w => w.id === word.id)) {
      notebook.push({...word, addedAt: Date.now()});
      wx.setStorageSync('notebook', notebook);
      return true;
    }
    return false;
  },
  
  removeFromNotebook: (wordId) => {
    notebook = notebook.filter(w => w.id !== wordId);
    wx.setStorageSync('notebook', notebook);
  },
  
  getNotebook: () => notebook,
  
  getRecords: () => learningRecords,
  
  getStats: () => {
    const reviewWords = getWordsList().filter(w => shouldReview(w.id));
    return {
      total: learningRecords.total,
      known: learningRecords.known.length,
      unknown: learningRecords.unknown.length,
      streak: learningRecords.streak,
      progress: learningRecords.total > 0 
        ? Math.round((learningRecords.known.length / learningRecords.total) * 100) 
        : 0,
      reviewCount: reviewWords.length,
      notebookCount: notebook.length
    };
  },
  
  // 获取成就
  getAchievements: () => {
    return achievements.map(achievement => ({
      ...achievement,
      unlocked: achievement.condition({ known: learningRecords.known, total: learningRecords.total, streak: learningRecords.streak })
    }));
  },
  
  // 检查并获取新成就
  checkAchievements: () => {
    const unlocked = achievements
      .filter(a => a.condition({ known: learningRecords.known, total: learningRecords.total, streak: learningRecords.streak }))
      .map(a => a.id);
    
    const oldUnlocked = wx.getStorageSync('unlockedAchievements') || [];
    const newUnlocked = unlocked.filter(id => !oldUnlocked.includes(id));
    
    if (newUnlocked.length > 0) {
      wx.setStorageSync('unlockedAchievements', unlocked);
      return newUnlocked;
    }
    return [];
  },
  
  syncOnlineWords: (words) => {
    wx.setStorageSync('onlineWords', words);
  },
  
  getLocalCount: () => localWords.length
};
