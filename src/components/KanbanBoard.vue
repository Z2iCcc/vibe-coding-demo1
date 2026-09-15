<script setup lang="ts">
import { computed, ref } from 'vue'
import TaskCard from './TaskCard.vue'
import type { Task, TaskStatus } from '../types/task'

const { tasks } = defineProps<{ tasks: Task[] }>()

const emit = defineEmits<{
  move: [id: string, status: TaskStatus]
  toggle: [id: string]
  delete: [id: string]
}>()

const columns: { status: TaskStatus; label: string; accent: string }[] = [
  { status: 'todo', label: '待办', accent: 'bg-slate-400' },
  { status: 'in-progress', label: '进行中', accent: 'bg-sky-500' },
  { status: 'done', label: '已完成', accent: 'bg-emerald-500' },
]

/** 正在拖拽的任务 id —— dragover 阶段读不到 dataTransfer，只能靠它判断 */
const draggingId = ref<string | null>(null)
/** 当前悬停在哪一列，用于高亮 */
const overStatus = ref<TaskStatus | null>(null)

const byStatus = computed(() => {
  const groups: Record<TaskStatus, Task[]> = { todo: [], 'in-progress': [], done: [] }
  const sorted = [...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  for (const task of sorted) {
    groups[task.status]?.push(task)
  }
  return groups
})

function onDragStart(event: DragEvent, task: Task) {
  draggingId.value = task.id
  // Firefox 必须调用 setData，否则拖拽根本不启动
  event.dataTransfer?.setData('text/plain', task.id)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onDragEnd() {
  draggingId.value = null
  overStatus.value = null
}

function onDragOver(event: DragEvent, status: TaskStatus) {
  // 必须阻止默认行为，否则 drop 事件不会触发
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  overStatus.value = status
}

function onDragLeave(event: DragEvent, status: TaskStatus) {
  // dragleave 在掠过子元素时也会触发，relatedTarget 仍在列内就忽略，避免高亮闪烁
  const column = event.currentTarget as HTMLElement | null
  const related = event.relatedTarget as Node | null
  if (column && related && column.contains(related)) return
  if (overStatus.value === status) overStatus.value = null
}

function onDrop(event: DragEvent, status: TaskStatus) {
  event.preventDefault()
  const id = event.dataTransfer?.getData('text/plain') || draggingId.value
  overStatus.value = null
  draggingId.value = null

  if (!id) return
  const task = tasks.find((item) => item.id === id)
  // 拖回原列不做任何事，避免产生一次无意义的落盘
  if (!task || task.status === status) return

  emit('move', id, status)
}
</script>

<template>
  <div class="grid gap-4 md:grid-cols-3">
    <section
      v-for="column in columns"
      :key="column.status"
      class="flex min-h-40 flex-col rounded-xl border p-3 transition"
      :class="
        overStatus === column.status
          ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-100 dark:border-sky-500 dark:bg-sky-950/40 dark:ring-sky-900'
          : 'border-slate-200 bg-slate-100/60 dark:border-slate-800 dark:bg-slate-900/60'
      "
      @dragover="onDragOver($event, column.status)"
      @dragleave="onDragLeave($event, column.status)"
      @drop="onDrop($event, column.status)"
    >
      <header class="mb-3 flex items-center gap-2 px-1">
        <span class="size-2.5 shrink-0 rounded-full" :class="column.accent" aria-hidden="true" />
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {{ column.label }}
        </h3>
        <span
          class="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200 ring-inset dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700"
        >
          {{ byStatus[column.status].length }}
        </span>
      </header>

      <ul class="flex flex-1 flex-col gap-2">
        <li
          v-for="task in byStatus[column.status]"
          :key="task.id"
          draggable="true"
          class="cursor-grab transition-opacity active:cursor-grabbing"
          :class="draggingId === task.id && 'opacity-40'"
          @dragstart="onDragStart($event, task)"
          @dragend="onDragEnd"
        >
          <TaskCard
            :task="task"
            @toggle="emit('toggle', $event)"
            @delete="emit('delete', $event)"
          />
        </li>

        <!-- 空列也要有落点 -->
        <li
          v-if="!byStatus[column.status].length"
          class="grid flex-1 place-items-center rounded-lg border border-dashed border-slate-300 py-8 text-xs text-slate-400 dark:border-slate-700 dark:text-slate-600"
        >
          拖拽任务到这里
        </li>
      </ul>
    </section>
  </div>
</template>
