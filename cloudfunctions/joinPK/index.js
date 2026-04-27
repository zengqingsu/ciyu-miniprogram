// cloudfunctions/joinPK/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const { pkId, playerB, total, streak } = event;
  
  try {
    const pkDoc = await db.collection('pk').doc(pkId).get();
    
    if (!pkDoc.data) {
      return { success: false, error: 'PK不存在' };
    }
    
    if (pkDoc.data.status !== 'waiting') {
      return { success: false, error: 'PK已开始或已结束' };
    }
    
    if (pkDoc.data.playerB) {
      return { success: false, error: '对手已加入' };
    }
    
    // 更新PK房间
    await db.collection('pk').doc(pkId).update({
      data: {
        playerB: {
          openId: playerB.openId,
          nickName: playerB.nickName,
          avatarUrl: playerB.avatarUrl,
          total: total || 0,
          streak: streak || 0
        },
        status: 'ongoing'
      }
    });
    
    // 判断胜负
    const pa = pkDoc.data.playerA;
    const pb = playerB;
    let winner = null;
    
    if (pa.total > pb.total) winner = 'playerA';
    else if (pb.total > pa.total) winner = 'playerB';
    
    if (winner) {
      await db.collection('pk').doc(pkId).update({
        data: { winner }
      });
    }
    
    return { success: true, winner };
  } catch (err) {
    return { success: false, error: err.message };
  }
};