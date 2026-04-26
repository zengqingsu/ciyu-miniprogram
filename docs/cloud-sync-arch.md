# 词途小程序 v1.6 云同步技术方案

## 一、数据分析

### 需要同步的数据（storage.js）
| 数据项 | 类型 | 大小估算 | 同步频率 |
|--------|------|----------|----------|
| learningRecords | JSON | ~1KB | 每次学习后 |
| reviewRecord | JSON | ~5KB | 每次复习后 |
| notebook | JSON | ~2KB | 添加生词时 |
| unlockedAchievements | JSON | <1KB | 解锁成就时 |
| userProgress | JSON | <1KB | 日常 |
| dailyGoal | String | <100B | 偶尔 |

### 数据特点
- **总量小**：全部数据 < 20KB
- **高频低**：单次学习/复习操作
- **离线优先**：支持断网使用

---

## 二、技术选型对比

### 方案A：LeanCloud
| 维度 | 评估 |
|------|------|
| 优势 | 文档完善、REST API 简洁、免费额度大(20GB)、支持Web端 |
| 劣势 | 国内访问略慢、需要额外部署同步逻辑 |
| 适用 | 多平台（小程序+Web） |

### 方案B：腾讯云开发
| 维度 | 评估 |
|------|------|
| 优势 | 微信生态无缝集成、只读 DB、即时分享、免费额度大 |
| 劣势 | 依赖微信生态、社交功能需企业认证 |
| 适用 | 纯小程序、微信群分享 |

### 方案C：微信云开发（推荐）
| 维度 | 评估 |
|------|------|
| 优势 | 免费、无需服务器、云函数/DB/存储一体、微信登录 |
| 劣势 | 只能在微信生态内 |
| 推荐 | ✅ 首选方案 |

---

## 三、架构设计

### 数据层
```
┌─────────────────────────────────┐
│         用户端（小程序）          │
├─────────────────────────────────┤
│  本地Storage  ←→  云数据库      │
│       ↓                              │
│   冲突策略（以最新时间为准）       │
└─────────────────────────────────┘
```

### 云数据库设计（Collection: userData）
```json
{
  "_id": "openId_设备id",
  "openId": "oXXX",
  "learningRecords": { "known": [], "unknown": [], "total": 0 },
  "reviewRecord": {},
  "notebook": [],
  "unlockedAchievements": [],
  "lastSyncTime": 1700000000000,
  "deviceId": "device_xxx"
}
```

### 同步流程
1. **首次登录**：从云端拉取完整数据
2. **日常使用**：本地优先，离线可用
3. **上线同步**：
   - 获取云端最新时间戳
   - 比较本地最后同步时间
   - 时间戳更新则合并（时间戳优先）

### 核心代码设计
```javascript
// utils/cloudSync.js
const cloudSync = {
  // 初始化云开发
  async init() { /* 初始化云环境 */ },
  
  // 同步数据（上行）
  async uploadData() {
    // 1. 导出本地数据
    const localData = storage.exportData();
    // 2. 添加时间戳
    localData.lastSyncTime = Date.now();
    // 3. 上传到云端
    await db.collection('userData').doc(openId).set({ data: localData });
  },
  
  // 同步数据（下行）
  async downloadData() {
    // 1. 获取云端数据
    const cloudData = await db.collection('userData').doc(openId).get();
    // 2. 检查时间戳
    if (cloudData.lastSyncTime > localData.lastSyncTime) {
      // 3. 覆盖本地
      storage.importData(cloudData);
    }
  }
};
```

---

## 四、实施计划

### Phase 1：基础云同步
- [ ] 开通云开发环境
- [ ] 设计数据库 Schema
- [ ] 实现上/下行同步
- [ ] 冲突处理

### Phase 2：多设备支持
- [ ] 设备注册与识别
- [ ] 多设备数据合并
- [ ] 实时同���（可选）

### Phase 3：进阶功能（可选）
- [ ] 学习数据分享
- [ ] 好友排行榜
- [ ] 微信群PK

---

## 五、风险与对策

| 风险 | 对策 |
|------|------|
| 首次同步数据丢失 | 本地保留备份，支持手动恢复 |
| 多设备冲突 | 以最后修改时间为准 |
| 网络不稳定 | 离线优先，网络恢复后自动同步 |
| 配额超限 | 本地缓存+增量同步 |

---

建议：**优先采用腾讯云开发**，免费+微信生态无缝集成。