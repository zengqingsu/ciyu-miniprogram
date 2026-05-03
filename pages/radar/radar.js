// pages/radar/radar.js
const chartData = require('../../utils/chartData.js');

Page({
  data: {
    radarData: null,
    stats: null,
    isLoading: true,
    isCanvasReady: false
  },

  onLoad() {
    this.loadRadarData();
  },

  onReady() {
    setTimeout(() => {
      this.drawRadar();
    }, 300);
  },

  loadRadarData() {
    this.setData({ isLoading: true });
    
    try {
      const radarData = chartData.getVocabularyRadar();
      const stats = chartData.getDailyStats();
      
      this.setData({
        radarData: radarData,
        stats: stats,
        isLoading: false
      });
      
      // 等待渲染完成后再绘制
      setTimeout(() => {
        this.drawRadar();
      }, 300);
    } catch (e) {
      this.setData({ isLoading: false });
      console.error('加载雷达图数据失败:', e);
    }
  },

  drawRadar() {
    const that = this;
    const radarData = this.data.radarData;
    
    if (!radarData || !radarData.datasets || !radarData.datasets[0]) {
      return;
    }

    wx.createSelectorQuery()
      .select('#radarCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) {
          console.error('获取Canvas失败');
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
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 40;

        const labels = radarData.labels;
        const data = radarData.datasets[0].data;
        const angleStep = (2 * Math.PI) / labels.length;

        // 绘制背景网格
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 1;
        
        for (let r = 1; r <= 4; r++) {
          const levelRadius = (radius / 4) * r;
          ctx.beginPath();
          for (let i = 0; i <= labels.length; i++) {
            const angle = (i * angleStep) - Math.PI / 2;
            const x = centerX + Math.cos(angle) * levelRadius;
            const y = centerY + Math.sin(angle) * levelRadius;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          ctx.stroke();
          
          // 绘制标签
          ctx.fillStyle = '#999';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${r * 25}%`, centerX + levelRadius + 15, centerY + 4);
        }

        // 绘制数据区域
        ctx.beginPath();
        ctx.fillStyle = 'rgba(64, 158, 255, 0.3)';
        ctx.strokeStyle = '#409eff';
        ctx.lineWidth = 2;
        
        data.forEach((value, i) => {
          const angle = (i * angleStep) - Math.PI / 2;
          const dataRadius = (value / 100) * radius;
          const x = centerX + Math.cos(angle) * dataRadius;
          const y = centerY + Math.sin(angle) * dataRadius;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 绘制数据点
        ctx.fillStyle = '#409eff';
        data.forEach((value, i) => {
          const angle = (i * angleStep) - Math.PI / 2;
          const dataRadius = (value / 100) * radius;
          const x = centerX + Math.cos(angle) * dataRadius;
          const y = centerY + Math.sin(angle) * dataRadius;
          
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
        });

        // 绘制标签
        ctx.fillStyle = '#333';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        labels.forEach((label, i) => {
          const angle = (i * angleStep) - Math.PI / 2;
          const labelRadius = radius + 25;
          const x = centerX + Math.cos(angle) * labelRadius;
          const y = centerY + Math.sin(angle) * labelRadius;
          
          ctx.fillText(label, x, y);
        });
        
        that.setData({ isCanvasReady: true });
      });
  },

  onShareAppMessage() {
    return {
      title: `我的词汇掌握度雷达图 - 词途`,
      path: '/pages/radar/radar'
    };
  }
});