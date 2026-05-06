// utils/networkManager.js - 网络状态管理与弱网降级
// 自动检测网络状况，提供合适的降级策略

/**
 * 网络状态管理器
 */
class NetworkManager {
  constructor() {
    this.listeners = [];
    this.currentStatus = {
      isConnected: true,
      networkType: 'wifi',
      isWifi: false,
      isMobile: false,
      isSlow: false,
      latency: 0
    };
    this.checkInterval = null;
    this.latencyThreshold = 1000; // 1秒以上认为是慢网
  }

  /**
   * 初始化网络状态监听
   */
  init() {
    // 初始检查
    this.checkNetworkStatus();
    
    // 监听网络状态变化
    wx.onNetworkStatusChange((res) => {
      this.handleNetworkChange(res);
    });
    
    console.log('网络状态管理器初始化');
  }

  /**
   * 检查当前网络状态
   */
  checkNetworkStatus() {
    return new Promise((resolve) => {
      wx.getNetworkType({
        success: (res) => {
          const status = this.parseNetworkStatus(res.networkType);
          this.currentStatus = status;
          this.notifyListeners(status);
          resolve(status);
        },
        fail: () => {
          const status = { isConnected: false, networkType: 'unknown' };
          this.currentStatus = status;
          resolve(status);
        }
      });
    });
  }

  /**
   * 解析网络状态
   */
  parseNetworkStatus(networkType) {
    return {
      isConnected: networkType !== 'none',
      networkType: networkType,
      isWifi: networkType === 'wifi',
      isMobile: networkType === '4g' || networkType === '3g',
      isSlow: false,
      latency: 0
    };
  }

  /**
   * 处理网络状态变化
   */
  handleNetworkChange(res) {
    const newStatus = this.parseNetworkStatus(res.networkType);
    const oldStatus = { ...this.currentStatus };
    
    this.currentStatus = newStatus;
    this.notifyListeners(newStatus);
    
    // 网络从断开变为连接
    if (!oldStatus.isConnected && newStatus.isConnected) {
      this.triggerAutoSync();
    }
    
    // 网络从WiFi变为移动网络
    if (oldStatus.isWifi && !newStatus.isWifi) {
      this.handleNetworkDowngrade();
    }
  }

  /**
   * 注册状态监听器
   */
  onStatusChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * 通知监听器
   */
  notifyListeners(status) {
    this.listeners.forEach(cb => {
      try {
        cb(status);
      } catch (e) {
        console.error('网络状态监听器错误:', e);
      }
    });
  }

  /**
   * 测试网络延迟
   */
  async testLatency(url = 'https://www.baidu.com') {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      wx.request({
        url: url,
        method: 'HEAD',
        timeout: 5000,
        success: () => {
          const latency = Date.now() - startTime;
          this.currentStatus.latency = latency;
          this.currentStatus.isSlow = latency > this.latencyThreshold;
          resolve({ latency, isSlow: this.currentStatus.isSlow });
        },
        fail: () => {
          resolve({ latency: -1, isSlow: true });
        }
      });
    });
  }

  /**
   * 获取降级策略
   */
  getDegradationStrategy() {
    const status = this.currentStatus;
    
    if (!status.isConnected) {
      return {
        level: 'offline',
        mode: 'offline',
        imageQuality: 'none',
        audioMode: 'text',
        preload: false,
        syncEnabled: false,
        message: '已离线，使用本地数据'
      };
    }
    
    if (status.isSlow || status.networkType === '2g' || status.networkType === '3g') {
      return {
        level: 'slow',
        mode: 'low-bandwidth',
        imageQuality: 'thumbnail',
        audioMode: 'text-summary',
        preload: false,
        syncEnabled: true,
        syncOnWifiOnly: true,
        message: '弱网环境，已启用省流量模式'
      };
    }
    
    if (status.isMobile && !status.isWifi) {
      return {
        level: 'mobile',
        mode: 'normal',
        imageQuality: 'medium',
        audioMode: 'low-quality',
        preload: true,
        syncEnabled: true,
        syncOnWifiOnly: false,
        message: '移动网络，已启用平衡模式'
      };
    }
    
    // WiFi环境
    return {
      level: 'optimal',
      mode: 'high-quality',
      imageQuality: 'high',
        audioMode: 'high-quality',
      preload: true,
      syncEnabled: true,
      syncOnWifiOnly: false,
      message: 'WiFi环境，已启用高质量模式'
    };
  }

  /**
   * 处理网络降级
   */
  handleNetworkDowngrade() {
    const strategy = this.getDegradationStrategy();
    this.notifyListeners({ ...this.currentStatus, strategy });
    
    // 保存当前降级策略
    wx.setStorageSync('networkStrategy', strategy);
    
    console.log('网络降级:', strategy.message);
  }

  /**
   * 触发自动同步
   */
  triggerAutoSync() {
    const strategy = this.getDegradationStrategy();
    
    if (strategy.syncEnabled) {
      // 触发syncManager进行同步
      const syncManager = require('./syncManager.js');
      syncManager.smartSync().catch(console.error);
    }
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      ...this.currentStatus,
      strategy: this.getDegradationStrategy()
    };
  }

  /**
   * 请求封装 - 自动根据网络状况处理
   */
  request(options) {
    const strategy = this.getDegradationStrategy();
    
    // 弱网或离线模式
    if (!strategy.syncEnabled || strategy.level === 'offline') {
      return Promise.reject({ 
        code: 'NETWORK_OFFLINE', 
        message: strategy.message 
      });
    }
    
    // 根据策略调整请求参数
    const modifiedOptions = { ...options };
    
    // 慢网环境减少超时时间
    if (strategy.level === 'slow') {
      modifiedOptions.timeout = Math.min(options.timeout || 10000, 5000);
    }
    
    return new Promise((resolve, reject) => {
      wx.request({
        ...modifiedOptions,
        success: (res) => {
          // 检查是否需要降级
          if (res.statusCode >= 500) {
            this.handleServerError(res.statusCode);
          }
          resolve(res);
        },
        fail: (err) => {
          // 网络错误
          if (err.errMsg.includes('timeout')) {
            this.currentStatus.isSlow = true;
          }
          reject(err);
        }
      });
    });
  }

  /**
   * 处理服务器错误
   */
  handleServerError(statusCode) {
    if (statusCode >= 500) {
      // 服务器错误，降低预期
      this.currentStatus.isSlow = true;
    }
  }

  /**
   * 开始定期检测
   */
  startMonitoring(interval = 30000) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = setInterval(() => {
      this.testLatency();
    }, interval);
  }

  /**
   * 停止定期检测
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// 导出单例
const networkManager = new NetworkManager();

module.exports = {
  NetworkManager,
  networkManager
};
