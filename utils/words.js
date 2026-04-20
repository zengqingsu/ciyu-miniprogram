// utils/words.js - 单词数据
const words = [
  { id: 1, word: 'apple', phonetic: '/ˈæpəl/', meaning: 'n. 苹果' },
  { id: 2, word: 'banana', phonetic: '/bəˈnɑːnə/', meaning: 'n. 香蕉' },
  { id: 3, word: 'orange', phonetic: '/ˈɒrɪndʒ/', meaning: 'n. 橙子' },
  { id: 4, word: 'hello', phonetic: '/həˈləʊ/', meaning: 'int. 你好' },
  { id: 5, word: 'world', phonetic: '/wɜːld/', meaning: 'n. 世界' }
];

module.exports = {
  getWords: () => words,
  getRandomWord: () => words[Math.floor(Math.random() * words.length)]
};
