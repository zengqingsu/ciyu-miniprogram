// utils/deviceAdapter.js - 设备自适应与屏幕适配
// 处理不同设备的屏幕适配、折叠屏、平板横屏等

/**
 * 设备类型
 */
const DeviceType = {
  PHONE: 'phone',
  TABLET: 'tablet',
  FOLDABLE: 'foldable'
};

/**
 * 屏幕方向
 */
const Orientation = {
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape'
};

/**
 * 设备适配器
 */
class DeviceAdapter {
  constructor() {
    this.info = null;
    this.listeners = [];
  }

  /**
   * 初始化设备信息
   */
  init() {
    this.info = this.getDeviceInfo();
    this.setupResizeListener();
    console.log('设备适配器初始化:', this.info);
    return this.info;
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo() {
    const systemInfo = wx.getSystemInfoSync();
    const windowInfo = wx.getWindowInfoSync();
    
    // 判断设备类型
    const deviceType = this.judgeDeviceType(systemInfo);
    
    // 判断屏幕方向
    const orientation = systemInfo.windowWidth > systemInfo.windowHeight ? 
      Orientation.LANDSCAPE : Orientation.PORTRAIT;
    
    // 判断是否为折叠屏
    const foldableInfo = this.getFoldableInfo(systemInfo);
    
    // 计算屏幕比例
    const pixelRatio = systemInfo.pixelRatio;
    const screenWidth = systemInfo.screenWidth;
    const screenHeight = systemInfo.screenHeight;
    
    // 计算安全区域
    const safeArea = this.getSafeArea(systemInfo, windowInfo);
    
    // 计算rpx转换比例
    const rpxRatio = screenWidth / 750;
    
    return {
      // 基础信息
      brand: systemInfo.brand,
      model: systemInfo.model,
      system: systemInfo.system,
      platform: systemInfo.platform,
      language: systemInfo.language,
      version: systemInfo.version,
      
      // 屏幕尺寸
      screenWidth,
      screenHeight,
      windowWidth: systemInfo.windowWidth,
      windowHeight: systemInfo.windowHeight,
      statusBarHeight: systemInfo.statusBarHeight,
      titleBarHeight: systemInfo.titleBarHeight || 44,
      
      // 像素比
      pixelRatio,
      
      // 设备类型
      deviceType,
      isTablet: deviceType === DeviceType.TABLET,
      isPhone: deviceType === DeviceType.PHONE,
      isFoldable: deviceType === DeviceType.FOLDABLE,
      
      // 屏幕方向
      orientation,
      isLandscape: orientation === Orientation.LANDSCAPE,
      isPortrait: orientation === Orientation.PORTRAIT,
      
      // 折叠屏信息
      foldable: foldableInfo,
      
      // 安全区域
      safeArea,
      
      // rpx比例
      rpxRatio
    };
  }

  /**
   * 判断设备类型
   */
  judgeDeviceType(systemInfo) {
    const model = systemInfo.model.toLowerCase();
    const screenWidth = systemInfo.screenWidth;
    
    // 平板判断
    const tabletPatterns = ['ipad', 'tablet', 'matepad', 'pad'];
    for (const pattern of tabletPatterns) {
      if (model.includes(pattern)) {
        return DeviceType.TABLET;
      }
    }
    
    // 折叠屏判断
    const foldablePatterns = ['fold', 'flip', 'mix fold', 'find n', 'find n2', 'find n3'];
    for (const pattern of foldablePatterns) {
      if (model.includes(pattern)) {
        return DeviceType.FOLDABLE;
      }
    }
    
    // 大屏手机也算小平板
    if (screenWidth >= 600) {
      return DeviceType.TABLET;
    }
    
    return DeviceType.PHONE;
  }

  /**
   * 获取折叠屏信息
   */
  getFoldableInfo(systemInfo) {
    const model = systemInfo.model.toLowerCase();
    
    // 已知的折叠屏型号
    const foldableModels = {
      'fold': { type: 'fold', outerWidth: 840, outerHeight: 2260 },
      'flip': { type: 'flip', outerWidth: 840, outerHeight: 2700 },
      'mix fold': { type: 'fold', outerWidth: 840, outerHeight: 2000 },
      'find n': { type: 'fold', outerWidth: 768, outerHeight: 1792 },
      'find n2': { type: 'fold', outerWidth: 768, outerHeight: 1792 },
      'find n3': { type: 'fold', outerWidth: 768, outerHeight: 1792 }
    };
    
    for (const [key, info] of Object.entries(foldableModels)) {
      if (model.includes(key)) {
        return {
          isFoldable: true,
          type: info.type,
          // 微信暂未提供折叠状态 API，可通过其他方式判断
          isFolded: null,
          isUnfolded: null
        };
      }
    }
    
    return {
      isFoldable: false,
      type: null,
      isFolded: null,
      isUnfolded: null
    };
  }

  /**
   * 获取安全区域
   */
  getSafeArea(systemInfo, windowInfo) {
    const safeArea = windowInfo.safeArea;
    
    if (!safeArea) {
      // 兼容处理
      return {
        top: systemInfo.statusBarHeight || 0,
        right: systemInfo.screenWidth,
        bottom: systemInfo.screenHeight,
        left: 0,
        width: systemInfo.windowWidth,
        height: systemInfo.windowHeight
      };
    }
    
    return {
      top: safeArea.top,
      right: safeArea.right,
      bottom: safeArea.bottom,
      left: safeArea.left,
      width: safeArea.right - safeArea.left,
      height: safeArea.bottom - safeArea.top
    };
  }

  /**
   * 设置屏幕旋转监听
   */
  setupResizeListener() {
    // 微信小程序可通过 onResize 监听
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      if (currentPage.onResize) {
        const originalOnResize = currentPage.onResize.bind(currentPage);
        currentPage.onResize = (res) => {
          // 更新设备信息
          this.info = this.getDeviceInfo();
          this.notifyListeners();
          
          // 调用原始onResize
          originalOnResize(res);
        };
      }
    }
  }

  /**
   * 注册变化监听器
   */
  onChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * 通知监听器
   */
  notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb(this.info);
      } catch (e) {
        console.error('设备变化监听器错误:', e);
      }
    });
  }

  /**
   * 获取布局配置
   */
  getLayoutConfig() {
    const info = this.info || this.getDeviceInfo();
    
    // 基础布局配置
    const config = {
      // 间距
      padding: 30 * info.rpxRatio,
      margin: 20 * info.rpxRatio,
      gap: 16 * info.rpxRatio,
      
      // 字体大小
      fontSize: {
        xs: 24 * info.rpxRatio,
        sm: 28 * info.rpxRatio,
        md: 32 * info.rpxRatio,
        lg: 36 * info.rpxRatio,
        xl: 44 * info.rpxRatio,
        xxl: 56 * info.rpxRatio
      },
      
      // 圆角
      borderRadius: {
        sm: 8 * info.rpxRatio,
        md: 16 * info.rpxRatio,
        lg: 24 * info.rpxRatio,
        full: 9999 * info.rpxRatio
      },
      
      // 卡片宽度
      cardWidth: info.isLandscape && info.isTablet ? 
        (info.windowWidth - 60 * info.rpxRatio) / 2 : // 平板横屏双列
        info.windowWidth - 30 * info.rpxRatio, // 其他单列
    };
    
    // 平板横屏特殊布局
    if (info.isLandscape && info.isTablet) {
      config.layoutMode = 'grid';
      config.gridColumns = 2;
      config.gridGap = 20 * info.rpxRatio;
    } else {
      config.layoutMode = 'list';
      config.gridColumns = 1;
    }
    
    // 折叠屏特殊处理
    if (info.isFoldable) {
      config.isAdaptive = true;
      config.minContentWidth = 300 * info.rpxRatio;
    }
    
    return config;
  }

  /**
   * 获取图片尺寸
   */
  getImageSize(options = {}) {
    const { width, height, mode = 'aspectFill' } = options;
    const info = this.info || this.getDeviceInfo();
    
    // 平板使用更大图片
    if (info.isTablet) {
      return {
        width: (width || 400) * 1.5,
        height: (height || 300) * 1.5,
        mode
      };
    }
    
    return { width, height, mode };
  }

  /**
   * 获取栅格配置（用于平板横屏）
   */
  getGridConfig(columns = 2) {
    const info = this.info || this.getDeviceInfo();
    
    if (info.isLandscape && info.isTablet) {
      const totalGap = 20 * info.rpxRatio;
      const columnWidth = (info.windowWidth - totalGap * (columns + 1)) / columns;
      
      return {
        columns,
        columnWidth,
        gap: totalGap,
        padding: 20 * info.rpxRatio
      };
    }
    
    return {
      columns: 1,
      columnWidth: info.windowWidth - 30 * info.rpxRatio,
      gap: 16 * info.rpxRatio,
      padding: 15 * info.rpxRatio
    };
  }

  /**
   * 转换为rpx
   */
  toRpx(px) {
    const info = this.info || this.getDeviceInfo();
    return px / info.rpxRatio;
  }

  /**
   * 转换为px
   */
  toPx(rpx) {
    const info = this.info || this.getDeviceInfo();
    return rpx * info.rpxRatio;
  }

  /**
   * 格式化尺寸（自动选择rpx或px）
   */
  formatSize(value, useRpx = true) {
    if (useRpx) {
      return `${value}rpx`;
    }
    return `${this.toPx(value)}px`;
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      info: this.info || this.getDeviceInfo(),
      layout: this.getLayoutConfig()
    };
  }
}

// 导出单例
const deviceAdapter = new DeviceAdapter();

module.exports = {
  DeviceAdapter,
  deviceAdapter,
  DeviceType,
  Orientation
};
