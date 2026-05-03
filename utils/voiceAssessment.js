// utils/voiceAssessment.js - 语音评测工具

/**
 * 语音评测模块
 * 依赖微信同声传译插件
 * https://developers.weixin.qq.com/miniprogram/dev/plugin/

 * 注意：需要在小程序管理后台添加"同声传译"插件
 * 插件AppID: wx069ba972c41635a64
 */

/**
 * 初始化语音评测
 */
function initVoiceAssessment() {
  return new Promise((resolve, reject) => {
    // 检查插件是否可用
    if (!wx.getRecorderManager) {
      reject(new Error('基础库版本过低'));
      return;
    }
    
    // 获取插件实例（需要在app.json中配置）
    // const plugin = requirePlugin('WechatSI');
    // const pluginVoice = plugin.getVoiceRecognitionManager();
    
    resolve({
      ready: true,
      message: '语音评测就绪'
    });
  });
}

/**
 * 开始录音
 * @param {Function} onRecognize - 识别回调
 * @param {Function} onError - 错误回调
 */
function startRecording(onRecognize, onError) {
  const recorderManager = wx.getRecorderManager();
  
  recorderManager.onRecognize = (res) => {
    if (onRecognize) {
      onRecognize(res.result);
    }
  };
  
  recorderManager.onError = (res) => {
    if (onError) {
      onError(res.errMsg);
    }
  };
  
  recorderManager.start({
    format: 'mp3',
    sampleRate: 16000,
    numberOfChannels: 1,
    encodeBitRate: 48000,
    duration: 60000 // 最长60秒
  });
  
  return recorderManager;
}

/**
 * 停止录音并识别
 * @param {Object} recorderManager - 录音管理器
 */
function stopRecording(recorderManager) {
  return new Promise((resolve) => {
    recorderManager.stop();
    
    recorderManager.onStop = (res) => {
      // 获得录音文件后发送到云函数进行语音评测
      resolve({
        tempFilePath: res.tempFilePath,
        duration: res.duration
      });
    };
  });
}

/**
 * 发音评分（需要后端接口支持）
 * @param {string} audioPath - 音频文件路径
 * @param {string} targetText - 目标文本
 * @returns {Promise} 评测结果
 */
function assessPronunciation(audioPath, targetText) {
  // 实际项目中，这里应该调用后端接口或云函数
  // 由于需要插件，这里提供本地模拟版本
  return new Promise((resolve) => {
    // 模拟评分（实际需要接入腾讯云语音评测API）
    setTimeout(() => {
      const score = Math.floor(60 + Math.random() * 40); // 60-100分
      const feedback = getFeedbackByScore(score);
      
      resolve({
        score: score,
        targetText: targetText,
        feedback: feedback,
        confidence: 0.85 + Math.random() * 0.15,
        details: {
          fluency: Math.floor(60 + Math.random() * 40),
          accuracy: Math.floor(65 + Math.random() * 35),
          completeness: Math.floor(70 + Math.random() * 30)
        }
      });
    }, 500);
  });
}

/**
 * 根据分数获取反馈
 * @param {number} score - 分数
 * @returns {Object} 反馈信息
 */
function getFeedbackByScore(score) {
  if (score >= 90) {
    return {
      level: 'excellent',
      text: '完美！发音非常标准',
      suggestion: '继续保持'
    };
  } else if (score >= 80) {
    return {
      level: 'good',
      text: '很好！发音基本正确',
      suggestion: '注意语调'
    };
  } else if (score >= 70) {
    return {
      level: 'fair',
      text: '不错！有轻微发音问题',
      suggestion: '注意某些元音'
    };
  } else if (score >= 60) {
    return {
      level: 'needs_improvement',
      text: '还可以，需要更多练习',
      suggestion: '注意口型'
    };
  } else {
    return {
      level: 'poor',
      text: '���要加强练习',
      suggestion: '先听原声模仿'
    };
  }
}

/**
 * 对比发音相似度（基于编辑距离）
 * @param {string} reference - 参考发音（音标）
 * @param {string} attempt - 用户尝试
 * @returns {number} 相似度 0-1
 */
function calculateSimilarity(reference, attempt) {
  if (!reference || !attempt) return 0;
  
  // 简单实现：字符匹配度
  const ref = reference.toLowerCase().replace(/[^a-z]/g, '');
  const att = attempt.toLowerCase().replace(/[^a-z]/g, '');
  
  if (ref === att) return 1;
  if (ref.length === 0 || att.length === 0) return 0;
  
  // 计算最长公共子序列
  const lcs = longestCommonSubsequence(ref, att);
  const similarity = (2 * lcs) / (ref.length + att.length);
  
  return Math.round(similarity * 100) / 100;
}

/**
 * 最长公共子序列
 */
function longestCommonSubsequence(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  return dp[m][n];
}

/**
 * 获取口型纠正建议
 * @param {string} phoneme - 音素
 * @returns {Object} 纠正建议
 */
function getMouthShapeSuggestion(phoneme) {
  const suggestions = {
    'æ': { mouth: '嘴巴张大', tongue: '舌根向下', tip: '类似"啊"但嘴角向两边展开' },
    'ə': { mouth: '嘴巴微开', tongue: '舌放平', tip: '轻轻发声' },
    'i:': { mouth: '嘴角向两边展开', tongue: '舌前部抬起', tip: '保持微笑口型' },
    'i': { mouth: '嘴角展开', tongue: '舌前部稍抬', tip: '比i:短促' },
    'u:': { mouth: '嘴唇圆小', tongue: '舌后部抬起', tip: '撅嘴' },
    'u': { mouth: '嘴唇圆小', tongue: '舌后部稍抬', tip: '撅嘴但放松' },
    'eɪ': { mouth: '从e过渡到i', tongue: '舌移动', tip: '滑向i' },
    'aɪ': { mouth: '从a过渡到i', tongue: '舌移动', tip: '滑向i' },
    'ɔɪ': { mouth: '从ɔ过渡到i', tongue: '舌移动', tip: '滑向i' },
    'ʊ': { mouth: '嘴唇圆小', tongue: '舌后部放下', tip: '短促撅嘴' },
    'ɒ': { mouth: '嘴巴圆大', tongue: '舌后部放下', tip: '撅嘴张大' },
    'θ': { mouth: '舌尖咬舌', tongue: '伸出齿间', tip: '牙齿轻触舌头' },
    'ʃ': { mouth: '嘴唇前撅',舌头：'舌前部抬起', tip: '类似"嘘"' },
    'tʃ': { mouth: '先发t再接ʃ', tongue: '舌移动', tip: '流畅过渡' },
    'dʒ': { mouth: '先发d再接ʒ', tongue: '舌移动', tip: '流畅过渡' }
  };
  
  return suggestions[phoneme] || { mouth: '自然发音', tongue: '放松', tip: '多听多模仿' };
}

// ========== 导出 ==========

module.exports = {
  initVoiceAssessment,
  startRecording,
  stopRecording,
  assessPronunciation,
  calculateSimilarity,
  getMouthShapeSuggestion,
  getFeedbackByScore
};