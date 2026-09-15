<script setup lang="ts">
import { computed } from 'vue'
import { TASK_PRIORITY_META, TASK_STATUS_META } from '../constants/taskMeta'
import type { Task } from '../types/task'
import { formatDate, today } from '../utils/date'

const { task } = defineProps<{ task: Task }>()

const emit = defineEmits<{
  toggle: [id: string]
  delete: [id: string]
}>()

const isDone = computed(() => task.status === 'done')

// today 是响应式的，跨零点后会自己更新，逾期判断不会停在昨天
const isOverdue = computed(() => !isDone.value && task.dueDate < today.value)
</script>

<template>
  <article
    class="group relative flex items-start gap-3 rounded-xl border border-l-4 border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:z-10 hover:scale-[1.02] hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/40"
    :class="TASK_PRIORITY_META[task.priority].bar"
  >
    <!-- 复选框：点击切换完成状态 -->
    <button
      type="button"
      class="relative mt-0.5 grid size-5 shrink-0 cursor-pointer place-items-center rounded-md border transition before:absolute before:-inset-3.5 before:content-[''] sm:before:hidden"
      :class="
        isDone
          ? 'border-sky-500 bg-sky-500 text-white'
          : 'border-slate-300 bg-white text-transparent hover:border-sky-400 dark:border-slate-600 dark:bg-slate-900'
      "
      :aria-label="isDone ? '标记为未完成' : '标记为已完成'"
      :aria-pressed="isDone"
      @click="emit('toggle', task.id)"
    >
      <svg
        class="size-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </button>

    <div class="min-w-0 flex-1">
      <!-- flex-wrap：看板列较窄时，徽章整体掉到第二行，避免把标题挤成竖排 -->
      <div class="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <h3
          class="font-medium"
          :class="
            isDone ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
          "
        >
          {{ task.title }}
        </h3>

        <div class="flex shrink-0 items-center gap-1.5">
          <span
            class="rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset"
            :class="TASK_PRIORITY_META[task.priority].badge"
          >
            {{ TASK_PRIORITY_META[task.priority].label }}
          </span>
          <span
            class="rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset"
            :class="TASK_STATUS_META[task.status].badge"
          >
            {{ TASK_STATUS_META[task.status].label }}
          </span>

          <!-- 删除按钮 -->
          <button
            type="button"
            class="relative ml-0.5 grid size-6 cursor-pointer place-items-center rounded-md text-slate-300 transition before:absolute before:-inset-2.5 before:content-[''] hover:bg-rose-50 hover:text-rose-500 sm:before:hidden dark:text-slate-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
            aria-label="删除任务"
            @click="emit('delete', task.id)"
          >
            <svg
              class="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ task.description }}</p>

      <div class="mt-3 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
        <span>截止 {{ formatDate(task.dueDate) }}</span>
        <span v-if="isOverdue" class="font-medium text-rose-500 dark:text-rose-400">已逾期</span>
      </div>
    </div>
  </article>
</template>
