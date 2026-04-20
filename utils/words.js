// utils/words.js - 单词数据
// 使用说明：优先从后端API获取，如失败则使用本地数据
const localWords = [
  { id: 1, word: 'apple', pronunciation: 'ˈæpl', meaning: 'n. 苹果', example: 'I ate an apple for breakfast.', level: 1 },
  { id: 2, word: 'banana', pronunciation: 'bəˈnɑːnə', meaning: 'n. 香蕉', example: 'She peeled a banana.', level: 1 },
  { id: 3, word: 'orange', pronunciation: 'ˈɒrɪndʒ', meaning: 'n. 橙子', example: 'I drank orange juice.', level: 1 },
  { id: 4, word: 'computer', pronunciation: 'kəmˈpjuːtər', meaning: 'n. 计算机', example: 'I use a computer for work.', level: 1 },
  { id: 5, word: 'book', pronunciation: 'bʊk', meaning: 'n. 书', example: 'I read a book every night.', level: 1 },
  { id: 6, word: 'hello', pronunciation: 'həˈləʊ', meaning: 'int. 你好', example: 'Hello, how are you?', level: 1 },
  { id: 7, word: 'world', pronunciation: 'wɜːld', meaning: 'n. 世界', example: 'Travel around the world.', level: 1 },
  { id: 8, word: 'friend', pronunciation: 'frend', meaning: 'n. 朋友', example: 'She is my best friend.', level: 1 },
  { id: 9, word: 'family', pronunciation: 'ˈfæməli', meaning: 'n. 家庭', example: 'My family lives in Beijing.', level: 1 },
  { id: 10, word: 'happy', pronunciation: 'ˈhæpi', meaning: 'adj. 快乐的', example: 'I am very happy today.', level: 1 },
  { id: 11, word: 'love', pronunciation: 'lʌv', meaning: 'v. 爱', example: 'I love my family.', level: 1 },
  { id: 12, word: 'time', pronunciation: 'taɪm', meaning: 'n. 时间', example: 'Time is money.', level: 1 },
  { id: 13, word: 'water', pronunciation: 'ˈwɔːtər', meaning: 'n. 水', example: 'I drink water every day.', level: 1 },
  { id: 14, word: 'food', pronunciation: 'fuːd', meaning: 'n. 食物', example: 'I like Chinese food.', level: 1 },
  { id: 15, word: 'house', pronunciation: 'haʊs', meaning: 'n. 房子', example: 'This is my house.', level: 1 },
  { id: 16, word: 'school', pronunciation: 'skuːl', meaning: 'n. 学校', example: 'I go to school every day.', level: 1 },
  { id: 17, word: 'study', pronunciation: 'ˈstʌdi', meaning: 'v. 学习', example: 'I study English every morning.', level: 1 },
  { id: 18, word: 'work', pronunciation: 'wɜːrk', meaning: 'v. 工作', example: 'I work from 9 to 5.', level: 1 },
  { id: 19, word: 'music', pronunciation: 'ˈmjuːzɪk', meaning: 'n. 音乐', example: 'I like listening to music.', level: 1 },
  { id: 20, word: 'movie', pronunciation: 'ˈmuːvi', meaning: 'n. 电影', example: 'Let\'s watch a movie.', level: 1 },
  { id: 21, word: 'travel', pronunciation: 'ˈtrævəl', meaning: 'v. 旅行', example: 'I want to travel abroad.', level: 2 },
  { id: 22, word: 'college', pronunciation: 'ˈkɒlɪdʒ', meaning: 'n. 大学', example: 'I go to college in Shanghai.', level: 2 },
  { id: 23, word: 'business', pronunciation: 'ˈbɪznəs', meaning: 'n. 商业', example: 'He runs a business.', level: 2 },
  { id: 24, word: 'technology', pronunciation: 'tɛkˈnɒlədʒi', meaning: 'n. 技术', example: 'Technology changes our lives.', level: 2 },
  { id: 25, word: 'environment', pronunciation: 'ɪnˈvaɪrənmənt', meaning: 'n. 环境', example: 'We must protect the environment.', level: 2 },
  { id: 26, word: 'culture', pronunciation: 'ˈkʌltʃər', meaning: 'n. 文化', example: 'Chinese culture is amazing.', level: 2 },
  { id: 27, word: 'communication', pronunciation: 'kəˌmjuːnɪˈkeɪʃən', meaning: 'n. 沟通', example: 'Good communication is important.', level: 2 },
  { id: 28, word: 'experience', pronunciation: 'ɪkˈspɪriəns', meaning: 'n. 经验', example: 'I have 5 years of experience.', level: 2 },
  { id: 29, word: 'important', pronunciation: 'ɪmˈpɔːrtənt', meaning: 'adj. 重要的', example: 'Health is important.', level: 2 },
  { id: 30, word: 'different', pronunciation: 'ˈdɪfərənt', meaning: 'adj. 不同的', example: 'We have different opinions.', level: 2 },
  { id: 31, word: 'collaborate', pronunciation: 'kəˈlæbəreɪt', meaning: 'v. 合作', example: 'We need to collaborate.', level: 3 },
  { id: 32, word: 'professional', pronunciation: 'prəˈfɛʃənəl', meaning: 'adj. 专业的', example: 'He is a professional.', level: 3 },
  { id: 33, word: 'hypothesis', pronunciation: 'haɪˈpɒθəsɪs', meaning: 'n. 假设', example: 'We need to test this hypothesis.', level: 3 },
  { id: 34, word: 'paradigm', pronunciation: 'ˈpærədaɪm', meaning: 'n. 范式', example: 'This is a paradigm shift.', level: 3 },
  { id: 35, word: 'conceptualize', pronunciation: 'kənˈsepʃʊəlaɪz', meaning: 'v. 概念化', example: 'It\'s hard to conceptualize.', level: 3 }
];

// 存储学习记录
let learningRecords = wx.getStorageSync('learningRecords') || {
  known: [],
  unknown: [],
  total: 0,
  streak: 0,
  lastDate: null
};

module.exports = {
  // 获取所有单词
  getWords: () => localWords,
  
  // 获取随机单词
  getRandomWord: () => localWords[Math.floor(Math.random() * localWords.length)],
  
  // 获取指定数量单词
  getWordsBatch: (count = 10) => {
    const shuffled = [...localWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },
  
  // 按难度获取单词
  getWordsByLevel: (level) => {
    return localWords.filter(w => w.level === level);
  },
  
  // 标记认识
  markKnown: (wordId) => {
    if (!learningRecords.known.includes(wordId)) {
      learningRecords.known.push(wordId);
      learningRecords.total++;
      learningRecords.lastDate = new Date().toDateString();
      wx.setStorageSync('learningRecords', learningRecords);
    }
  },
  
  // 标记不认识
  markUnknown: (wordId) => {
    if (!learningRecords.unknown.includes(wordId)) {
      learningRecords.unknown.push(wordId);
      learningRecords.total++;
      learningRecords.lastDate = new Date().toDateString();
      wx.setStorageSync('learningRecords', learningRecords);
    }
  },
  
  // 获取学习记录
  getRecords: () => learningRecords,
  
  // 获取统计信息
  getStats: () => {
    const today = new Date().toDateString();
    const lastDate = learningRecords.lastDate;
    
    // 计算连续学习天数
    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate === yesterday.toDateString()) {
        // 昨天学习过，连续天数保持
      } else if (lastDate !== null) {
        learningRecords.streak = 0;
        wx.setStorageSync('learningRecords', learningRecords);
      }
    }
    
    return {
      total: learningRecords.total,
      known: learningRecords.known.length,
      unknown: learningRecords.unknown.length,
      streak: learningRecords.streak,
      progress: learningRecords.total > 0 
        ? Math.round((learningRecords.known.length / learningRecords.total) * 100) 
        : 0
    };
  }
};
