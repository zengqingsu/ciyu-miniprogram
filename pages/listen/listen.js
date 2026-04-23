// pages/listen/listen.js
const words = require('../../utils/words.js');

Page({
  data: {
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    totalQuestions: 5,
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
  }
});
