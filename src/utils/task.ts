import type { Task } from '../types/task'

/** 按创建时间倒序（最新的在前）。拷贝后再排，避免改动传入的数组 */
export function sortByCreatedAtDesc(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
