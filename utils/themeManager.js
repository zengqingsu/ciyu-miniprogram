// utils/themeManager.js - 主题管理（夜间模式/护眼模式）
// 自动根据时间和用户设置切换主题

const offlineStorage = require('./offlineStorage.js');

/**
 * 主题类型
 */
const ThemeType = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

/**
 * 主题配置
 */
const ThemeConfig = {
  light: {
    name: '白天模式',
    colors: {
      primary: '#667eea',
      primaryDark: '#5568d3',
      secondary: '#764ba2',
      background: '#f5f5f5',
      backgroundCard: '#ffffff',
      text: '#333333',
      textSecondary: '#666666',
      textTertiary: '#999999',
      border: '#e0e0e0',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196f3'
    }
  },
  dark: {
    name: '夜间模式',
    colors: {
      primary: '#7c8cff',
      primaryDark: '#667eea',
      secondary: '#9b6dff',
      background: '#121212',
      backgroundCard: '#1e1e1e',
      text: '#e0e0e0',
      textSecondary: '#b0b0b0',
      textTertiary: '#808080',
      border: '#333333',
      success: '#66bb6a',
      warning: '#ffa726',
      error: '#ef5350',
      info: '#42a5f5'
    }
  }
};

/**
 * 主题管理器
 */
class ThemeManager {
  constructor() {
    this.currentTheme = ThemeType.LIGHT;
    this.listeners = [];
    this.autoCheckTimer = null;
  }

  /**
   * 初始化主题
   */
  init() {
    const settings = offlineStorage.getUserSettings();
    
    // 根据设置初始化主题
    if (settings.nightMode === true) {
      this.currentTheme = ThemeType.DARK;
    } else if (settings.nightMode === 'auto') {
      this.currentTheme = this.getAutoTheme();
      this.startAutoCheck();
    } else {
      this.currentTheme = ThemeType.LIGHT;
    }
    
    // 应用主题
    this.applyTheme();
    
    console.log('主题初始化:', this.currentTheme);
  }

  /**
   * 根据时间自动判断主题
   */
  getAutoTheme() {
    const hour = new Date().getHours();
    
    // 夜间10点至早上6点使用夜间模式
    if (hour >= 22 || hour < 6) {
      return ThemeType.DARK;
    }
    
    return ThemeType.LIGHT;
  }

  /**
   * 切换主题
   */
  setTheme(theme) {
    if (![ThemeType.LIGHT, ThemeType.DARK, ThemeType.AUTO].includes(theme)) {
      console.error('无效的主题类型');
      return;
    }
    
    this.currentTheme = theme;
    
    // 保存设置
    const settings = offlineStorage.getUserSettings();
    if (theme === ThemeType.AUTO) {
      settings.nightMode = 'auto';
      this.startAutoCheck();
    } else {
      settings.nightMode = theme === ThemeType.DARK;
      this.stopAutoCheck();
    }
    offlineStorage.saveUserSettings(settings);
    
    // 应用主题
    this.applyTheme();
    this.notifyListeners();
  }

  /**
   * 切换到夜间模式
   */
  enableNightMode() {
    this.setTheme(ThemeType.DARK);
  }

  /**
   * 切换到白天模式
   */
  disableNightMode() {
    this.setTheme(ThemeType.LIGHT);
  }

  /**
   * 切换主题（切换开关）
   */
  toggleTheme() {
    if (this.currentTheme === ThemeType.LIGHT) {
      this.setTheme(ThemeType.DARK);
    } else if (this.currentTheme === ThemeType.DARK) {
      this.setTheme(ThemeType.LIGHT);
    } else {
      // auto模式时切换到light
      this.setTheme(ThemeType.LIGHT);
    }
  }

  /**
   * 启用自动主题
   */
  enableAutoTheme() {
    this.setTheme(ThemeType.AUTO);
  }

  /**
   * 应用主题到页面
   */
  applyTheme() {
    const themeData = ThemeConfig[this.currentTheme === ThemeType.AUTO ? 
      this.getAutoTheme() : this.currentTheme];
    
    // 设置全局变量
    wx.setStorageSync('currentTheme', this.currentTheme);
    wx.setStorageSync('themeColors', themeData.colors);
    
    // 更新页面样式
    this.updatePageStyles(themeData.colors);
    
    // 触发主题变化事件
    wx.eventCenter && wx.eventCenter.trigger('themeChange', {
      theme: this.currentTheme,
      colors: themeData.colors
    });
  }

  /**
   * 更新页面样式
   */
  updatePageStyles(colors) {
    // 设置导航栏颜色
    wx.setNavigationBarColor({
      frontColor: this.currentTheme === ThemeType.DARK ? '#ffffff' : '#ffffff',
      backgroundColor: colors.primary,
      animation: {
        duration: 300,
        timingFunc: 'easeInOut'
      }
    });
    
    // 设置底部tab栏颜色
    wx.setStorageSync('tabBarColors', {
      color: colors.textTertiary,
      selectedColor: colors.primary,
      backgroundColor: colors.backgroundCard,
      borderColor: colors.border
    });
  }

  /**
   * 获取当前主题颜色
   */
  getColors() {
    const theme = this.currentTheme === ThemeType.AUTO ? 
      this.getAutoTheme() : this.currentTheme;
    return ThemeConfig[theme].colors;
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * 获取主题配置
   */
  getThemeConfig() {
    const theme = this.currentTheme === ThemeType.AUTO ? 
      this.getAutoTheme() : this.currentTheme;
    return ThemeConfig[theme];
  }

  /**
   * 注册主题变化监听器
   */
  onThemeChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * 通知监听器
   */
  notifyListeners() {
    const colors = this.getColors();
    this.listeners.forEach(cb => {
      try {
        cb({
          theme: this.currentTheme,
          colors
        });
      } catch (e) {
        console.error('主题监听器错误:', e);
      }
    });
  }

  /**
   * 启动自动检查
   */
  startAutoCheck() {
    if (this.autoCheckTimer) return;
    
    // 每分钟检查一次
    this.autoCheckTimer = setInterval(() => {
      const newTheme = this.getAutoTheme();
      const currentActualTheme = this.currentTheme === ThemeType.AUTO ? 
        this.getAutoTheme() : this.currentTheme;
      
      if (newTheme !== currentActualTheme) {
        this.applyTheme();
        this.notifyListeners();
      }
    }, 60000);
  }

  /**
   * 停止自动检查
   */
  stopAutoCheck() {
    if (this.autoCheckTimer) {
      clearInterval(this.autoCheckTimer);
      this.autoCheckTimer = null;
    }
  }

  /**
   * 生成主题CSS变量
   */
  generateCSSVariables() {
    const colors = this.getColors();
    return `
      --primary: ${colors.primary};
      --primary-dark: ${colors.primaryDark};
      --secondary: ${colors.secondary};
      --background: ${colors.background};
      --background-card: ${colors.backgroundCard};
      --text: ${colors.text};
      --text-secondary: ${colors.textSecondary};
      --text-tertiary: ${colors.textTertiary};
      --border: ${colors.border};
      --success: ${colors.success};
      --warning: ${colors.warning};
      --error: ${colors.error};
      --info: ${colors.info};
    `;
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      currentTheme: this.currentTheme,
      actualTheme: this.currentTheme === ThemeType.AUTO ? 
        this.getAutoTheme() : this.currentTheme,
      colors: this.getColors(),
      config: ThemeConfig
    };
  }
}

// 导出单例
const themeManager = new ThemeManager();

module.exports = {
  ThemeManager,
  themeManager,
  ThemeType,
  ThemeConfig
};
