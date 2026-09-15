<script setup lang="ts">
import { computed, ref } from 'vue'
import { TASK_STATUS_META } from '../constants/taskMeta'
import { TASK_STATUSES, type Task, type TaskStatus } from '../types/task'
import { sortByCreatedAtDesc } from '../utils/task'
import TaskCard from './TaskCard.vue'
import TaskGuide from './TaskGuide.vue'

const { tasks } = defineProps<{ tasks: Task[] }>()

const emit = defineEmits<{
  toggle: [id: string]
  delete: [id: string]
  add: []
}>()

type Filter = TaskStatus | 'all'

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: '全部' },
  ...TASK_STATUSES.map((status) => ({
    value: status,
    label: TASK_STATUS_META[status].filterLabel,
  })),
]

const active = ref<Filter>('all')

const sorted = computed(() => sortByCreatedAtDesc(tasks))

const visible = computed(() =>
  active.value === 'all'
    ? sorted.value
    : sorted.value.filter((task) => task.status === active.value),
)

const activeLabel = computed(
  () => filters.find((filter) => filter.value === active.value)?.label ?? '',
)

/** 一次遍历算出所有筛选按钮上的计数，不在模板里对每个按钮各 filter 一遍 */
const counts = computed(() => {
  const result: Record<Filter, number> = { all: tasks.length, todo: 0, 'in-progress': 0, done: 0 }
  for (const task of tasks) {
    if (task.status in result) result[task.status] += 1
  }
  return result
})
</script>

<template>
  <div>
    <!-- 状态筛选 -->
    <div class="mb-4 flex flex-wrap items-center gap-1.5">
      <button
        v-for="filter in filters"
        :key="filter.value"
        type="button"
        class="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-3 py-1 text-sm font-medium transition sm:min-h-0"
        :class="
          active === filter.value
            ? 'bg-sky-500 text-white shadow-sm'
            : 'bg-white text-slate-600 ring-1 ring-slate-200 ring-inset hover:bg-sky-50 hover:text-sky-700 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-sky-300'
        "
        :aria-pressed="active === filter.value"
        @click="active = filter.value"
      >
        {{ filter.label }}
        <span class="ml-0.5 opacity-60">{{ counts[filter.value] }}</span>
      </button>
    </div>

    <!-- 任务卡片 -->
    <ul v-if="visible.length" class="space-y-3">
      <li v-for="task in visible" :key="task.id">
        <TaskCard
          :task="task"
          @toggle="emit('toggle', $event)"
          @delete="emit('delete', $event)"
        />
      </li>
    </ul>

    <!-- 空状态：一个任务都没有，显示用法引导 -->
    <TaskGuide v-else-if="!tasks.length" @add="emit('add')" />

    <!-- 空状态：有任务，但当前筛选没有匹配项 -->
    <p
      v-else
      class="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500"
    >
      没有「{{ activeLabel }}」状态的任务
    </p>
  </div>
</template>
