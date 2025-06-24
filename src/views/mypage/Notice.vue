<template>
  <div class="w-full mx-auto p-4 sm:p-6 pt-8 sm:pt-12">
    <h2 class="relative mb-5 font-bold text-xl sm:text-2xl tracking-tight text-black">
      공지사항
    </h2>

    <!-- 상단 필터 -->
    <div class="flex">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="changeTab(tab.value)"
        class="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base rounded-t-xl m-0 relative transition-all duration-200 z-[1]"
        :class="selectedTab === tab.value ? 'font-semibold text-black bg-white z-[2]' : 'text-[#666] bg-[#0088ff1c]'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 공지사항 목록 -->
    <div class="flex flex-col justify-between bg-white w-full min-h-[459px] p-4 sm:p-6 rounded-tr-xl rounded-br-xl rounded-bl-xl">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th class="bg-white p-3 text-left font-semibold text-sm text-[#303030] border-b border-[#757575] w-20">분류</th>
              <th class="bg-white p-3 text-left font-semibold text-sm text-[#303030] border-b border-[#757575] w-[250px]">제목</th>
              <th class="bg-white p-3 text-left font-semibold text-sm text-[#303030] border-b border-[#757575] w-[150px]">등록일</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="notice in paginatedNotices" :key="notice.NOT_CODE">
              <td class="p-3 text-sm text-[#303030] border-b border-[#e0e0e0]">{{ notice.NOT_TYPE }}</td>
              <td class="p-3 text-sm text-[#303030] border-b border-[#e0e0e0]">
                <router-link
                  :to="`/notice/${notice.NOT_CODE}`"
                  class="text-[#303030] hover:text-[#0086FF] transition-colors duration-200"
                >
                  {{ notice.NOT_TITLE }}
                </router-link>
              </td>
              <td class="p-3 text-sm text-[#303030] border-b border-[#e0e0e0]">{{ notice.NOT_DATE }}</td>
            </tr>
            <tr v-if="paginatedNotices.length === 0">
              <td colspan="3" class="text-center p-5">공지사항이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div class="flex justify-center items-center w-full mt-5 gap-2" v-if="totalPages > 0">
        <button
          v-if="totalPages > 5"
          @click="prevPage"
          :disabled="currentPage === 1"
          class="border-none bg-transparent px-2.5 py-1.5 text-sm cursor-pointer hover:font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &lt;
        </button>

        <span
          v-for="page in visiblePages"
          :key="page"
          @click="changePage(page)"
          :class="{ 'text-[#0086FF] underline': currentPage === page }"
          class="inline-block min-w-[26px] text-center text-sm cursor-pointer select-none outline-none"
        >
          {{ page }}
        </span>

        <button
          v-if="totalPages > 5"
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="border-none bg-transparent px-2.5 py-1.5 text-sm cursor-pointer hover:font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &gt;
        </button>
        <button
          @click="lastPage"
          :disabled="currentPage === totalPages"
          class="border-none bg-transparent px-2.5 py-1.5 text-sm cursor-pointer hover:font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &raquo;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// 라우터와 스토어 초기화
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

/* 공지사항 필터 */
const tabs = [
  { label: "전체", value: "all" },
  { label: "서비스", value: "service" },
  { label: "작업", value: "job" },
];

/* 현재 선택된 탭 */
const selectedTab = ref("all");

/* 공지사항 데이터 */
const notices = ref([]);

// 컴포넌트 마운트 시, 데이터 로드
onMounted(() => {
  fetchNotices();
});

// 공지사항 데이터 가져오기
const fetchNotices = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  fetch(`/api/noti/select/list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        // 인증 오류 처리 (401)
        if (response.status === 401) {
          // (추가) 로그 - 인증 오류 감지

          // 인증 상태 초기화
          authStore.user = null;
          authStore.isAuthenticated = false;
          localStorage.removeItem("authUser");

          // 로그인 페이지로 리다이렉트
          router.push({
            path: "/login",
            query: { redirect: route.fullPath },
          });

          // 추가 처리를 중단하기 위한 에러 발생
          throw new Error("인증이 필요합니다");
        }
        return response.text().then((text) => {
          throw new Error(text);
        });
      }
      return response.json();
    })
    .then((data) => {
      // 응답 데이터 구조에 맞게 매핑
      notices.value = data.map((item) => ({
        NOT_CODE: item.notCode,
        NOT_TYPE: item.type,
        NOT_TITLE: item.title,
        NOT_DATE: item.date,
        NOT_CONTENT: item.content || "",
      }));
    })
    .catch((error) => {});
};

/* 필터링된 공지사항 목록 */
const filteredNotices = computed(() => {
  if (selectedTab.value === "all") return notices.value;
  return notices.value.filter(
    (n) => n.NOT_TYPE === (selectedTab.value === "service" ? "서비스" : "작업")
  );
});

/* 페이지네이션 */
const currentPage = ref(1);
const itemsPerPage = 10;
const maxVisiblePages = 5;

/* 총 페이지 수 */
const totalPages = computed(() =>
  Math.ceil(filteredNotices.value.length / itemsPerPage)
);

/* 현재 페이지에 맞는 데이터 */
const paginatedNotices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredNotices.value.slice(start, start + itemsPerPage);
});

/*  표시할 페이지 목록 */
const visiblePages = computed(() => {
  const total = totalPages.value;
  const startPage =
    Math.floor((currentPage.value - 1) / maxVisiblePages) * maxVisiblePages + 1;
  const endPage = Math.min(startPage + maxVisiblePages - 1, total);
  return Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );
});

/* 페이지 변경 함수 */
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

/* 이전 페이지 이동 (한 칸 이동) */
const prevPage = () => {
  let page = currentPage.value - 1;

  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  } else {
    currentPage.value = Math.min(1, totalPages.value);
  }
};

/* 다음 페이지 이동 (한 칸 이동) */
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

/* 마지막 페이지 이동 */
const lastPage = () => {
  currentPage.value = totalPages.value;
};

const changeTab = (tab) => {
  selectedTab.value = tab;
  currentPage.value = 1;
};
</script>