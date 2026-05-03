// utils/chartData.js - 学习数据可视化

/**
 * 学习数据可视化工具
 * 支持：学习时长趋势图、词汇掌握度雷达图、每日学习统计
 */

/**
 * 获取学习时长趋势数据
 * @param {number} days - 返回天数
 * @returns {Array} 每日学习时长(分钟)
 */
function getStudyTimeTrend(days = 7) {
  const trend = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = formatDate(date);
    
    // 从存储获取数据
    const dailyData = wx.getStorageSync(`daily_${dateKey}`) || {};
    
    // 如果存储没有数据，生成更自然的Mock数据
    if (!dailyData.studyMinutes) {
      // 创建学习时间的自然波动（上周：30-60分钟）
      const baseMinutes = Math.round(40 + Math.sin(i / days * Math.PI) * 20);
      // 随机上下波动
      const minutes = Math.max(10, Math.min(120, baseMinutes + Math.random() * 20 - 10));
      
      trend.push({
        date: dateKey,
        label: `${date.getMonth() + 1}/${date.getDate()}`,
        minutes: minutes,
        words: Math.round(minutes / 5) // 假设每5分钟学一个单词
      });
    } else {
      trend.push({
        date: dateKey,
        label: `${date.getMonth() + 1}/${date.getDate()}`,
        minutes: dailyData.studyMinutes,
        words: dailyData.learnedWords || 0
      });
    }
  }
  
  return trend;
}

/**
 * 词汇掌握度数据（雷达图）
 * @returns {Object} 六维雷达图数据
 */
function getVocabularyRadar() {
  const records = wx.getStorageSync('learningRecords') || { known: [], unknown: [] };
  const allWords = require('./words.js').getWords();
  
  // 按类别统计掌握度
  const categoryStats = {};
  const categoryLevels = { '食物': 0, '科技': 0, '学习': 0, '日常': 0, '人际': 0, '情感': 0 };
  
  allWords.forEach(word => {
    const category = word.category || '日常';
    if (!categoryStats[category]) {
      categoryStats[category] = { total: 0, known: 0 };
    }
    categoryStats[category].total++;
    
    if (records.known.includes(word.id)) {
      categoryStats[category].known++;
    }
  });
  
  // 生成雷达图数据
  const categories = Object.keys(categoryLevels);
  const radarData = categories.map(cat => {
    const stats = categoryStats[cat] || { total: 0, known: 0 };
    const rate = stats.total > 0 ? Math.round((stats.known / stats.total) * 100) : 0;
    return {
      category: cat,
      value: rate,
      label: cat,
      known: stats.known,
      total: stats.total
    };
  });
  
  return {
    labels: categories,
    datasets: [{
      label: '掌握度',
      data: radarData.map(r => r.value)
    }],
    stats: radarData
  };
}

/**
 * 获取每日学习统计
 * @returns {Object} 今日统计
 */
function getDailyStats() {
  const today = formatDate(new Date());
  const dailyData = wx.getStorageSync(`daily_${today}`) || {};
  const records = wx.getStorageSync('learningRecords') || { known: [], unknown: [], total: 0, streak: 0 };
  
  // 今日学习数据
  const todayNew = dailyData.learnedWords || 0;
  const todayReview = dailyData.reviewedWords || 0;
  const todayMinutes = dailyData.studyMinutes || 0;
  
  // 连续学习天数计算
  let streak = records.streak || 0;
  const lastDate = records.lastDate;
  const yesterday = getYesterday();
  
  if (lastDate === today) {
    // 今日已学习
  } else if (lastDate === yesterday) {
    // 昨日学习过，连续继续
  } else if (lastDate && lastDate !== today) {
    // 中断，重新计算
    streak = 0;
  }
  
  return {
    date: today,
    newWords: todayNew,
    reviewWords: todayReview,
    totalWords: todayNew + todayReview,
    studyMinutes: todayMinutes,
    streak: streak,
    totalLearned: records.known?.length || 0,
    totalUnknown: records.unknown?.length || 0
  };
}

/**
 * 成就进度数据
 * @returns {Array} 成就进度列表
 */
function getAchievementProgress() {
  const records = wx.getStorageSync('learningRecords') || { known: [], unknown: [], total: 0, streak: 0 };
  const notebook = wx.getStorageSync('notebook') || [];
  const achievements = require('./words.js').achievements || [];
  
  return achievements.map(achievement => {
    let progress = 0;
    let target = 0;
    
    // 根据成就类型计算进度
    const id = achievement.id;
    if (id.startsWith('learn_')) {
      target = parseInt(id.split('_')[1]) || 10;
      progress = Math.min(records.total || 0, target);
    } else if (id.startsWith('streak_')) {
      target = parseInt(id.split('_')[1]) || 3;
      progress = Math.min(records.streak || 0, target);
    } else if (id.startsWith('master_')) {
      target = parseInt(id.split('_')[1]) || 10;
      progress = Math.min(records.known?.length || 0, target);
    } else if (id.startsWith('notebook_')) {
      target = parseInt(id.split('_')[1]) || 5;
      progress = Math.min(notebook.length, target);
    }
    
    return {
      id: achievement.id,
      name: achievement.name,
      desc: achievement.desc,
      icon: achievement.icon,
      progress: progress,
      target: target,
      percent: target > 0 ? Math.round((progress / target) * 100) : 0,
      achieved: progress >= target
    };
  });
}

/**
 * 记录每日学习数据
 * @param {number} minutes - 学习分钟数
 * @param {number} newWords - 新学单词数
 * @param {number} reviewedWords - 复习单词数
 */
function recordDailyStudy(minutes, newWords = 0, reviewedWords = 0) {
  const today = formatDate(new Date());
  const key = `daily_${today}`;
  const dailyData = wx.getStorageSync(key) || {};
  
  wx.setStorageSync(key, {
    ...dailyData,
    studyMinutes: (dailyData.studyMinutes || 0) + minutes,
    learnedWords: (dailyData.learnedWords || 0) + newWords,
    reviewedWords: (dailyData.reviewedWords || 0) + reviewedWords,
    lastUpdate: Date.now()
  });
  
  // 更新总连续学习天数
  const records = wx.getStorageSync('learningRecords') || { streak: 0, lastDate: null };
  const yesterday = getYesterday();
  
  if (records.lastDate !== today && records.lastDate !== yesterday) {
    // 新一天或中断
    records.streak = 0;
  }
  records.streak = (records.streak || 0) + 1;
  records.lastDate = today;
  wx.setStorageSync('learningRecords', records);
}

// ========== 辅助函数 ==========

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterday() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}

// ========== 导出 ==========

module.exports = {
  getStudyTimeTrend,
  getVocabularyRadar,
  getDailyStats,
  getAchievementProgress,
  recordDailyStudy
};