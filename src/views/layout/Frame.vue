<template>
  <div class="flex min-h-screen">
    <Sidebar class="hidden md:block" />

    <div class="flex-1 bg-gray-50 w-full md:w-[calc(100vw-154px)] h-screen overflow-scroll md:pb-0 pb-[60px]">
      <router-view />
    </div>
    
    <BottomNav class="md:hidden" />
  </div>
</template>

<script setup>
import Sidebar from "@/views/layout/Sidebar.vue";
import BottomNav from "@/views/layout/BottomNav.vue";
</script>

<style>

/* 스크롤 개선 */
.scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
}

.scrollbar-thin::-webkit-scrollbar {
    width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

.scrollbar-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
</style>