<template>
    <!-- 헤더 -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-4 py-3.5 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="flex justify-center items-center">
          <router-link to="/" class="text-2xl font-extrabold bg-[#0086ff] bg-clip-text text-transparent">Genie</router-link>
        </div>
      </div>
      <router-link :to="{ name: 'my-page-wrapper', query: { tab: '공지사항' } }">
        <button class="p-2 rounded-full hover:bg-gray-100/80 transition-colors">
          <svg class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </router-link>
    </header>

    <!-- 보유 이용권 -->
    <section class="px-4 py-6 bg-white">
      <WelcomInfo />
    </section>

    <!-- 빠른 시작 -->
    <section class="px-4 py-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">빠른 시작</h2>
      <div class="grid grid-cols-2 gap-4">
        <router-link to="/passage" class="relative bg-white rounded-2xl shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col items-center text-center h-48 overflow-hidden group border border-gray-100">
          <div class="relative z-10 flex flex-col items-center justify-center h-full">
            <img src="@/assets/icons/m_passage.png" alt="" class="w-32 h-32 mb-2 transform group-hover:scale-105 transition-transform duration-300 opacity-80">
            <h3 class="font-medium text-sky-600 text-sm bg-sky-50 px-4 py-1.5 rounded-lg border border-sky-100">지문 생성</h3>
          </div>
        </router-link>

        <router-link to="/questions" class="relative bg-white rounded-2xl shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col items-center text-center h-48 overflow-hidden group border border-gray-100">
          <div class="relative z-10 flex flex-col items-center justify-center h-full">
            <img src="@/assets/icons/m_question.png" alt="" class="w-40 mb-2 transform group-hover:scale-105 transition-transform duration-300 opacity-80">
            <h3 class="font-medium text-purple-600 text-sm bg-purple-50 px-4 py-1.5 rounded-lg border border-purple-100">문항 생성</h3>
          </div>
        </router-link>
      </div>
    </section>

    <!-- 최근 작업 내역 -->
    <section class="py-6 bg-white">
      <div class="flex items-center justify-between mb-4 px-4">
        <h2 class="text-lg font-semibold text-gray-800">최근 작업</h2>
        <router-link to="/storage/worklistMain" class="text-sm text-indigo-600">더보기</router-link>
      </div>
      <WorkList />
    </section>
</template>
<script setup>
import WelcomInfo from "@/views/main/WelcomInfo.vue";
import WorkList from "@/views/main/WorkList.vue";
</script>