import type { TaskPriority, TaskStatus } from '../types/task'

/**
 * 状态/优先级的文案与配色集中在这里。
 * 之前这套东西散在 TaskCard、TaskList、KanbanBoard、TaskModal、App 五个文件里，
 * 改一处颜色要记得改五遍。
 */

export interface TaskStatusMeta {
  /** 卡片徽章、看板列头、统计文案用的名字 */
  label: string
  /**
   * 列表筛选按钮上的名字。只有「已完成」不一样 —— 筛选按钮窄，
   * 按最初的需求文案用「完成」，卡片上仍然用「已完成」。
   */
  filterLabel: string
  /** 卡片上状态徽章的配色 */
  badge: string
  /** 看板列头的小圆点 */
  dot: string
}

export const TASK_STATUS_META: Record<TaskStatus, TaskStatusMeta> = {
  todo: {
    label: '待办',
    filterLabel: '待办',
    badge:
      'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
    dot: 'bg-slate-400',
  },
  'in-progress': {
    label: '进行中',
    filterLabel: '进行中',
    badge: 'bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-900',
    dot: 'bg-sky-500',
  },
  // 中性灰：完成状态已由勾选框和删除线表达，这里不再用绿色，把绿色留给低优先级
  done: {
    label: '已完成',
    filterLabel: '完成',
    badge:
      'bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:ring-slate-700',
    dot: 'bg-emerald-500',
  },
}

export interface TaskPriorityMeta {
  label: string
  /** 卡片左侧色条 */
  bar: string
  /** 卡片上的优先级徽章 */
  badge: string
}

export const TASK_PRIORITY_META: Record<TaskPriority, TaskPriorityMeta> = {
  high: {
    label: '高',
    bar: 'border-l-rose-500',
    badge:
      'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-900',
  },
  medium: {
    label: '中',
    bar: 'border-l-amber-400',
    badge:
      'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900',
  },
  low: {
    label: '低',
    bar: 'border-l-emerald-500',
    badge:
      'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900',
  },
}
