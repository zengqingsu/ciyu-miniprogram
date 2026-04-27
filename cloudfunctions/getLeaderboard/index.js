// cloudfunctions/getLeaderboard/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const { type = 'total', limit = 20 } = event;
  
  try {
    const leaderboardDoc = await db.collection('leaderboard').doc('global').get();
    
    let list = [];
    switch (type) {
      case 'streak':
        list = leaderboardDoc.data.sortedByStreak || [];
        break;
      case 'today':
        list = leaderboardDoc.data.sortedByToday || [];
        break;
      default:
        list = leaderboardDoc.data.sortedByTotal || [];
    }
    
    return {
      success: true,
      list: list.slice(0, limit),
      totalCount: list.length,
      updatedAt: leaderboardDoc.data.updatedAt
    };
  } catch (err) {
    return { 
      success: false, 
      error: err.message,
      list: [],
      totalCount: 0
    };
  }
};