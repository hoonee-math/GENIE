<template>
  <!-- 탭 이벤트 감지 및 조건부 렌더링 -->
  <div v-if="isVisible">
    <div class="w-full bg-white">
      <div class="max-w-[1440px]">
        <h2 class="text-xl sm:text-2xl font-semibold text-[#16252d] px-3 sm:px-6 pt-12 sm:pt-12 pb-3">마이페이지</h2>
        <div class="flex flex-wrap items-center gap-3 sm:gap-4 px-3 sm:px-6 pb-4">
          <span
            v-for="tab in tabs"
            :key="tab"
            @click="handleTabClick(tab)"
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
    <MyPageContent v-if="!isNoticeDetailVisible" :selectedTab="selectedTab" />

    <!-- 공지사항 상세 내용 -->
    <div v-if="isNoticeDetailVisible" class="w-full bg-[#f9fafb] min-h-[calc(100vh-182px)]">
      <div class="max-w-[1440px] mx-auto p-4 sm:p-6">
        <!-- 제목 -->
        <h2 class="text-xl sm:text-2xl font-semibold text-[#16252d] mb-5">공지사항</h2>

        <div class="bg-white w-full rounded-xl p-4 sm:p-6">
          <div class="border-b border-[#e0e0e0]">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 p-4">
              <div class="flex items-center gap-4">
                <span class="text-sm sm:text-base text-[#303030]">{{ noticeDetails?.NOT_TYPE || "서비스" }}</span>
                <h3 class="text-base sm:text-lg font-semibold text-[#303030]">{{ noticeDetails?.NOT_TITLE || "제목 없음" }}</h3>
              </div>
              <span class="text-sm text-[#666]">등록일 : {{ noticeDetails?.NOT_DATE || "YYYY-MM-DD" }}</span>
            </div>
          </div>

          <div class="p-4 sm:p-6" v-if="noticeDetails">
            <p v-for="(line, index) in contentLines" :key="index" class="text-sm sm:text-base text-[#303030] leading-relaxed mb-3">
              {{ line }}
            </p>
          </div>

          <div class="flex justify-center mt-8">
            <button 
              @click="backToNoticeList" 
              class="px-6 py-2.5 text-sm sm:text-base text-[#303030] border border-[#757575] rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              목록으로
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import MyPageContent from "@/views/mypage/MyPageContent.vue";

// 라우터와 스토어 초기화
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const notCode = parseInt(route.params.id);
const noticeDetails = ref(null);

/* 현재 선택된 탭 (기본값: 공지사항) */
const selectedTab = ref("공지사항");

/* 탭 목록 */
const tabs = ["회원정보", "이용권", "공지사항", "자주 묻는 질문"];

/* 컴포넌트 표시 여부 */
const isVisible = ref(true);
const isNoticeDetailVisible = ref(true);

/* 탭 클릭 핸들러 */
const handleTabClick = (tab) => {
  selectedTab.value = tab;

  // 공지사항 탭이 아닌 경우 공지사항 상세 내용 숨김
  if (tab !== "공지사항") {
    isNoticeDetailVisible.value = false;
  } else {
    // 공지사항 탭이면 공지사항 목록으로 이동
    backToNoticeList();
  }
};

// 줄바꿈 기준으로 콘텐츠를 분리
const contentLines = computed(() => {
  if (!noticeDetails.value || !noticeDetails.value.NOT_CONTENT) return [];
  return noticeDetails.value.NOT_CONTENT.split("\\n");
});

/* 공지사항 목록으로 돌아가기 */
const backToNoticeList = () => {
  isNoticeDetailVisible.value = false;
  router.push("/mypage?tab=공지사항");
};

onMounted(() => {
  fetchNoticeDetails();
});

const fetchNoticeDetails = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  fetch(`/api/noti/select/each?notCode=${notCode}`, {
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
      noticeDetails.value = {
        NOT_CODE: data.notCode,
        NOT_TYPE: data.type,
        NOT_TITLE: data.title,
        NOT_DATE: data.date,
        NOT_CONTENT: data.content || "",
      };
    })
    .catch((error) => {});
};
</script>
