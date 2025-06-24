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
