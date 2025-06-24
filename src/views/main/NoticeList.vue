<template>
  <div class="flex-1">
    <div class="bg-white rounded-xl shadow-sm p-4 h-full flex flex-col min-h-[220px]">
      <!-- 상단 제목줄 + 밑줄 -->
      <div
        class="flex items-center justify-between pb-1 border-b border-gray-200 mb-3"
      >
        <router-link
          :to="{ name: 'my-page-wrapper', query: { tab: '공지사항' } }"
          class="flex items-center justify-between w-full"
        >
          <h3 class="text-xl font-semibold text-gray-800 cursor-pointer">
            공지사항
          </h3>
          <!-- 우측 화살표 -->
          <svg
            class="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M9 18l6-6-6-6"></path>
          </svg>
        </router-link>
      </div>

      <!-- 목록 -->
      <ul class="divide-y text-sm text-gray-700 flex-grow">
        <li
          v-for="notice in notices"
          :key="notice.NOT_CODE"
          class="py-2 hover:font-semibold flex justify-between items-center cursor-pointer"
        >
          <router-link
            :to="`/notice/${notice.NOT_CODE}`"
            class="block truncate"
          >
            {{ notice.NOT_TITLE }}
          </router-link>
          <span
            v-if="isNewNotice(notice.NOT_DATE)"
            class="text-xs bg-brand-10 text-brand font-medium px-2 py-0.5 rounded-full flex-shrink-0 ml-2"
          >
            NEW
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const notices = ref([]);

onMounted(() => {
  fetchNotices();
});

// 공지사항이 7일 이내인지 확인하는 함수
const isNewNotice = (date) => {
  const noticeDate = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now - noticeDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
};

const fetchNotices = () => {
  fetch(`/api/noti/select/list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 401) {
          authStore.user = null;
          authStore.isAuthenticated = false;
          localStorage.removeItem("authUser");
          router.push({
            path: "/login",
            query: { redirect: route.fullPath },
          });
          throw new Error("인증이 필요합니다");
        }
        return response.text().then((text) => {
          throw new Error(text);
        });
      }
      return response.json();
    })
    .then((data) => {
      notices.value = data
        .map((item) => ({
          NOT_CODE: item.notCode,
          NOT_TYPE: item.type,
          NOT_TITLE: item.title,
          NOT_DATE: item.date,
          NOT_CONTENT: item.content || "",
        }))
        .slice(0, 4);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
</script>
