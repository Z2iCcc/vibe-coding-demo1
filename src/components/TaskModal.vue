<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { TASK_PRIORITY_META } from '../constants/taskMeta'
import { TASK_PRIORITIES, type Task, type TaskPriority } from '../types/task'
import { todayISO } from '../utils/date'

/** 弹窗开关由父组件通过 v-model 控制 */
const open = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  submit: [task: Task]
}>()

/** 表单数据，用 v-model 绑定到各个输入控件 */
const form = reactive<{ title: string; description: string; priority: TaskPriority }>({
  title: '',
  description: '',
  priority: 'medium',
})

const error = ref('')
const titleInput = ref<HTMLInputElement | null>(null)

const priorityOptions: { value: TaskPriority; label: string }[] = TASK_PRIORITIES.map((value) => ({
  value,
  label: TASK_PRIORITY_META[value].label,
}))

/**
 * crypto.randomUUID 只在安全上下文（HTTPS / localhost）存在。
 * 用 http 打开部署好的站点时它是 undefined，会让「创建」按钮直接抛错 ——
 * 用户看到的就是点了没反应，所以留一个降级。
 */
function createId(): string {
  return crypto.randomUUID?.() ?? `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function reset() {
  form.title = ''
  form.description = ''
  form.priority = 'medium'
  error.value = ''
}

function close() {
  open.value = false
  reset()
}

function submit() {
  if (!form.title.trim()) {
    error.value = '标题不能为空'
    titleInput.value?.focus()
    return
  }

  // 取一次日期：跨零点时 dueDate 和 createdAt 不应该差一天
  const date = todayISO()

  emit('submit', {
    id: createId(),
    title: form.title.trim(),
    description: form.description.trim(),
    status: 'todo',
    priority: form.priority,
    dueDate: date,
    createdAt: date,
  })

  close()
}

/** ESC 关闭：用 document 级监听，避免焦点不在弹窗内时失效 */
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

watch(open, async (isOpen) => {
  // 打开时锁住背景滚动，并聚焦标题输入框
  document.body.style.overflow = isOpen ? 'hidden' : ''
  if (isOpen) {
    await nextTick()
    titleInput.value?.focus()
  }
})
</script>

<template>
  <Teleport to="body">
    <!--
      这里用 v-show 而不是 v-if：内层的滑出动画需要父元素还挂在 DOM 上，
      v-if 会先把整棵子树卸载，内层 transition 的 leave 根本来不及播。
    -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <!--
        手机上贴着底部（bottom sheet），sm 以上回到居中。
        背景模糊只在桌面开：它每帧都要对整屏做一次模糊采样，而下面正好在播
        300ms 的滑出动画、内容每帧都在变，手机上等于每帧重算一次全屏模糊，最费 GPU。
      -->
      <div
        v-show="open"
        class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4 sm:backdrop-blur-sm dark:bg-slate-950/70"
        @click.self="close"
      >
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0"
          enter-to-class="translate-y-0 sm:scale-100 sm:opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="translate-y-0 sm:scale-100 sm:opacity-100"
          leave-to-class="translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0"
        >
          <div
            v-show="open"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
            class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white px-6 pt-4 pb-8 shadow-xl sm:rounded-xl sm:py-6 dark:bg-slate-900 dark:ring-1 dark:ring-slate-800"
          >
            <!-- 底部抽屉的拖拽把手，仅手机显示 -->
            <div
              class="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-slate-300 sm:hidden dark:bg-slate-700"
              aria-hidden="true"
            />

            <h2
              id="task-modal-title"
              class="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100"
            >
              新建任务
            </h2>

            <form class="mt-5 space-y-4" @submit.prevent="submit">
              <!-- 标题（必填） -->
              <div>
                <label
                  for="task-title"
                  class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  标题 <span class="text-rose-500">*</span>
                </label>
                <input
                  id="task-title"
                  ref="titleInput"
                  v-model="form.title"
                  type="text"
                  maxlength="100"
                  placeholder="想做什么？"
                  :aria-invalid="!!error"
                  aria-describedby="task-title-error"
                  class="w-full rounded-lg border bg-white px-3 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 sm:py-2 sm:text-sm dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                  :class="
                    error
                      ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100 dark:border-rose-500 dark:focus:ring-rose-950'
                      : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100 dark:border-slate-700 dark:focus:border-sky-500 dark:focus:ring-sky-950'
                  "
                  @input="error = ''"
                />
                <p
                  v-if="error"
                  id="task-title-error"
                  role="alert"
                  class="mt-1.5 text-xs font-medium text-rose-500"
                >
                  {{ error }}
                </p>
              </div>

              <!-- 描述（选填） -->
              <div>
                <label
                  for="task-description"
                  class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  描述
                  <span class="font-normal text-slate-400 dark:text-slate-500">（选填）</span>
                </label>
                <textarea
                  id="task-description"
                  v-model="form.description"
                  rows="3"
                  maxlength="500"
                  placeholder="补充一些细节…"
                  class="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 sm:py-2 sm:text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-500 dark:focus:ring-sky-950"
                />
              </div>

              <!-- 优先级 -->
              <div>
                <label
                  for="task-priority"
                  class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  优先级
                </label>
                <select
                  id="task-priority"
                  v-model="form.priority"
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 sm:py-2 sm:text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-950"
                >
                  <option
                    v-for="option in priorityOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div class="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  class="min-h-11 cursor-pointer rounded-lg px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100 sm:min-h-0 sm:py-2 dark:text-slate-300 dark:hover:bg-slate-800"
                  @click="close"
                >
                  取消
                </button>
                <button
                  type="submit"
                  class="min-h-11 cursor-pointer rounded-lg bg-sky-500 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600 sm:min-h-0 sm:py-2"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
