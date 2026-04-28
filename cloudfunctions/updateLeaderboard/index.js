// cloudfunctions/updateLeaderboard/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  // 优先使用 wxContext 的 OPENID，确保数据归属正确
  const openId = wxContext.OPENID;
  const { nickName, avatarUrl, total, streak, today } = event;
  
  try {
    const leaderboardDoc = await db.collection('leaderboard').doc('global').get();
    
    let users = leaderboardDoc.data.users || [];
    
    const userIndex = users.findIndex(u => u.openId === openId);
    
    const userData = {
      openId,
      nickName: nickName || '匿名用户',
      avatarUrl: avatarUrl || '',
      total: total || 0,
      streak: streak || 0,
      today: today || 0,
      updatedAt: db.serverDate()
    };
    
    if (userIndex > -1) {
      users[userIndex] = { ...users[userIndex], ...userData };
    } else {
      users.push(userData);
    }
    
    const sortedByTotal = [...users].sort((a, b) => b.total - a.total).slice(0, 100);
    const sortedByStreak = [...users].sort((a, b) => b.streak - a.streak).slice(0, 100);
    const sortedByToday = [...users].sort((a, b) => b.today - a.today).slice(0, 100);
    
    await db.collection('leaderboard').doc('global').set({
      data: {
        users,
        sortedByTotal,
        sortedByStreak,
        sortedByToday,
        updatedAt: db.serverDate()
      }
    });
    
    return {
      success: true,
      ranking: {
        total: sortedByTotal.findIndex(u => u.openId === openId) + 1,
        streak: sortedByStreak.findIndex(u => u.openId === openId) + 1,
        today: sortedByToday.findIndex(u => u.openId === openId) + 1
      }
    };
  } catch (err) {
    if (err.code === 'DOC_NOT_EXIST') {
      const userData = {
        openId,
        nickName: nickName || '匿名用户',
        avatarUrl: avatarUrl || '',
        total: total || 0,
        streak: streak || 0,
        today: today || 0,
        updatedAt: db.serverDate()
      };
      
      await db.collection('leaderboard').doc('global').set({
        data: {
          users: [userData],
          sortedByTotal: [userData],
          sortedByStreak: [userData],
          sortedByToday: [userData],
          updatedAt: db.serverDate()
        }
      });
      
      return { success: true, ranking: { total: 1, streak: 1, today: 1 } };
    }
    
    return { success: false, error: err.message };
  }
};