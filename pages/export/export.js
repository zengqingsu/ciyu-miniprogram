// pages/export/export.js
// 数据导出页面 - 词途小程序 v1.8

const offlineStorage = require('../../utils/offlineStorage.js');
const syncManager = require('../../utils/syncManager.js');

Page({
  data: {
    exportData: null,
    stats: {
      words: 0,
      records: 0,
      progress: 0,
      reviews: 0
    },
    lastSyncTime: '',
    pendingChanges: 0,
    isExporting: false
  },

  onLoad() {
    this.loadExportData();
  },

  onShow() {
    this.loadExportData();
  },

  // 加载导出数据
  loadExportData() {
    const data = offlineStorage.exportAllData();
    
    const stats = {
      words: data.wordsDatabase?.words?.length || 0,
      records: data.learningDatabase?.records?.length || 0,
      progress: Object.keys(data.wordProgress || {}).length,
      reviews: data.reviewSchedule?.schedule?.length || 0
    };

    const syncStatus = syncManager.getStatus();
    
    this.setData({
      exportData: data,
      stats,
      lastSyncTime: syncStatus.lastSyncTime ? 
        new Date(syncStatus.lastSyncTime).toLocaleString() : '从未同步',
      pendingChanges: syncStatus.pendingChanges
    });
  },

  // 导出为JSON文件
  exportToJSON() {
    this.setData({ isExporting: true });
    
    try {
      const data = offlineStorage.exportAllData();
      const jsonStr = JSON.stringify(data, null, 2);
      
      // 保存到本地存储临时文件
      const fileName = `wordrail_export_${Date.now()}.json`;
      wx.setStorageSync('exportTempFile', jsonStr);
      
      // 写入文件
      const fs = wx.getFileSystemManager();
      const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
      
      fs.writeFile({
        filePath: filePath,
        data: jsonStr,
        encoding: 'utf8',
        success: () => {
          // 打开文件
          wx.openDocument({
            filePath: filePath,
            success: () => {
              wx.showToast({
                title: '导出成功',
                icon: 'success'
              });
            },
            fail: (err) => {
              console.error('打开文件失败:', err);
              this.copyToClipboard(jsonStr);
            }
          });
        },
        fail: (err) => {
          console.error('写入文件失败:', err);
          this.copyToClipboard(jsonStr);
        }
      });
    } catch (err) {
      wx.showToast({
        title: '导出失败: ' + err.message,
        icon: 'none'
      });
    } finally {
      this.setData({ isExporting: false });
    }
  },

  // 复制到剪贴板
  copyToClipboard(jsonStr) {
    wx.setClipboardData({
      data: jsonStr.substring(0, 10000),
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  },

  // 分享给朋友
  onShareAppMessage() {
    const stats = this.data.stats;
    return {
      title: `词途学习数据：${stats.words}词 · ${stats.records}条记录`,
      path: '/pages/index/index'
    };
  },

  // 同步数据
  async onSync() {
    wx.showLoading({ title: '同步中...' });
    
    try {
      const result = await syncManager.triggerSync();
      
      if (result.success) {
        wx.showToast({
          title: `同步成功 ${result.synced} 条`,
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: result.reason || '同步失败',
          icon: 'none'
        });
      }
    } catch (err) {
      wx.showToast({
        title: '同步失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
      this.loadExportData();
    }
  },

  // 清除数据
  onClearData() {
    wx.showModal({
      title: '清除所有数据',
      content: '确定要清除所有本地数据吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          offlineStorage.clearAllOfflineData();
          
          wx.showToast({
            title: '数据已清除',
            icon: 'success'
          });
          
          this.loadExportData();
        }
      }
    });
  }
});
