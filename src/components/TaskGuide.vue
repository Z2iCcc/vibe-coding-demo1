<script setup lang="ts">
const emit = defineEmits<{ add: [] }>()

/** 首次进入时的上手指引。之前这里放的是 3 条示例任务，改成说明用法更直接 */
const tips = [
  { title: '新建任务', text: '点右上角的「新建任务」，标题必填，描述和优先级可选。' },
  { title: '标记完成', text: '点卡片左侧的圆圈就是完成，标题会自动加上删除线。' },
  // 手机端拖拽本来就不能用，这里得说清楚，否则他试半天以为是坏了
  { title: '切换视图', text: '顶部可在「列表」和「看板」之间切换；看板里能拖动卡片换列（手机端暂不支持）。' },
  { title: '自动保存', text: '数据存在这台设备上，刷新不会丢；右上角还能切换深色模式。' },
]
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white px-6 py-10 dark:border-zinc-800 dark:bg-zinc-900">
    <div class="mx-auto max-w-md text-center">
      <span
        class="mx-auto grid size-12 place-items-center rounded-xl bg-sky-50 text-sky-500 dark:bg-sky-950 dark:text-sky-400"
      >
        <svg
          class="size-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      </span>
      <h3 class="mt-4 text-base font-semibold text-slate-900 dark:text-zinc-100">还没有任务</h3>
      <p class="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">四步就能上手这个任务清单</p>
    </div>

    <ol class="mx-auto mt-7 max-w-lg space-y-4">
      <li v-for="(tip, index) in tips" :key="tip.title" class="flex gap-3">
        <span
          class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500 dark:bg-zinc-800 dark:text-zinc-400"
          aria-hidden="true"
        >
          {{ index + 1 }}
        </span>
        <div class="min-w-0">
          <p class="text-sm font-medium text-slate-900 dark:text-zinc-100">{{ tip.title }}</p>
          <p class="mt-0.5 text-sm text-slate-500 dark:text-zinc-400">{{ tip.text }}</p>
        </div>
      </li>
    </ol>

    <div class="mt-8 text-center">
      <button
        type="button"
        class="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg bg-sky-500 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600 sm:min-h-0 sm:py-2"
        @click="emit('add')"
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
        创建第一个任务
      </button>
    </div>
  </div>
</template>
