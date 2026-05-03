// utils/spacedReview.js - 艾宾浩斯遗忘曲线复习算法

/**
 * 艾宾浩斯遗忘曲线公式
 * R = e^(-t/S)
 * R: 记忆保留率
 * t: 距离上次复习的时间（天）
 * S: 记忆稳定度（可调整）
 */

// 艾宾浩斯遗忘曲线参数
const Ebbinghaus = {
  // 记忆稳定度因子（可个性化调整）
  stability: 2.5,
  // 复习间隔序列（天）- 递增
  intervals: [1, 3, 7, 14, 30, 60, 120],
  // 记忆门槛（低于此值需要复习）
  threshold: 0.5,
  // 遗忘临界点（完全遗忘）
  forgotten: 0.2
};

/**
 * 计算记忆保留率
 * @param {number} lastReviewTime - 上次复习时间戳
 * @param {number} stability - 稳定度因子（可选）
 */
function getRetentionRate(lastReviewTime, stability = Ebbinghaus.stability) {
  const now = Date.now();
  const daysPassed = (now - lastReviewTime) / (1000 * 60 * 60 * 24);
  return Math.exp(-daysPassed / stability);
}

/**
 * 计算下次最佳复习间隔
 * @param {number} correctCount - 连续正确次数
 * @param {number} currentInterval - 当前间隔（天）
 * @param {number} difficulty - 难度系数（1-5, 越高越难）
 */
function getNextInterval(correctCount, currentInterval = 0, difficulty = 3) {
  // 基础间隔序列
  let baseIntervals = [...Ebbinghaus.intervals];
  
  // 根据难度调整
  const difficultyFactor = (6 - difficulty) / 2; // 1-5 -> 2.5-0.5
  const intervalIndex = Math.min(correctCount, baseIntervals.length - 1);
  const baseInterval = baseIntervals[intervalIndex] || 120;
  
  // 计算新间隔
  const newInterval = Math.round(baseInterval * difficultyFactor);
  
  // 确保最小间隔为1天
  return Math.max(1, currentInterval === 0 ? newInterval : Math.round(currentInterval * 1.5));
}

/**
 * 获取需要复习的单词列表
 * @param {Array} reviewRecords - 复习记录数组
 * @param {Array} allWords - 全部单词
 * @returns {Array} 需要复习的单词
 */
function getReviewWords(reviewRecords, allWords) {
  const now = Date.now();
  const reviewWords = [];
  
  reviewRecords.forEach(record => {
    const word = allWords.find(w => w.id === record.wordId);
    if (!word) return;
    
    const lastReviewTime = record.lastReviewTime || record.time;
    const retention = getRetentionRate(lastReviewTime, record.stability || Ebbinghaus.stability);
    const nextReviewTime = record.nextReviewTime || (lastReviewTime + (Ebbinghaus.intervals[0] * 24 * 60 * 60 * 1000));
    
    // 需要复习的条件：遗忘或到达复习时间
    if (retention < Ebbinghaus.threshold || now >= nextReviewTime) {
      reviewWords.push({
        ...word,
        retention: retention.toFixed(2),
        daysSinceReview: Math.floor((now - lastReviewTime) / (1000 * 60 * 60 * 24)),
        nextReviewDays: Math.max(0, Math.ceil((nextReviewTime - now) / (1000 * 60 * 60 * 24))),
        difficulty: record.difficulty || difficulty,
        correctCount: record.correctCount || 0
      });
    }
  });
  
  // 按遗忘程度排序（最需要复习的在前）
  reviewWords.sort((a, b) => a.retention - b.retention);
  
  return reviewWords;
}

/**
 * 记录复习结果并计算下次复习时间
 * @param {Object} record - 复习记录
 * @param {boolean} mastered - 是否掌握
 */
function updateReviewRecord(record, mastered) {
  const now = Date.now();
  const correctCount = mastered ? (record.correctCount || 0) + 1 : 0;
  const difficulty = record.difficulty || 3;
  const currentInterval = record.interval || 0;
  
  // 计算下次复习间隔
  const nextInterval = getNextInterval(correctCount, currentInterval, difficulty);
  
  return {
    ...record,
    lastReviewTime: now,
    nextReviewTime: now + (nextInterval * 24 * 60 * 60 * 1000),
    interval: nextInterval,
    correctCount,
    stability: Math.max(1, (record.stability || Ebbinghaus.stability) + (mastered ? 0.2 : -0.3)),
    mastered: mastered && correctCount >= 3 // 连续3次正确才算真正掌握
  };
}

/**
 * 生成复习计划统计
 * @param {Array} reviewRecords - 复习记录
 */
function getReviewStats(reviewRecords) {
  const now = Date.now();
  let dueCount = 0; // 今日需复习
  let masteredCount = 0; // 已掌握
  let learningCount = 0; // 学习中
  let totalRetention = 0;
  
  reviewRecords.forEach(record => {
    const retention = getRetentionRate(record.lastReviewTime || record.time, record.stability);
    totalRetention += retention;
    
    if (now >= (record.nextReviewTime || 0)) {
      dueCount++;
    }
    if (record.mastered) {
      masteredCount++;
    } else {
      learningCount++;
    }
  });
  
  return {
    total: reviewRecords.length,
    dueToday: dueCount,
    mastered: masteredCount,
    learning: learningCount,
    avgRetention: reviewRecords.length > 0 ? (totalRetention / reviewRecords.length).toFixed(2) : 1.0
  };
}

/**
 * 个性化难度评估
 * @param {Array} wrongHistory - 错误历史
 * @param {number} totalAttempts - 总尝试次数
 */
function calculateDifficulty(wrongHistory, totalAttempts) {
  if (totalAttempts === 0) return 3; // 默认中等难度
  
  const errorRate = wrongHistory.length / totalAttempts;
  
  // 错误率映射到难度(1-5)
  if (errorRate < 0.1) return 1; // 非常简单
  if (errorRate < 0.25) return 2; // 简单
  if (errorRate < 0.5) return 3; // 中等
  if (errorRate < 0.75) return 4; // 困难
  return 5; // 非常困难
}

module.exports = {
  Ebbinghaus,
  getRetentionRate,
  getNextInterval,
  getReviewWords,
  updateReviewRecord,
  getReviewStats,
  calculateDifficulty
};