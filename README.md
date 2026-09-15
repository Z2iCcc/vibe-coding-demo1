# Vibe Coding demo1

任务管理 Web App。Vue 3 + Vite + Tailwind CSS v4，纯前端，数据存在浏览器 localStorage，没有后端。

## 功能

- 列表视图：按创建时间倒序，可按状态筛选（全部 / 待办 / 进行中 / 完成）
- 看板视图：待办 / 进行中 / 已完成 三列，卡片可拖拽换列
- 新建任务：标题必填、描述选填、可选优先级
- 优先级用左侧色条区分（高红 / 中黄 / 低绿）
- 深色模式，跟随系统或手动切换，选择会被记住
- 响应式：手机上三列看板变单列、弹窗变底部滑出、导航栏收成汉堡菜单
- 数据持久化到 localStorage，刷新不丢
- 首次使用显示用法引导卡片，之后不再出现

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build     # 产物在 dist/
npm run preview   # 本地预览构建产物
```

## 目录结构

```
src/
├── App.vue                  页面骨架、视图切换、渲染兜底
├── main.ts                  入口
├── style.css                Tailwind 入口 + 深色模式变体定义
├── components/
│   ├── TaskCard.vue         单条任务卡片
│   ├── TaskList.vue         列表视图
│   ├── TaskGuide.vue        首次使用的用法引导卡片
│   ├── KanbanBoard.vue      看板视图（原生拖拽）
│   ├── TaskModal.vue        新建任务弹窗 / 手机端底部抽屉
│   └── ThemeToggle.vue      深色模式开关
├── constants/taskMeta.ts    状态与优先级的文案、配色（统一在这里改）
├── stores/taskStore.ts      任务状态 + localStorage 同步
├── types/task.ts            Task 类型与状态/优先级枚举
└── utils/
    ├── storage.ts           读写 localStorage（含数据校验）
    ├── task.ts              任务排序
    └── date.ts              日期格式化与响应式「今天」
```

## 已知限制

- **看板在触屏上拖不动。** 拖拽用的是 HTML5 原生拖拽 API（`dragstart` / `dragover` / `drop`），这套事件在 iOS Safari 和 Android Chrome 上不会被触摸触发，是浏览器行为。手机上目前只能查看、不能换列。
- **没有类型检查。** 项目里没有 `tsconfig.json`，也没装 `typescript` / `vue-tsc`，`npm run build` 只做打包不做类型校验。`.ts` 和 `lang="ts"` 目前只在编辑器里提供提示。
- **数据只在本机。** 没有后端，换浏览器或清缓存数据就没了。用了两个 localStorage 键：任务数据 `vibe-coding-runoob-tasks`，以及「来过一次了」标记 `vibe-coding-runoob-visited`（决定要不要显示首次引导，删掉它引导就会重新出现）。
- **localStorage 不可用时只能降级为内存态。** 隐私模式、存储被策略拦截、配额写满等情况会有顶部提示，但改动无法保存。
