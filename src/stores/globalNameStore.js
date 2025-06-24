import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// pinia 라이브러리를 이용해서 전역에서 데이터를 공유할 변수 설정
export const useGlobalNameStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
