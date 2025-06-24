<template>
  <div class="w-full bg-white">
    <div class="max-w-[1440px]">
      <h2 class="text-xl sm:text-2xl font-semibold text-[#16252d] px-3 sm:px-6 pt-12 sm:pt-12 pb-3">마이페이지</h2>
      <div class="flex flex-wrap items-center gap-3 sm:gap-4 px-3 sm:px-6">
        <span
          v-for="tab in tabs"
          :key="tab"
          @click="selectedTab = tab"
          :class="[
            'cursor-pointer text-sm sm:text-base font-normal py-2 px-3 sm:px-4 transition-all duration-200',
            selectedTab === tab ? 'font-bold border-b-2 border-[#0086FF]' : 'hover:text-[#0086FF]'
          ]"
        >
          {{ tab }}
        </span>
      </div>
    </div>
  </div>
  <MyPageContent :selectedTab="selectedTab" />
</template>

<script setup>
import { ref, onMounted } from "vue";
import MyPageContent from "./MyPageContent.vue";
import { useRoute } from "vue-router";

const route = useRoute();

/* 탭 목록 */
const tabs = ["회원정보", "이용권", "공지사항", "자주 묻는 질문"];

// 현재 선택된 탭 (기본값 : 회원정보)
const selectedTab = ref("회원정보");

onMounted(() => {
  // 라우터 쿼리 파라미터가 있고, 유효한 탭 값인 경우에만 설정
  if (route.query.tab && tabs.includes(route.query.tab)) {
    selectedTab.value = route.query.tab;
  } else {
    // 쿼리 파라미터가 없거나 유효하지 않은 경우, 기본값 유지
    selectedTab.value = "회원정보";
  }
});
</script>
