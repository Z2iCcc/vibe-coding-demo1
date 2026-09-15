import { ref } from 'vue'

/**
 * 今天（本地时区），格式 YYYY-MM-DD。
 *
 * 不用 toISOString().slice(0, 10)：那个按 UTC 算，东八区凌晨 0 点到 8 点之间
 * 会算成昨天，于是新建的任务和「已逾期」判断都会差一天。
 */
export function todayISO(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** '2026-09-24' → '9 月 24 日'；格式不对时原样返回，不抛错 */
export function formatDate(iso: string): string {
  const parts = iso.split('-')
  if (parts.length !== 3) return iso
  const [, month, day] = parts
  return `${Number(month)} 月 ${Number(day)} 日`
}

/**
 * 「今天」的响应式版本。
 *
 * 逾期判断依赖它，如果在组件 setup 里算一次就固定下来，应用跨零点还开着的话
 * 会一直用昨天的日期。最小刷新粒度是天，所以 60 秒轮询一次足够。
 * 做成模块级单例是有意的：不能每个 TaskCard 各起一个定时器。
 */
export const today = ref(todayISO())

setInterval(() => {
  const next = todayISO()
  if (today.value !== next) today.value = next
}, 60_000)
