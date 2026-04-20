// pages/learn/learn.js
const words = require('../../utils/words.js');

Page({
  data: {
    word: {},
    showMeaning: false,
    currentIndex: 0,
    learnedCount: 0
  },
  onLoad() {
    this.loadNextWord();
  },
  loadNextWord() {
    const word = words.getRandomWord();
    this.setData({ word, showMeaning: false });
  },
  showAnswer() {
    this.setData({ showMeaning: true });
  },
  markKnow() {
    this.setData({ learnedCount: this.data.learnedCount + 1 });
    this.loadNextWord();
  },
  markForget() {
    this.loadNextWord();
  }
});
