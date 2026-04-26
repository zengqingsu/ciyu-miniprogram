// 云函数：getUserData
const cloud = require('wx-server-sdk');
cloud.init();

const db = cloud.database();
const _ = db.command;

/**
 * 获取用户云端数据
 * 下行：从云端拉取数据
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;
  
  try {
    // 查询用户数据
    const result = await db.collection('userData').where({
      _openId: openId
    }).get();
    
    if (result.data && result.data.length > 0) {
      return { 
        success: true, 
        data: result.data[0],
        message: '获取成功' 
      };
    } else {
      return { 
        success: false, 
        message: '无云端数据' 
      };
    }
  } catch (err) {
    return { success: false, message: err.message };
  }
};