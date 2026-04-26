// 云函数：syncUserData
const cloud = require('wx-server-sdk');
cloud.init();

const db = cloud.database();
const _ = db.command;

/**
 * 同步用户学习数据
 * 上行：上传本地数据到云端
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;
  
  // 接收的客户端数据
  const userData = event.userData;
  
  if (!userData) {
    return { success: false, message: '无数据' };
  }
  
  try {
    // 查询是否已有数据
    const existing = await db.collection('userData').where({
      _openId: openId
    }).get();
    
    const now = Date.now();
    userData.lastSyncTime = now;
    userData._openId = openId;
    userData._updateTime = now;
    
    if (existing.data && existing.data.length > 0) {
      // 更新现有数据
      await db.collection('userData').doc(existing.data[0]._id).update({
        data: userData
      });
    } else {
      // 创建新数据
      userData._createTime = now;
      await db.collection('userData').add({
        data: userData
      });
    }
    
    return { success: true, message: '同步成功' };
  } catch (err) {
    return { success: false, message: err.message };
  }
};