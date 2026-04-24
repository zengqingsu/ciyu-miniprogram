// utils/performance.js - 性能优化工具
/**
 * 防抖函数 - 限制频繁调用
 */
function debounce(fn, delay = 300) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数 - 定时执行
 */
function throttle(fn, delay = 300) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 浅比较对象
 */
function shallowEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  return keys1.every(key => obj1[key] === obj2[key]);
}

/**
 * 深拷贝（安全限制）
 */
function deepClone(obj, maxDepth = 10) {
  if (maxDepth <= 0) return obj;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item, maxDepth - 1));
  }
  const clone = {};
  Object.keys(obj).forEach(key => {
    clone[key] = deepClone(obj[key], maxDepth - 1);
  });
  return clone;
}

/**
 * 清理大对象引用
 */
function cleanLargeObject(obj, keepKeys = []) {
  if (!obj || typeof obj !== 'object') return obj;
  const cleaned = {};
  keepKeys.forEach(key => {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
}

/**
 * 计算数据结构大小（字节）
 */
function getDataSize(data) {
  try {
    return JSON.stringify(data).length;
  } catch (e) {
    return 0;
  }
}

/**
 * 图片懒加载检测
 */
function isInViewport(element, threshold = 100) {
  if (!element) return false;
  try {
    const systemInfo = wx.getSystemInfoSync();
    return element.top > -threshold && 
           element.top < systemInfo.windowHeight + threshold;
  } catch (e) {
    return true;
  }
}

/**
 * 列表虚拟滚动优化
 */
function getVisibleRange(scrollTop, itemHeight, containerHeight, buffer = 3) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const visibleCount = Math.ceil(containerHeight / itemHeight) + buffer * 2;
  const endIndex = startIndex + visibleCount;
  return { startIndex, endIndex };
}

/**
 * 限制数组大小
 */
function limitArray(arr, maxLength = 100) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(-maxLength);
}

/**
 * 延迟执行（不分阻塞）
 */
function nextFrame(fn) {
  return new Promise(resolve => {
    wx.nextTick(() => {
      fn();
      resolve();
    });
  });
}

/**
 * 异步延迟
 */
function sleep(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 创建缓存
 */
function createCache(maxSize = 50) {
  const cache = new Map();
  return {
    get(key) {
      if (cache.has(key)) {
        const value = cache.get(key);
        cache.delete(key);
        cache.set(key, value);
        return value;
      }
      return null;
    },
    set(key, value) {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    },
    has(key) {
      return cache.has(key);
    },
    clear() {
      cache.clear();
    },
    size() {
      return cache.size;
    }
  };
}

/**
 * 请求缓存
 */
const requestCache = createCache(20);
function cachedRequest(key, fn, ttl = 60000) {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return Promise.resolve(cached.data);
  }
  return fn().then(data => {
    requestCache.set(key, { data, timestamp: Date.now() });
    return data;
  });
}

/**
 * 清理过期缓存
 */
function clearExpiredCache(ttl = 3600000) {
  const now = Date.now();
  requestCache.clear();
}

module.exports = {
  debounce,
  throttle,
  shallowEqual,
  deepClone,
  cleanLargeObject,
  getDataSize,
  isInViewport,
  getVisibleRange,
  limitArray,
  nextFrame,
  sleep,
  createCache,
  cachedRequest,
  clearExpiredCache
};