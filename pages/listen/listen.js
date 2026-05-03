// pages/listen/listen.js - 听力+语音评测
const words = require('../../utils/words.js');
const voiceAssessment = require('../../utils/voiceAssessment.js');

Page({
  data: {
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    totalQuestions: 5,
    questionCountOptions: [5, 10, 15, 20],
    
    // 听力模式
    showOptions: false,
    selectedIndex: -,
    isCorrect: false,
    answered: false,
    
    // 语音评测
    isRecording: false,
    assessmentResult: null,
    showAssessment: false,
    mode: 'listen', // listen | speak
    
    correctCount: 0,
    isComplete: false,
    isLoading: false,
    Math: Math
  },
  
  onLoad(options) {
    const mode = options.mode || 'listen';
    this.setData({ mode });
    
    const savedCount = wx.getStorageSync('listenQuestionCount');
    if (savedCount) {
      this.setData({ totalQuestions: savedCount });
    }
    this.generateQuestions();
  },
  
  changeMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ mode });
  },
  
  changeQuestionCount(e) {
    const count = e.currentTarget.dataset.count;
    this.setData({ totalQuestions: count });
    wx.setStorageSync('listenQuestionCount', count);
    this.generateQuestions();
  },
  
  generateQuestions() {
    this.setData({ isLoading: true, assessmentResult: null, showAssessment: false });
    
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
  
  // 播放发音
  playAudio() {
    const word = this.data.currentQuestion.word;
    wx.showToast({
      title: `🔊 ${word}`,
      icon: 'none',
      duration: 1500
    });
    // 实际可以调用微信TTS
  },
  
  // 开始语音评测录音
  startRecording() {
    if (this.data.isRecording) return;
    
    this.setData({ isRecording: true, assessmentResult: null });
    
    wx.showLoading({ title: '正在录音...' });
    
    const recorderManager = wx.getRecorderManager();
    
    recorderManager.onStop = (res) => {
      wx.hideLoading();
      this.setData({ isRecording: false });
      
      // 进行评测
      this.assessPronunciation(res.tempFilePath);
    };
    
    recorderManager.onError = (res) => {
      wx.hideLoading();
      this.setData({ isRecording: false });
      wx.showToast({ title: '录音失败', icon: 'none' });
    };
    
    recorderManager.start({
      format: 'mp3',
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      duration: 60000
    });
  },
  
  // 停止录音
  stopRecording() {
    const recorderManager = wx.getRecorderManager();
    recorderManager.stop();
  },
  
  // 评测发音
  assessPronunciation(audioPath) {
    wx.showLoading({ title: '评分中...' });
    
    const targetText = this.data.currentQuestion.word;
    
    voiceAssessment.assessPronunciation(audioPath, targetText)
      .then(result => {
        wx.hideLoading();
        this.setData({
          assessmentResult: result,
          showAssessment: true
        });
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({ title: '评测失败', icon: 'none' });
      });
  },
  
  // 选择答案
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
      answered: false,
      assessmentResult: null,
      showAssessment: false
    });
  },
  
  retryQuiz() {
    this.generateQuestions();
  },
  
  onShareAppMessage() {
    const percent = Math.round(this.data.correctCount / this.data.totalQuestions * 100);
    return {
      title: `听力练习 ${this.data.correctCount}/${this.data.totalQuestions} (${percent}%)`,
      path: '/pages/listen/listen'
    };
  }
});