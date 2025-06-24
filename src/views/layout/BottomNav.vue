<template>
  <nav class="fixed bottom-0 left-0 right-0 h-[60px] bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-50">
    <div class="flex h-full">
      <router-link to="/" class="flex flex-col items-center justify-center flex-1 text-gray-600 text-xs no-underline hover:text-[#0086ff]" :class="{ 'text-[#0086ff]': isActiveHome }">
        <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>홈</span>
      </router-link>
      <router-link to="/passage" class="flex flex-col items-center justify-center flex-1 text-gray-600 text-xs no-underline hover:text-[#0086ff]" :class="{ 'text-[#0086ff]': isActivePassage }">
        <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h6l5 5v11a2 2 0 01-2 2z" />
        </svg>
        <span>지문생성</span>
      </router-link>
      <router-link to="/questions" class="flex flex-col items-center justify-center flex-1 text-gray-600 text-xs no-underline hover:text-[#0086ff]" :class="{ 'text-[#0086ff]': isActiveQuestions }">
        <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h8" />
        </svg>
        <span>문항생성</span>
      </router-link>
      <router-link to="/storage" class="flex flex-col items-center justify-center flex-1 text-gray-600 text-xs no-underline hover:text-[#0086ff]" :class="{ 'text-[#0086ff]': isActiveStorage }">
        <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <span>자료실</span>
      </router-link>
      <router-link to="/mypage" class="flex flex-col items-center justify-center flex-1 text-gray-600 text-xs no-underline hover:text-[#0086ff]" :class="{ 'text-[#0086ff]': isActiveMypage }">
        <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A9.004 9.004 0 0112 15c2.003 0 3.847.66 5.243 1.765M15 11a3 3 0 11-6 0 3 3 0 016 0zm7 1a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>마이페이지</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const isActiveHome = computed(() => {
  return route.path === '/home' || route.path === '';
});

const isActivePassage = computed(() => {
  return route.path.startsWith('/passage');
});

const isActiveQuestions = computed(() => {
  return route.path.startsWith('/questions');
});

const isActiveStorage = computed(() => {
  return route.path.startsWith('/storage');
});

const isActiveMypage = computed(() => {
  return route.path.startsWith('/mypage');
});
</script>

<style scoped>
</style> 