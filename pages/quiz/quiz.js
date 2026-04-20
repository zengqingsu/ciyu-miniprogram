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
    Math: Math
  },
  
  onLoad() {
    this.generateQuestions();
  },
  
  // 生成测试题目
  generateQuestions() {
    const allWords = words.getWordsBatch(10);
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
    this.generateQuestions();
    this.setData({
      isComplete: false,
      correctCount: 0
    });
  },
  
  // 返回
  goBack() {
    wx.navigateBack();
  }
});
