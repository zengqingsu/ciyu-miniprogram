# 词途小程序 v1.9 技术方案

## 一、版本目标

**主题**: AI大模型融合 + 跨端能力增强

**发布时间**: 待定（依赖云环境开通）

---

## 二、AI大模型融合

### 2.1 功能规划

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 智能单词释义 | DeepSeek/Hy3模型生成语境释义 | P0 |
| AI例句生成 | 根据用户水平生成个性化例句 | P0 |
| 智能问答 | 语法、发音、用法实时问答 | P1 |
| 发音评测反馈 | 改进版AI发音指导 | P1 |
| 学习报告生成 | AI生成个性化学习总结 | P2 |
| 自然语言复习 | AI智能体语音触发复习任务 | P1 |

### 2.2 市场背景

根据微信发布的《全球青少年AI+小程序洞察报告》：
- 四年覆盖**7954所学校**、**8.7万名学生**
- 师生使用AI创作小程序年消耗Token超**500亿**
- 相当于375万次日常对话
- 第四届小程序全球创新挑战赛总决赛5月16-17日在深圳举行

**词途机会**：青少年AI教育趋势已获市场验证，教育类小程序获客成本持续降低。

### 2.2 技术架构

```
┌─────────────────────────────────────────┐
│              词途小程序前端              │
├─────────────────────────────────────────┤
│  AI网关层 (utils/aiGateway.js)           │
│  - 请求封装、超时控制、错误重试           │
├─────────────────────────────────────────┤
│  模型层                                  │
│  - DeepSeek (推荐：免费、高中文理解)      │
│  - 混元2.0/Hy3 (微信AI成长计划1亿Token) │
│  - 微信AI智能体 (自然语言任务调度)        │
│  - 讯飞星火 (语音评测增强)               │
└─────────────────────────────────────────┘
```

### 2.3 API接入方案

**方案A: DeepSeek API (推荐)**
```javascript
// utils/aiGateway.js
const DEEPSEEK_API = 'https://api.deepseek.com/v1/chat/completions';
const API_KEY = 'your-key'; // 从环境变量读取

async function getWordExplanation(word, level = 'intermediate') {
  const response = await wx.request({
    url: DEEPSEEK_API,
    method: 'POST',
    header: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    data: {
      model: 'deepseek-chat',
      messages: [{
        role: 'system',
        content: `你是一个英语学习助手。用户英语水平为${level}，请给出单词的简短解释和例句。`
      }, {
        role: 'user',
        content: `请解释单词 "${word}"，给出中英文例句。`
      }],
      temperature: 0.7,
      max_tokens: 200
    }
  });
  
  return response.data.choices[0].message.content;
}
```

**方案B: 微信AI成长计划 (混元2.0/Hy3)**
- 1亿Token免费额度
- 需申请加入计划
- 与微信生态深度集成
- Hy3模型：逻辑推理与上下文理解能力提升

**方案C: 微信AI智能体 (未来方向)**
- 自然语言任务调度："帮我复习今天学的单词"
- 五步操作压缩成一句话
- 需等待全面开放

### 2.4 成本估算

| 场景 | 预估用量 | 成本 |
|------|----------|------|
| 单词释义 | 50次/天 × 30天 = 1500次 | DeepSeek: ~$0.5/月 |
| 智能问答 | 20次/天 × 30天 = 600次 | DeepSeek: ~$0.2/月 |
| 学习报告 | 1次/天 × 30天 = 30次 | DeepSeek: ~$0.1/月 |
| **合计** | | **~$0.8/月** |

---

## 三、3D单词卡片

### 3.1 交互设计

| 交互 | 描述 | 技术实现 |
|------|------|----------|
| 3D翻转 | 单词→释义3D翻转效果 | CSS transform 3D |
| 悬浮效果 | 卡片悬浮视差效果 | perspective + transform |
| 粒子特效 | 记忆正确时粒子庆祝 | Canvas粒子系统 |
| 手势操作 | 滑动收藏/跳过 | touch事件 |

### 3.2 技术实现

```css
/* 3D翻转卡片 */
.card {
  perspective: 1000px;
}

.card-inner {
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  backface-visibility: hidden;
  position: absolute;
}

.card-back {
  transform: rotateY(180deg);
}
```

```javascript
// 3D卡片组件
Component({
  data: {
    isFlipped: false,
    rotateX: 0,
    rotateY: 0
  },
  
  methods: {
    onFlip() {
      this.setData({ isFlipped: !this.data.isFlipped });
    },
    
    onTouchMove(e) {
      const { clientX, clientY } = e.touches[0];
      const { windowWidth, windowHeight } = wx.getSystemInfoSync();
      
      const rotateY = ((clientX / windowWidth) - 0.5) * 30;
      const rotateX = ((clientY / windowHeight) - 0.5) * -30;
      
      this.setData({ rotateX, rotateY });
    }
  }
});
```

---

## 四、跨端架构迁移

### 4.1 技术选型

| 框架 | 优势 | 劣势 | 推荐度 |
|------|------|------|--------|
| Taro 4.x | React/Vue双支持、成熟稳定 | 体积略大 | ⭐⭐⭐⭐⭐ |
| UniApp | Vue生态、国产优化 | 微信侧能力限制 | ⭐⭐⭐⭐ |
| Remax | 运行时React、接近原生 | 生态一般 | ⭐⭐⭐ |

**推荐**: Taro 4.x (React模式)

### 4.2 迁移计划

```
Phase 1: 核心页面迁移 (4周)
├── 首页、学习页、复习页
├── 离线存储模块适配
└── 基础交互保留

Phase 2: 功能完善 (3周)
├── 数据可视化迁移
├── 主题/设备适配迁移
└── 手势交互迁移

Phase 3: 高级功能 (3周)
├── AI大模型集成
├── 3D卡片组件
└── App端特有能力

Phase 4: 测试发布 (2周)
├── 多端测试
├── 性能优化
└── 打包发布
```

### 4.3 目录结构

```
word-rail/
├── src/                    # Taro源码
│   ├── pages/
│   │   ├── index/          # 首页
│   │   ├── learn/          # 学习页
│   │   ├── review/         # 复习页
│   │   ├── trend/          # 数据趋势
│   │   ├── radar/          # 能力雷达
│   │   └── settings/       # 设置页
│   ├── components/
│   │   ├── Card3D/         # 3D卡片组件
│   │   ├── WordChart/      # 图表组件
│   │   └── AIAssistant/    # AI助手组件
│   ├── utils/
│   │   ├── aiGateway.ts    # AI网关
│   │   ├── offlineStorage.ts # 离线存储
│   │   └── syncManager.ts  # 同步管理
│   └── app.tsx
├── wechat/                 # 微信小程序输出
├── android/                # Android App输出
└── ios/                    # iOS App输出
```

### 4.4 成本评估

| 阶段 | 工作量 | 预估时间 |
|------|--------|----------|
| 核心迁移 | 40% | 4周 |
| 功能完善 | 30% | 3周 |
| 高级功能 | 20% | 3周 |
| 测试发布 | 10% | 2周 |
| **合计** | | **12周** |

---

## 五、实施路线图

```
2026年
├── 5月
│   ├── [ ] 云环境开通 / AI成长计划申请
│   ├── [ ] v1.8 真机验证
│   └── [ ] v1.9 技术方案评审
├── 6月
│   ├── [ ] AI网关开发
│   ├── [ ] DeepSeek接入测试
│   └── [ ] 智能释义功能上线
├── 7月
│   ├── [ ] 3D卡片组件开发
│   ├── [ ] Taro迁移启动
│   └── [ ] App端预览版
├── 8月
│   ├── [ ] 跨端功能完善
│   ├── [ ] 多端测试
│   └── [ ] v1.9 发布
└── Q4
    └── v2.0 规划
```

---

## 六、风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| API调用成本超支 | 预算失控 | 设置Token限额、监控告警 |
| 模型响应慢 | 体验下降 | 本地缓存+异步加载 |
| 迁移进度延期 | 发布推迟 | 敏捷迭代、优先核心功能 |
| 跨端兼容问题 | 测试增加 | 早期多端测试、问题跟踪 |

---

## 七、元宝AI能力对接评估

### 7.1 元宝AI最新能力

根据2026年5月生态动态，元宝App升级支持**微信聊天记录总结**能力，12亿用户可原生体验AI助手。

### 7.2 词途学习场景应用

| 场景 | 对接方式 | 优先级 |
|------|----------|--------|
| 学习笔记总结 | 用户分享笔记到元宝，AI总结知识点 | P1 |
| 对话式复习 | 元宝作为入口，通过聊天调用复习功能 | P1 |
| 学习报告解读 | AI分析词途学习数据，生成报告摘要 | P2 |
| 跨应用学习 | 从微信对话中提取英语学习内容 | P2 |

### 7.3 技术对接方案

```javascript
// 方案A: 小程序内调用元宝能力
// 微信正在开放AI能力给小程序生态
wx.openBusinessView({
  businessType: 'aiAssistant',
  extraData: {
    mode: 'study',
    wordList: ['apple', 'banana']
  }
});
```

### 7.4 替代方案

若元宝能力未完全开放，可考虑：
- **微信AI搜索**: 接入微信搜索AI能力
- **DeepSeek对话页**: 在词途内嵌AI助手对话框
- **公众号绑定**: 通过公众号菜单调用AI服务

---

## 八、资源需求

| 资源 | 需求 | 来源 |
|------|------|------|
| 云开发环境 | 1个 | 自行开通 / AI成长计划 |
| DeepSeek API | API Key | deepseek.com |
| Taro开发 | React经验 | 内部/外包 |
| 测试设备 | iOS/Android/平板 | 真机测试 |

---

**文档版本**: v1.2  
**创建日期**: 2026-05-06  
**更新日期**: 2026-05-15  
**状态**: 待评审
