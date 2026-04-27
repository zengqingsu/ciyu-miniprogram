// components/share-card/share-card.js
Component({
  properties: {
    type: {
      type: String,
      value: 'achievement' // achievement, ranking, pk
    },
    data: {
      type: Object,
      value: {}
    }
  },

  data: {
    canvasWidth: 300,
    canvasHeight: 400,
    generatedImage: ''
  },

  lifetimes: {
    attached() {
      this.generateCard();
    }
  },

  methods: {
    generateCard() {
      const ctx = wx.createCanvasContext('share-card-canvas', this);
      
      // 背景
      ctx.setFillStyle('#667eea');
      ctx.fillRect(0, 0, this.data.canvasWidth, this.data.canvasHeight);
      
      // 卡片背景
      ctx.setFillStyle('#ffffff');
      this.roundRect(ctx, 20, 20, 260, 360, 16);
      
      const { data } = this.data;
      
      if (this.data.type === 'achievement') {
        // 成就标题
        ctx.setFillStyle('#ffd700');
        ctx.setFontSize(28);
        ctx.setTextAlign('center');
        ctx.fillText('🎉 学习成就', 150, 80);
        
        // 连续天数
        ctx.setFillStyle('#667eea');
        ctx.setFontSize(48);
        ctx.fillText(data.streak || 0, 150, 160);
        ctx.setFontSize(16);
        ctx.fillText('连续学习天数', 150, 190);
        
        // 总学习数
        ctx.setFillStyle('#333');
        ctx.setFontSize(32);
        ctx.fillText(data.total || 0, 150, 250);
        ctx.setFontSize(14);
        ctx.fillText('累计学习单词', 150, 280);
        
        // 小程序码提示
        ctx.setFillStyle('#999');
        ctx.setFontSize(12);
        ctx.fillText('词途小程序 - 每日进步', 150, 350);
      }
      
      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: 'share-card-canvas',
          canvasType: '2d',
          success: (res) => {
            this.setData({ generatedImage: res.tempFilePath });
          },
          fail: console.error
        }, this);
      });
    },

    roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
    },

    onShareAppMessage() {
      const { data } = this.data;
      return {
        title: `我已经连续学习${data.streak || 0}天啦！`,
        path: '/pages/index/index',
        imageUrl: this.data.generatedImage
      };
    },

    shareToFriend() {
      if (!this.data.generatedImage) {
        wx.showToast({ title: '生成中...', icon: 'none' });
        return;
      }
      
      wx.shareImageToFriend({
        imageUrl: this.data.generatedImage,
        success: () => {
          wx.showToast({ title: '分享成功', icon: 'success' });
        },
        fail: console.error
      });
    }
  }
});