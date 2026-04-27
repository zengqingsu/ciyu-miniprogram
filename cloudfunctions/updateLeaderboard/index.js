// cloudfunctions/updateLeaderboard/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { openId, nickName, avatarUrl, total, streak, today } = event;
  
  try {
    // 获取当前排行榜数据
    const leaderboardDoc = await db.collection('leaderboard').doc('global').get();
    
    let users = leaderboardDoc.data.users || [];
    
    // 更新用户数据
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
    
    // 按不同维度排序
    const sortedByTotal = [...users].sort((a, b) => b.total - a.total).slice(0, 100);
    const sortedByStreak = [...users].sort((a, b) => b.streak - a.streak).slice(0, 100);
    const sortedByToday = [...users].sort((a, b) => b.today - a.today).slice(0, 100);
    
    // 更新数据库
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
    // 首次创建排行榜
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