// pages/quiz/quiz.js
const words = require('../../utils/words.js');

Page({
  data: {
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    selectedAnswer: null,
    showResult: false,
    isCorrect: false,
    correctCount: 0,
    progress: 0,
    isComplete: false,
    quizMode: 'choice',
    questionCount: 10,
    started: false,
    isLoading: false,
    modes: [
      { id: 'choice', name: '选择题', icon: '📝' },
      { id: 'fill', name: '填空题', icon: '✍️' },
      { id: 'spell', name: '拼写题', icon: '🔤' }
    ],
    Math: Math
  },
  
  onLoad(options) {
    const mode = options.mode || 'choice';
    this.setData({ quizMode: mode });
  },
  
  // 设置题数
  setQuestionCount(e) {
    const count = parseInt(e.currentTarget.dataset.count);
    this.setData({ questionCount: count });
  },
  
  // 开始测试
  startQuiz() {
    this.setData({ started: true, isLoading: true });
    
    // 模拟加载延迟，改善体验
    setTimeout(() => {
      this.generateQuestions();
      this.setData({ isLoading: false });
    }, 500);
  },
  
  // 切换测试模式
  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ 
      quizMode: mode,
      isComplete: false,
      correctCount: 0,
      currentIndex: 0
    });
    this.generateQuestions();
  },
  
  // 生成测试题目
  generateQuestions() {
    const allWords = words.getWordsBatch(this.data.questionCount);
    const questions = allWords.map(word => {
      // 随机打乱其他单词作为干扰选项
      const otherWords = words.getWords()
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [word.meaning, ...otherWords.map(w => w.meaning)]
        .sort(() => Math.random() - 0.5);
      
      const correctIndex = options.indexOf(word.meaning);
      
      return {
        word: word.word,
        wordId: word.id,
        pronunciation: word.pronunciation,
        type: 'choice',
        options: options,
        correctIndex: correctIndex,
        correctAnswer: word.meaning
      };
    });
    
    this.setData({
      questions,
      currentQuestion: questions[0],
      progress: 0
    });
  },
  
  // 选择答案
  selectAnswer(e) {
    if (this.data.showResult) return;
    
    const index = e.currentTarget.dataset.index;
    const currentQuestion = this.data.currentQuestion;
    const isCorrect = index === currentQuestion.correctIndex;
    
    // 震动反馈
    if (wx.vibrateShort) {
      wx.vibrateShort({ success: isCorrect });
    }
    
    this.setData({
      selectedAnswer: index,
      showResult: true,
      isCorrect: isCorrect,
      correctCount: isCorrect ? this.data.correctCount + 1 : this.data.correctCount
    });
  },
  
  // 播放发音（模拟）
  playAudio() {
    wx.showToast({
      title: '🔊 ' + this.data.currentQuestion.word,
      icon: 'none'
    });
  },
  
  // 下一题
  nextQuestion() {
    const nextIndex = this.data.currentIndex + 1;
    
    if (nextIndex >= this.data.questions.length) {
      this.setData({ isComplete: true });
      return;
    }
    
    this.setData({
      currentIndex: nextIndex,
      currentQuestion: this.data.questions[nextIndex],
      selectedAnswer: null,
      showResult: false,
      isCorrect: false,
      progress: (nextIndex / this.data.questions.length) * 100
    });
  },
  
  // 重新测试
  retryQuiz() {
    this.setData({ started: false, isComplete: false, correctCount: 0, currentIndex: 0 });
  },
  
  // 返回
  goBack() {
    wx.navigateBack();
  },
  
  // 分享成绩
  onShareAppMessage() {
    if (this.data.isComplete) {
      const percent = Math.round(this.data.correctCount / this.data.questions.length * 100);
      return {
        title: `词途测试 ${this.data.correctCount}/${this.data.questions.length} (${percent}%)`,
        path: '/pages/quiz/quiz'
      };
    }
    return {
      title: '词途能力测试',
      path: '/pages/quiz/quiz'
    };
  }
});
