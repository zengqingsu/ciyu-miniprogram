// 云函数：login
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  return {
    openId: wxContext.OPENID,
    appId: wxContext.APPID
  };
};