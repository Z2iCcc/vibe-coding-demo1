<script setup lang="ts">
import { computed, onErrorCaptured, ref } from 'vue'
import KanbanBoard from './components/KanbanBoard.vue'
import TaskList from './components/TaskList.vue'
import TaskModal from './components/TaskModal.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import { TASK_STATUS_META } from './constants/taskMeta'
import { addTask, deleteTask, saveFailed, tasks, toggleTask, updateTask } from './stores/taskStore'
import { TASK_STATUSES, type TaskStatus } from './types/task'
import { clearTasks } from './utils/storage'

/* ---------- 视图切换 ---------- */

type View = 'list' | 'kanban'

const tabs: { value: View; label: string }[] = [
  { value: 'list', label: '列表' },
  { value: 'kanban', label: '看板' },
]

const view = ref<View>('list')

/* ---------- 派生数据 ---------- */

const stats = computed(() => {
  const counts: Record<TaskStatus, number> = { todo: 0, 'in-progress': 0, done: 0 }
  for (const task of tasks) {
    if (task.status in counts) counts[task.status] += 1
  }
  return { total: tasks.length, counts }
})

/** 「共 3 项 · 待办 1 · 进行中 1 · 已完成 1」 */
const statsSummary = computed(() =>
  [
    `共 ${stats.value.total} 项`,
    ...TASK_STATUSES.map((status) => `${TASK_STATUS_META[status].label} ${stats.value.counts[status]}`),
  ].join(' · '),
)

/* ---------- 交互 ---------- */

/** 看板拖拽换列 */
function moveTask(id: string, status: TaskStatus) {
  updateTask(id, { status })
}

/* ---------- 渲染兜底 ---------- */

/**
 * 任何子组件渲染时抛错都不该让整页变白。
 * 之前 localStorage 里一条格式不对的记录就能做到，而且因为坏数据还在，刷新也好不了。
 * 这里接管错误，换成一个能自救的界面。
 */
const fatalError = ref('')

onErrorCaptured((error) => {
  fatalError.value = error instanceof Error ? error.message : String(error)
  return false
})

function resetLocalData() {
  clearTasks()
  location.reload()
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
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100">
    <!-- 顶部导航栏 -->
    <header
      class="sticky top-0 z-10 border-b border-sky-100 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/85"
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
          <h1 class="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
            任务清单
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
          class="grid size-11 cursor-pointer place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 sm:hidden dark:text-zinc-300 dark:hover:bg-zinc-800"
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
        class="border-t border-slate-100 px-4 py-4 sm:hidden dark:border-zinc-800"
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
      <!-- 存不进去时必须让用户知道，否则他继续操作、刷新后数据全没了，全程没有任何反馈 -->
      <p
        v-if="saveFailed && !fatalError"
        role="alert"
        class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
      >
        无法保存到本地存储（可能是浏览器隐私模式或存储空间已满），本次改动在刷新后会丢失。
      </p>

      <!-- 渲染出错：给一条自救的路，而不是白屏 -->
      <div
        v-if="fatalError"
        class="rounded-xl border border-rose-200 bg-white px-6 py-12 text-center dark:border-rose-900 dark:bg-zinc-900"
      >
        <h2 class="text-base font-semibold text-rose-600 dark:text-rose-400">页面出错了</h2>
        <p class="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-zinc-400">
          本地保存的任务数据可能已损坏。重置会清空所有任务并恢复到初始状态。
        </p>
        <p class="mt-3 font-mono text-xs break-all text-slate-400 dark:text-zinc-500">
          {{ fatalError }}
        </p>
        <button
          type="button"
          class="mt-5 inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-rose-500 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-rose-600 sm:min-h-0 sm:py-2"
          @click="resetLocalData"
        >
          重置本地数据
        </button>
      </div>

      <template v-else>
        <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 class="text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
              {{ view === 'list' ? '任务列表' : '任务看板' }}
            </h2>
            <!-- 一条任务都没有时统计全是 0，和下面的引导卡片重复，就不显示了 -->
            <p v-if="stats.total" class="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              {{ statsSummary }}
            </p>
          </div>

          <!-- 视图切换 -->
          <div class="flex shrink-0 rounded-lg bg-slate-100 p-1 dark:bg-zinc-800">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              type="button"
              class="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition sm:min-h-0"
              :class="
                view === tab.value
                  ? 'bg-white text-sky-700 shadow-sm dark:bg-zinc-700 dark:text-sky-200'
                  : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
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
      </template>

      <!-- 新建任务弹窗 -->
      <TaskModal v-model="showModal" @submit="addTask" />
    </main>
  </div>
</template>
