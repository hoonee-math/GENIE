<template>
  <!-- 데스트탑 -->
  <div class="hidden md:block w-full h-full overflow-scroll flex flex-col">
    <div class="flex gap-6 p-12">
      <div class="flex-1 min-w-0">
        <WelcomInfo />
      </div>
      <div class="flex-1 min-w-0">
        <NoticeList />
      </div>
    </div>
    <WorkList />
  </div>

  <!-- 모바일 -->
  <div class="md:hidden w-full h-full overflow-scroll flex flex-col bg-gray-50">
    <MainHomeMobile />
  </div>
</template>

<script setup>
import WelcomInfo from "@/views/main/WelcomInfo.vue";
import NoticeList from "@/views/main/NoticeList.vue";
import WorkList from "@/views/main/WorkList.vue";
import MainHomeMobile from "./MainHomeMobile.vue";
</script>
