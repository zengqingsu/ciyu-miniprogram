// pages/listen/listen.js
const words = require('../../utils/words.js');

Page({
  data: {
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    totalQuestions: 5,
    questionCountOptions: [5, 10, 15, 20],
    showOptions: false,
    selectedIndex: -1,
    isCorrect: false,
    answered: false,
    correctCount: 0,
    isComplete: false,
    isLoading: false,
    Math: Math
  },
  
  onLoad() {
    // 读取设置的题目数量
    const savedCount = wx.getStorageSync('listenQuestionCount');
    if (savedCount) {
      this.setData({ totalQuestions: savedCount });
    }
    this.generateQuestions();
  },
  
  // 切换题目数量
  changeQuestionCount(e) {
    const count = e.currentTarget.dataset.count;
    this.setData({ totalQuestions: count });
    wx.setStorageSync('listenQuestionCount', count);
    this.generateQuestions();
  },
  
  generateQuestions() {
    this.setData({ isLoading: true });
    
    setTimeout(() => {
      const allWords = words.getWordsBatch(this.data.totalQuestions);
      
      const questions = allWords.map(word => {
        const otherWords = words.getWords()
          .filter(w => w.id !== word.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        const options = [word.word, ...otherWords.map(w => w.word)]
          .sort(() => Math.random() - 0.5);
        
        return {
          word: word.word,
          pronunciation: word.pronunciation,
          meaning: word.meaning,
          options: options,
          correctAnswer: word.word
        };
      });
      
      this.setData({
        questions,
        currentQuestion: questions[0],
        currentIndex: 0,
        correctCount: 0,
        isComplete: false,
        isLoading: false
      });
    }, 300);
  },
  
  playAudio() {
    // 模拟播放发音
    wx.showToast({
      title: '🔊 ' + this.data.currentQuestion.word,
      icon: 'none',
      duration: 2000
    });
  },
  
  showOptionsBtn() {
    this.setData({ showOptions: true });
  },
  
  selectAnswer(e) {
    if (this.data.answered) return;
    
    const answer = e.currentTarget.dataset.answer;
    const isCorrect = answer === this.data.currentQuestion.correctAnswer;
    
    this.setData({
      selectedIndex: this.data.currentQuestion.options.indexOf(answer),
      isCorrect: isCorrect,
      answered: true,
      correctCount: isCorrect ? this.data.correctCount + 1 : this.data.correctCount
    });
  },
  
  nextQuestion() {
    const nextIndex = this.data.currentIndex + 1;
    
    if (nextIndex >= this.data.totalQuestions) {
      this.setData({ isComplete: true });
      return;
    }
    
    this.setData({
      currentIndex: nextIndex,
      currentQuestion: this.data.questions[nextIndex],
      showOptions: false,
      selectedIndex: -1,
      isCorrect: false,
      answered: false
    });
  },
  
  retryQuiz() {
    this.generateQuestions();
  },
  
  goBack() {
    wx.navigateBack();
  },
  
  // 分享成绩
  onShareAppMessage() {
    const percent = Math.round(this.data.correctCount / this.data.totalQuestions * 100);
    return {
      title: `听力练习 ${this.data.correctCount}/${this.data.totalQuestions} (${percent}%)`,
      path: '/pages/listen/listen'
    };
  }
});
