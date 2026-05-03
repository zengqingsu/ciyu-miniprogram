// pages/trend/trend.js
const chartData = require('../../utils/chartData.js');

Page({
  data: {
    trendData: null,
    stats: null,
    days: 7,
    isLoading: true
  },

  onLoad(options) {
    const days = parseInt(options.days) || 7;
    this.setData({ days });
    this.loadTrendData(days);
  },

  onShow() {
    this.loadTrendData(this.data.days);
  },

  loadTrendData(days = 7) {
    this.setData({ isLoading: true });
    
    try {
      const trendData = chartData.getStudyTimeTrend(days);
      const stats = chartData.getDailyStats();
      
      this.setData({
        trendData: trendData,
        stats: stats,
        isLoading: false
      });
      
      // 等待渲染完成后再绘制
      setTimeout(() => {
        this.drawTrendChart();
      }, 300);
    } catch (e) {
      this.setData({ isLoading: false });
      console.error('加载趋势数据失败:', e);
    }
  },

  changeDays(e) {
    const days = e.currentTarget.dataset.days;
    this.setData({ days });
    this.loadTrendData(days);
  },

  onReady() {
    this.drawTrendChart();
  },

  drawTrendChart() {
    const that = this;
    const trendData = this.data.trendData;
    
    if (!trendData || trendData.length === 0) {
      return;
    }

    wx.createSelectorQuery()
      .select('#trendCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) {
          return;
        }

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        const width = res[0].width;
        const height = res[0].height;
        const padding = { top: 40, right: 30, bottom: 60, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // 获取最大、最小值
        const values = trendData.map(d => d.minutes);
        const maxValue = Math.max(...values, 60);
        const minValue = 0;

        // 绘制坐标轴
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'right';

        // Y轴刻度
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
          const y = padding.top + (chartHeight / ySteps) * i;
          const value = Math.round(maxValue - (maxValue / ySteps) * i);
          
          ctx.beginPath();
          ctx.moveTo(padding.left, y);
          ctx.lineTo(width - padding.right, y);
          ctx.stroke();
          
          ctx.fillText(`${value}`, padding.left - 8, y + 4);
        }

        // X轴标签
        ctx.textAlign = 'center';
        trendData.forEach((d, i) => {
          const x = padding.left + (chartWidth / (trendData.length - 1)) * i;
          ctx.fillText(d.label, x, height - padding.bottom + 20);
        });

        // 绘制折线
        ctx.beginPath();
        ctx.strokeStyle = '#409eff';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        
        trendData.forEach((d, i) => {
          const x = padding.left + (chartWidth / (trendData.length - 1)) * i;
          const y = padding.top + chartHeight - ((d.minutes / maxValue) * chartHeight);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        ctx.stroke();

        // 绘制数据点
        ctx.fillStyle = '#409eff';
        trendData.forEach((d, i) => {
          const x = padding.left + (chartWidth / (trendData.length - 1)) * i;
          const y = padding.top + chartHeight - ((d.minutes / maxValue) * chartHeight);
          
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fill();
        });

        // 绘制数据标签
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#666';
        trendData.forEach((d, i) => {
          const x = padding.left + (chartWidth / (trendData.length - 1)) * i;
          const y = padding.top + chartHeight - ((d.minutes / maxValue) * chartHeight) - 12;
          ctx.fillText(`${d.minutes}分钟`, x, y);
        });
      });
  },

  onShareAppMessage() {
    return {
      title: `我的学习趋势 - 词途`,
      path: '/pages/trend/trend'
    };
  }
});