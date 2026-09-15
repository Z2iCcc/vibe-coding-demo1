import { reactive, ref, watch } from 'vue'
import type { Task } from '../types/task'
import { hasStoredTasks, loadTasks, saveTasks } from '../utils/storage'

/** 首次使用时的示例任务，三种状态、三种优先级各覆盖一次 */
function createSampleTasks(): Task[] {
  return [
    {
      id: 'sample-1',
      title: '搭建项目骨架',
      description: '初始化 Vue 3 + Vite + Tailwind CSS，跑通开发环境。',
      status: 'done',
      priority: 'high',
      dueDate: '2026-09-10',
      createdAt: '2026-09-06',
    },
    {
      id: 'sample-2',
      title: '实现任务列表界面',
      description: '用卡片形式展示任务，标注状态与优先级。',
      status: 'in-progress',
      priority: 'medium',
      dueDate: '2026-09-16',
      createdAt: '2026-09-08',
    },
    {
      id: 'sample-3',
      title: '接入数据持久化',
      description: '把任务存进 localStorage，刷新后不丢失。',
      status: 'todo',
      priority: 'low',
      dueDate: '2026-09-24',
      createdAt: '2026-09-10',
    },
  ]
}

const isFirstRun = !hasStoredTasks()

export const tasks = reactive<Task[]>(isFirstRun ? createSampleTasks() : loadTasks())

/**
 * 落盘失败了（配额超限、隐私模式、storage 被禁用）。
 * 界面据此给用户一个提示 —— 否则他继续操作、刷新后数据全没了，全程没有任何反馈。
 */
export const saveFailed = ref(false)

function persist(current: Task[]) {
  saveFailed.value = !saveTasks(current)
}

// 首次使用要立刻落盘：watch 只在「变更」时触发，初始化赋值不会触发，
// 不主动写一次的话键名会一直不存在，「首次使用」状态永远结束不了
if (isFirstRun) persist(tasks)

/**
 * 防抖落盘：每次改动都全量 JSON.stringify + 同步 setItem 是阻塞主线程的，
 * 任务一多，勾选和拖拽就会卡。攒 300ms 再写一次。
 */
let saveTimer: ReturnType<typeof setTimeout> | undefined

/** 把待写的改动立刻落盘 */
function flush() {
  if (saveTimer === undefined) return
  clearTimeout(saveTimer)
  saveTimer = undefined
  persist(tasks)
}

watch(
  tasks,
  () => {
    if (saveTimer !== undefined) clearTimeout(saveTimer)
    saveTimer = setTimeout(flush, 300)
  },
  // deep 监听：任务对象的 status/priority 等字段被改动时也要落盘
  { deep: true },
)

// 防抖窗口内关掉页面的话改动会丢，所以隐藏/卸载前补写一次
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flush()
})
window.addEventListener('pagehide', flush)

/** 新建：插到最前面 */
export function addTask(task: Task): void {
  tasks.unshift(task)
}

/** 局部更新：只覆盖传入的字段 */
export function updateTask(id: string, patch: Partial<Task>): void {
  const task = tasks.find((item) => item.id === id)
  if (task) Object.assign(task, patch)
}

/** 切换完成状态：已完成 → 待办，其余 → 已完成 */
export function toggleTask(id: string): void {
  const task = tasks.find((item) => item.id === id)
  if (task) task.status = task.status === 'done' ? 'todo' : 'done'
}

/** 原地删除：reactive 数组不能用重新赋值的方式删，否则会切断响应式 */
export function deleteTask(id: string): void {
  const index = tasks.findIndex((item) => item.id === id)
  if (index !== -1) tasks.splice(index, 1)
}
