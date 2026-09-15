import { reactive, ref, watch } from 'vue'
import type { Task } from '../types/task'
import { isFirstVisit, loadTasks, markVisited, saveTasks } from '../utils/storage'

// 首次进入不再铺示例任务了，改为在空列表位置显示用法引导卡片（TaskGuide.vue）。
// 好处是新用户看到的不是三条假数据，而是「这个页面怎么用」。
export const tasks = reactive<Task[]>(loadTasks())

/**
 * 落盘失败了（配额超限、隐私模式、storage 被禁用）。
 * 界面据此给用户一个提示 —— 否则他继续操作、刷新后数据全没了，全程没有任何反馈。
 */
export const saveFailed = ref(false)

function persist(current: Task[]) {
  saveFailed.value = !saveTasks(current)
}

/**
 * 一次性清理：老版本首次使用时会自动创建 3 条示例任务，id 是 sample-*。
 * 光删掉生成示例的代码不够 —— 它们已经被写进 localStorage 了，
 * 访问过的浏览器刷新后还是会看到，所以在这里主动剔除一次。
 * 注意：如果用户自己改过这几条，改动也会一起没了，这正是本次需求要的效果。
 * 等确认所有环境都升级过之后，这个函数可以整段删掉。
 */
function removeLegacySampleTasks(): boolean {
  let removed = false
  for (let i = tasks.length - 1; i >= 0; i--) {
    if (tasks[i].id.startsWith('sample-')) {
      tasks.splice(i, 1)
      removed = true
    }
  }
  return removed
}

// 得手动落盘一次：下面的 watch 只监听「注册之后」的改动，
// 清理发生在那之前，不补这一下的话界面干净了、存储里那 3 条还在。
// 这一步必须排在下面判断「是不是新用户」之前 —— 判断要看清理后的条数。
if (removeLegacySampleTasks()) persist(tasks)

/**
 * 用法引导是否显示。
 *
 * 两个条件都要满足：
 * 1. 这个浏览器没来过（isFirstVisit）。取完结果立刻写标记，
 *    这次之后它一直是 false，列表再空也只会是一句安静的空状态。
 * 2. 清理完之后一条任务都没有。手上有真实任务的用户显然不是新用户，
 *    不该因为刚升级、标记还不存在就被当成新人；反过来，只存过那 3 条
 *    示例数据的浏览器，清完就是空列表，按新用户对待正好。
 *
 * 标记和任务数据分开存，所以「用户把任务删光了」不会被误判成新用户。
 */
const firstVisit = isFirstVisit()

export const showGuide = ref(firstVisit && tasks.length === 0)

if (firstVisit) markVisited()

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
  // 真的建过任务就算上手了。不收这个尾的话，他建完又删光，引导会在同一个会话里再弹一次
  showGuide.value = false
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
