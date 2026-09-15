/** 任务状态：待办 / 进行中 / 已完成 */
export type TaskStatus = 'todo' | 'in-progress' | 'done'

/** 任务优先级：低 / 中 / 高 */
export type TaskPriority = 'low' | 'medium' | 'high'

/** 一条任务 */
export interface Task {
  id: string
  /** 任务标题 */
  title: string
  /** 任务描述 */
  description: string
  status: TaskStatus
  priority: TaskPriority
  /** 截止日期，ISO 格式 YYYY-MM-DD */
  dueDate: string
  /** 创建日期，ISO 格式 YYYY-MM-DD */
  createdAt: string
}

/** 便于后续做筛选 / 下拉选项时遍历 */
export const TASK_STATUSES: readonly TaskStatus[] = ['todo', 'in-progress', 'done']
export const TASK_PRIORITIES: readonly TaskPriority[] = ['low', 'medium', 'high']
