<script setup lang="ts">
import { computed, ref } from 'vue'
import KanbanBoard from './components/KanbanBoard.vue'
import TaskList from './components/TaskList.vue'
import TaskModal from './components/TaskModal.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import { addTask, deleteTask, tasks, updateTask } from './stores/taskStore'
import type { TaskStatus } from './types/task'

/* ---------- 视图切换 ---------- */

type View = 'list' | 'kanban'

const tabs: { value: View; label: string }[] = [
  { value: 'list', label: '列表' },
  { value: 'kanban', label: '看板' },
]

const view = ref<View>('list')

/* ---------- 派生数据 ---------- */

const stats = computed(() => {
  const total = tasks.length
  const done = tasks.filter((task) => task.status === 'done').length
  const inProgress = tasks.filter((task) => task.status === 'in-progress').length
  return { total, done, inProgress, todo: total - done - inProgress }
})

/* ---------- 交互 ---------- */

/** 切换完成状态：已完成 → 待办，其余 → 已完成 */
function toggleTask(id: string) {
  const task = tasks.find((item) => item.id === id)
  if (!task) return
  updateTask(id, { status: task.status === 'done' ? 'todo' : 'done' })
}

/** 看板拖拽换列 */
function moveTask(id: string, status: TaskStatus) {
  updateTask(id, { status })
}

/* ---------- 新建任务弹窗 ---------- */

const showModal = ref(false)

/* ---------- 手机端汉堡菜单 ---------- */

const menuOpen = ref(false)

/** 从菜单里打开弹窗时顺手收起菜单 */
function openModal() {
  menuOpen.value = false
  showModal.value = true
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <!-- 顶部导航栏 -->
    <header
      class="sticky top-0 z-10 border-b border-sky-100 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85"
    >
      <div class="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        <div class="flex items-center gap-2.5">
          <span class="grid size-8 place-items-center rounded-lg bg-sky-500 text-white shadow-sm">
            <svg
              class="size-4.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <h1 class="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Vibe Coding demo1
          </h1>
        </div>

        <!-- 桌面端操作区 -->
        <div class="hidden items-center gap-3 sm:flex">
          <span
            class="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200 ring-inset dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-900"
          >
            {{ stats.total }} 个任务
          </span>
          <button
            type="button"
            class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            @click="openModal"
          >
            <svg
              class="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            新建任务
          </button>

          <ThemeToggle />
        </div>

        <!-- 手机端汉堡按钮 -->
        <button
          type="button"
          class="grid size-11 cursor-pointer place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 sm:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          :aria-label="menuOpen ? '关闭菜单' : '打开菜单'"
          @click="menuOpen = !menuOpen"
        >
          <svg
            v-if="menuOpen"
            class="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
          <svg
            v-else
            class="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- 手机端展开菜单 -->
      <div
        v-show="menuOpen"
        id="mobile-menu"
        class="border-t border-slate-100 px-4 py-4 sm:hidden dark:border-slate-800"
      >
        <div class="flex items-center justify-between gap-3">
          <span
            class="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200 ring-inset dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-900"
          >
            {{ stats.total }} 个任务
          </span>
          <ThemeToggle />
        </div>

        <button
          type="button"
          class="mt-3 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600"
          @click="openModal"
        >
          <svg
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          新建任务
        </button>
      </div>
    </header>

    <!-- 任务区域 -->
    <main class="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {{ view === 'list' ? '任务列表' : '任务看板' }}
          </h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            共 {{ stats.total }} 项 · 待办 {{ stats.todo }} · 进行中 {{ stats.inProgress }} · 已完成
            {{ stats.done }}
          </p>
        </div>

        <!-- 视图切换 -->
        <div class="flex shrink-0 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            class="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition sm:min-h-0"
            :class="
              view === tab.value
                ? 'bg-white text-sky-700 shadow-sm dark:bg-slate-700 dark:text-sky-200'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            "
            :aria-pressed="view === tab.value"
            @click="view = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- 列表视图 -->
      <TaskList
        v-if="view === 'list'"
        :tasks="tasks"
        @toggle="toggleTask"
        @delete="deleteTask"
        @add="showModal = true"
      />

      <!-- 看板视图 -->
      <KanbanBoard
        v-else
        :tasks="tasks"
        @toggle="toggleTask"
        @delete="deleteTask"
        @move="moveTask"
      />

      <!-- 新建任务弹窗 -->
      <TaskModal v-model="showModal" @submit="addTask" />
    </main>
  </div>
</template>
