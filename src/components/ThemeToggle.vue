<script setup lang="ts">
import { onMounted, ref } from 'vue'

const STORAGE_KEY = 'vibe-coding-demo1-theme'

const isDark = ref(false)

function apply(dark: boolean) {
  isDark.value = dark
  document.documentElement.classList.toggle('dark', dark)
}

function toggle() {
  const next = !isDark.value
  apply(next)
  localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
}

/**
 * 首屏的 class 由 index.html 里的内联脚本设置（在渲染前执行，避免闪一下亮色），
 * 这里只把状态读回来，保证按钮图标和实际主题一致。
 */
onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})
</script>

<template>
  <button
    type="button"
    class="grid size-11 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 sm:size-9 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
    :aria-label="isDark ? '切换到亮色模式' : '切换到深色模式'"
    :aria-pressed="isDark"
    @click="toggle"
  >
    <!-- 深色模式中显示太阳（点击切回亮色） -->
    <svg
      v-if="isDark"
      class="size-4.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
      />
    </svg>

    <!-- 亮色模式中显示月亮 -->
    <svg
      v-else
      class="size-4.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  </button>
</template>
