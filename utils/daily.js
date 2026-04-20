// utils/daily.js - 每日任务系统

// 每日任务配置
const dailyTasks = [
  { id: 'learn_5', name: '学习5个单词', desc: '今日学习至少5个新单词', target: 5, type: 'learn' },
  { id: 'learn_10', name: '学习10个单词', desc: '今日学习至少10个新单词', target: 10, type: 'learn' },
  { id: 'review_5', name: '复习5个单词', desc: '复习已学过的单词', target: 5, type: 'review' },
  { id: 'quiz_1', name: '完成1次测试', desc: '完成能力测试', target: 1, type: 'quiz' },
  { id: 'notebook_1', name: '收藏1个生词', desc: '将陌生单词加入生词本', target: 1, type: 'notebook' },
  { id: 'streak_1', name: '坚持学习', desc: '保持连续学习', target: 1, type: 'streak' }
];

// 获取今日任务
function getDailyTasks() {
  const today = new Date().toDateString();
  const taskProgress = wx.getStorageSync('taskProgress') || {};
  const lastDate = wx.getStorageSync('lastTaskDate');
  
  // 新的一天，重置任务进度
  if (lastDate !== today) {
    wx.setStorageSync('lastTaskDate', today);
    wx.setStorageSync('taskProgress', {});
    return dailyTasks.map(task => ({ ...task, progress: 0, completed: false }));
  }
  
  // 返回当天的任务进度
  return dailyTasks.map(task => ({
    ...task,
    progress: taskProgress[task.id] || 0,
    completed: (taskProgress[task.id] || 0) >= task.target
  }));
}

// 更新任务进度
function updateTaskProgress(taskType, count) {
  const today = new Date().toDateString();
  const lastDate = wx.getStorageSync('lastTaskDate');
  
  // 不是同一天，不更新
  if (lastDate !== today) return;
  
  const taskProgress = wx.getStorageSync('taskProgress') || {};
  
  // 根据任务类型更新对应任务
  dailyTasks.forEach(task => {
    if (task.type === taskType) {
      const current = taskProgress[task.id] || 0;
      taskProgress[task.id] = current + count;
    }
  });
  
  wx.setStorageSync('taskProgress', taskProgress);
}

// 获取今日学习统计
function getTodayStats() {
  const today = new Date().toDateString();
  const lastDate = wx.getStorageSync('lastTaskDate');
  
  if (lastDate !== today) {
    return {
      learnCount: 0,
      reviewCount: 0,
      quizCount: 0,
      notebookCount: 0
    };
  }
  
  const taskProgress = wx.getStorageSync('taskProgress') || {};
  
  return {
    learnCount: taskProgress.learn_5 || 0,
    reviewCount: taskProgress.review_5 || 0,
    quizCount: taskProgress.quiz_1 || 0,
    notebookCount: taskProgress.notebook_1 || 0
  };
}

// 获取完成任务数量
function getCompletedCount() {
  const tasks = getDailyTasks();
  return tasks.filter(t => t.completed).length;
}

// 检查是否有新成就解锁
function checkDailyAchievements() {
  const tasks = getDailyTasks();
  const completedCount = tasks.filter(t => t.completed).length;
  
  // 每日任务全部完成成就
  if (completedCount === tasks.length) {
    return 'daily_master';
  }
  return null;
}

module.exports = {
  getDailyTasks,
  updateTaskProgress,
  getTodayStats,
  getCompletedCount,
  checkDailyAchievements
};
