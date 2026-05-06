// utils/gestureHandler.js - 手势交互处理工具
// 提供常见手势的识别和处理

/**
 * 手势类型
 */
const GestureType = {
  TAP: 'tap',           // 点击
  LONG_PRESS: 'longpress',  // 长按
  SWIPE_LEFT: 'swipeleft',  // 左滑
  SWIPE_RIGHT: 'swiperight', // 右滑
  SWIPE_UP: 'swipeup',   // 上滑
  SWIPE_DOWN: 'swipedown', // 下滑
  PINCH: 'pinch',       // 缩放
  ROTATE: 'rotate'      // 旋转
};

/**
 * 手势配置
 */
const DEFAULT_CONFIG = {
  tapThreshold: 10,       // 点击判定阈值（像素）
  longPressDelay: 500,    // 长按延迟（毫秒）
  swipeThreshold: 50,     // 滑动判定阈值（像素）
  swipeVelocity: 0.3,    // 滑动速度阈值
  pinchScaleThreshold: 0.1,  // 缩放阈值
  rotateThreshold: 5     // 旋转阈值（度）
};

/**
 * 手势处理器
 */
class GestureHandler {
  constructor(element, options = {}) {
    this.element = element;
    this.config = { ...DEFAULT_CONFIG, ...options };
    
    // 手势状态
    this.isTouching = false;
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.longPressTimer = null;
    
    // 回调函数
    this.callbacks = {};
    
    // 绑定this
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    
    // 初始化
    this.init();
  }

  /**
   * 初始化
   */
  init() {
    if (!this.element) return;
    
    this.element.addEventListener('touchstart', this.onTouchStart);
    this.element.addEventListener('touchmove', this.onTouchMove);
    this.element.addEventListener('touchend', this.onTouchEnd);
    this.element.addEventListener('touchcancel', this.onTouchEnd);
    
    // 鼠标事件（用于PC调试）
    this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.element.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.element.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  /**
   * 触摸开始
   */
  onTouchStart(e) {
    if (e.touches.length > 1) {
      // 多指操作，取消当前手势
      this.cancelLongPress();
      return;
    }
    
    const touch = e.touches[0];
    this.isTouching = true;
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.lastX = touch.clientX;
    this.lastY = touch.clientY;
    this.startTime = Date.now();
    
    // 开始长按计时
    this.startLongPress(e);
  }

  /**
   * 触摸移动
   */
  onTouchMove(e) {
    if (!this.isTouching) return;
    
    if (e.touches.length > 1) {
      // 多指操作，处理缩放和旋转
      this.handleMultiTouch(e);
      return;
    }
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - this.lastX;
    const deltaY = touch.clientY - this.lastY;
    
    this.lastX = touch.clientX;
    this.lastY = touch.clientY;
    
    // 触发拖动回调
    this.trigger('drag', {
      deltaX,
      deltaY,
      totalX: touch.clientX - this.startX,
      totalY: touch.clientY - this.startY
    });
    
    // 取消长按
    this.cancelLongPress();
  }

  /**
   * 触摸结束
   */
  onTouchEnd(e) {
    if (!this.isTouching) return;
    
    this.cancelLongPress();
    
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const duration = Date.now() - this.startTime;
    
    // 计算滑动距离
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // 判断手势类型
    if (distance < this.config.tapThreshold) {
      // 点击
      this.trigger(GestureType.TAP, { x: endX, y: endY, duration });
    } else if (distance > this.config.swipeThreshold || 
               (duration < 300 && distance > this.config.swipeThreshold * 0.5)) {
      // 滑动
      this.handleSwipe(deltaX, deltaY, duration);
    }
    
    this.isTouching = false;
  }

  /**
   * 处理滑动
   */
  handleSwipe(deltaX, deltaY, duration) {
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / duration;
    
    // 判断滑动方向
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平滑动
      if (deltaX > this.config.swipeThreshold || 
          (velocity > this.config.swipeVelocity && deltaX > 0)) {
        this.trigger(GestureType.SWIPE_RIGHT, { deltaX, velocity });
      } else if (deltaX < -this.config.swipeThreshold || 
                 (velocity > this.config.swipeVelocity && deltaX < 0)) {
        this.trigger(GestureType.SWIPE_LEFT, { deltaX, velocity });
      }
    } else {
      // 垂直滑动
      if (deltaY > this.config.swipeThreshold || 
          (velocity > this.config.swipeVelocity && deltaY > 0)) {
        this.trigger(GestureType.SWIPE_DOWN, { deltaY, velocity });
      } else if (deltaY < -this.config.swipeThreshold || 
                 (velocity > this.config.swipeVelocity && deltaY < 0)) {
        this.trigger(GestureType.SWIPE_UP, { deltaY, velocity });
      }
    }
  }

  /**
   * 处理多指触控（缩放/旋转）
   */
  handleMultiTouch(e) {
    if (e.touches.length < 2) return;
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    // 计算距离和角度
    const currentDistance = this.getDistance(touch1, touch2);
    const currentAngle = this.getAngle(touch1, touch2);
    
    if (this.lastDistance) {
      // 缩放
      const scale = currentDistance / this.lastDistance;
      if (Math.abs(scale - 1) > this.config.pinchScaleThreshold) {
        this.trigger(GestureType.PINCH, { scale, distance: currentDistance });
      }
      
      // 旋转
      const rotate = currentAngle - this.lastAngle;
      if (Math.abs(rotate) > this.config.rotateThreshold) {
        this.trigger(GestureType.ROTATE, { rotate, angle: currentAngle });
      }
    }
    
    this.lastDistance = currentDistance;
    this.lastAngle = currentAngle;
  }

  /**
   * 计算两点距离
   */
  getDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 计算角度
   */
  getAngle(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }

  /**
   * 开始长按
   */
  startLongPress(e) {
    this.longPressTimer = setTimeout(() => {
      if (this.isTouching) {
        this.trigger(GestureType.LONG_PRESS, {
          x: this.startX,
          y: this.startY
        });
      }
    }, this.config.longPressDelay);
  }

  /**
   * 取消长按
   */
  cancelLongPress() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  /**
   * 鼠标按下（PC调试用）
   */
  onMouseDown(e) {
    this.isTouching = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.startTime = Date.now();
    this.startLongPress(e);
  }

  /**
   * 鼠标移动
   */
  onMouseMove(e) {
    if (!this.isTouching) return;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.cancelLongPress();
  }

  /**
   * 鼠标释放
   */
  onMouseUp(e) {
    if (!this.isTouching) return;
    this.cancelLongPress();
    this.isTouching = false;
  }

  /**
   * 注册回调
   */
  on(gesture, callback) {
    if (!this.callbacks[gesture]) {
      this.callbacks[gesture] = [];
    }
    this.callbacks[gesture].push(callback);
    return this;
  }

  /**
   * 触发回调
   */
  trigger(gesture, data) {
    const callbacks = this.callbacks[gesture];
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  /**
   * 移除回调
   */
  off(gesture, callback) {
    if (!this.callbacks[gesture]) return;
    
    if (callback) {
      this.callbacks[gesture] = this.callbacks[gesture].filter(cb => cb !== callback);
    } else {
      delete this.callbacks[gesture];
    }
  }

  /**
   * 销毁
   */
  destroy() {
    this.cancelLongPress();
    if (this.element) {
      this.element.removeEventListener('touchstart', this.onTouchStart);
      this.element.removeEventListener('touchmove', this.onTouchMove);
      this.element.removeEventListener('touchend', this.onTouchEnd);
      this.element.removeEventListener('touchcancel', this.onTouchEnd);
    }
    this.callbacks = {};
  }
}

/**
 * 创建手势处理器（小程序兼容）
 */
function createGestureHandler(element, options) {
  return new GestureHandler(element, options);
}

/**
 * 小程序手势识别器
 */
class MiniprogramGesture {
  constructor(page) {
    this.page = page;
    this.touches = {};
    this.lastTouch = null;
  }

  /**
   * 绑定页面手势
   */
  bindPage(page) {
    page.onTouchStart = this.onTouchStart.bind(this);
    page.onTouchMove = this.onTouchMove.bind(this);
    page.onTouchEnd = this.onTouchEnd.bind(this);
    page.onTouchCancel = this.onTouchEnd.bind(this);
  }

  onTouchStart(e) {
    this.touches = e.touches;
    this.lastTouch = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
  }

  onTouchMove(e) {
    this.touches = e.touches;
  }

  onTouchEnd(e) {
    this.touches = {};
    this.lastTouch = null;
  }
}

module.exports = {
  GestureHandler,
  MiniprogramGesture,
  createGestureHandler,
  GestureType,
  DEFAULT_CONFIG
};
