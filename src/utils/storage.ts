import type { Task } from '../types/task'
import { TASK_PRIORITIES, TASK_STATUSES } from '../types/task'

/** localStorage 键名 */
export const STORAGE_KEY = 'vibe-coding-runoob-tasks'

/**
 * 「来过一次了」标记的键名。用法引导只在第一次进入时显示，
 * 之后哪怕任务被删光也不会再弹出来教育一遍。
 */
export const VISITED_KEY = 'vibe-coding-runoob-visited'

/**
 * 逐字段校验一条记录。
 *
 * localStorage 是同源共享的，任何脚本、扩展、或者用户自己打开 DevTools 都能往里写，
 * 所以读出来的一律当不可信数据。之前这里只判断了「是不是数组」，
 * 结果存进去一条缺 priority 的记录就能让 TaskCard 读 undefined.bar 抛错，
 * 整个应用白屏，而且刷新也好不了 —— 坏数据还在。
 */
function isValidTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false
  const task = value as Record<string, unknown>
  return (
    typeof task.id === 'string' &&
    task.id !== '' &&
    typeof task.title === 'string' &&
    typeof task.description === 'string' &&
    typeof task.dueDate === 'string' &&
    typeof task.createdAt === 'string' &&
    TASK_STATUSES.includes(task.status as Task['status']) &&
    TASK_PRIORITIES.includes(task.priority as Task['priority'])
  )
}

/**
 * 保存任务。返回是否成功 —— 配额超限或隐私模式下 setItem 会抛错，
 * 调用方需要知道，不能只在控制台留一行日志就让用户以为存上了。
 */
export function saveTasks(tasks: Task[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    return true
  } catch (error) {
    console.error('[storage] 保存任务失败：', error)
    return false
  }
}

/**
 * 读取并解析。键不存在、JSON 损坏、不是数组时返回空数组；
 * 数组里形状不对的记录会被丢掉并记一条警告，而不是让整个页面崩掉。
 */
export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      console.error('[storage] 存储内容不是数组，已忽略')
      return []
    }

    const valid = parsed.filter(isValidTask)
    if (valid.length !== parsed.length) {
      console.warn(`[storage] 丢弃了 ${parsed.length - valid.length} 条格式不对的任务记录`)
    }
    return valid
  } catch (error) {
    console.error('[storage] 读取任务失败：', error)
    return []
  }
}

/** 清空任务。读取已经坏掉、需要重置时用 */
export function clearTasks(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('[storage] 清空任务失败：', error)
  }
}

/**
 * 是不是第一次使用。
 *
 * 读不到 localStorage（隐私模式、被策略禁用、被 sandbox 的 iframe）时按「第一次」算：
 * 那种环境下本来就什么都记不住，宁可多给一次引导，也别让新用户什么都看不到。
 */
export function isFirstVisit(): boolean {
  try {
    return localStorage.getItem(VISITED_KEY) === null
  } catch {
    return true
  }
}

/**
 * 记下「已经来过」。和任务数据分开存 —— 用户把任务全删了不代表他没来过，
 * 合用一个键的话「删光任务」会被误判成新用户，引导又冒出来了。
 */
export function markVisited(): void {
  try {
    localStorage.setItem(VISITED_KEY, '1')
  } catch {
    // 存不进去不影响使用，最多下次再显示一遍引导
  }
}

/** 抹掉「来过」标记，让引导重新出现。只在重置本地数据时用 */
export function clearVisited(): void {
  try {
    localStorage.removeItem(VISITED_KEY)
  } catch (error) {
    console.error('[storage] 清除访问标记失败：', error)
  }
}
