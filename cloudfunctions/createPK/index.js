// cloudfunctions/createPK/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { playerA, total, streak } = event;
  
  try {
    // 创建PK房间
    const pkId = `pk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.collection('pk').doc(pkId).set({
      data: {
        _id: pkId,
        playerA: {
          openId: playerA.openId,
          nickName: playerA.nickName,
          avatarUrl: playerA.avatarUrl,
          total: total || 0,
          streak: streak || 0
        },
        playerB: null,
        winner: null,
        status: 'waiting', // waiting, ongoing, finished
        createdAt: db.serverDate(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时过期
      }
    });
    
    return { success: true, pkId };
  } catch (err) {
    return { success: false, error: err.message };
  }
};