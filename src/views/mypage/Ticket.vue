<template>
  <div class="w-full mx-auto p-4 sm:p-6 pt-8 sm:pt-12">
    <h2
      class="relative mb-5 font-bold text-xl sm:text-2xl tracking-tight text-black"
    >
      {{ userData.name }}님의 이용권 정보
    </h2>

    <div class="flex flex-col sm:flex-row w-full gap-4 sm:gap-5 mb-5">
      <div
        class="flex w-full sm:w-[300px] bg-white rounded-lg p-4 sm:p-5 shadow-sm"
      >
        <div
          class="flex justify-between items-center gap-1.5 cursor-pointer w-full"
        >
          <span class="text-lg sm:text-xl font-bold text-[#303030]"
            >나의 잔여 이용권</span
          >
          <span class="text-lg sm:text-xl font-bold ml-2.5 text-[#0086FF]">{{
            ticketCount
          }}</span>
          <span class="text-lg sm:text-xl font-bold text-[#303030]">회</span>
        </div>
      </div>

      <div class="w-full sm:w-[300px] bg-white rounded-lg p-4 sm:p-5 shadow-sm">
        <div
          class="flex justify-between items-center gap-1.5 cursor-pointer w-full"
          @click="showUsageHistoryModal = true"
        >
          <span class="text-lg sm:text-xl font-bold text-[#303030]"
            >이용 내역 조회</span
          >
          <span class="text-2xl text-[#999]">›</span>
        </div>
      </div>
    </div>

    <!-- 탭 영역 -->
    <div class="overflow-hidden pt-4">
      <div class="pb-0 mb-0 w-full sm:w-fit">
        <div class="flex">
          <button
            class="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base rounded-t-xl m-0 relative transition-all duration-200 z-[1]"
            :class="{
              'font-semibold text-black bg-white z-[2]': activeTab === 'usage',
              'text-[#666] bg-[#0088ff1c]': activeTab !== 'usage',
            }"
            @click="activeTab = 'usage'"
          >
            이용권 구매
          </button>
          <button
            class="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base rounded-t-xl m-0 relative transition-all duration-200 z-[1]"
            :class="{
              'font-semibold text-black bg-white z-[2]':
                activeTab === 'history',
              'text-[#666] bg-[#0088ff1c]': activeTab !== 'history',
            }"
            @click="activeTab = 'history'"
          >
            결제 내역 조회
          </button>
        </div>
      </div>

      <!-- 콘텐츠 영역 -->
      <div
        class="bg-white w-full min-h-[459px] p-4 sm:p-6 rounded-tr-xl rounded-br-xl rounded-bl-xl"
      >
        <!-- 이용권 패키지 영역 -->
        <div v-if="activeTab === 'usage'">
          <div>
            <h3
              class="text-lg sm:text-xl font-bold text-[#303030] pb-6 sm:pb-8"
            >
              이용권 패키지
            </h3>

            <div class="flex flex-col gap-4 sm:gap-5">
              <!-- 10회 이용권 -->
              <div
                class="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-5 w-full min-h-[87px] bg-white border border-[#BDBDBD] rounded-lg justify-between gap-4 sm:gap-2"
              >
                <div
                  class="flex flex-col items-start p-0 gap-2 w-full sm:w-[240px] h-[30px]"
                >
                  <span
                    class="font-normal text-base sm:text-xl leading-[150%] tracking-tight text-[#303030] whitespace-nowrap"
                    >지문/문항 생성 10회 이용권</span
                  >
                </div>
                <div
                  class="flex flex-col sm:flex-row justify-end items-start sm:items-center p-0 h-auto sm:h-[47px] w-full sm:w-auto gap-4 sm:gap-2"
                >
                  <div
                    class="flex flex-row justify-end items-center p-0 gap-2 w-full sm:w-[255px] h-6"
                  >
                    <span
                      class="font-medium text-sm sm:text-base leading-[150%] text-right tracking-tight line-through text-[#303030]"
                      >20,000원</span
                    >
                  </div>
                  <button
                    class="flex flex-row justify-center items-center p-2 gap-2 w-full sm:w-[255px] h-[47px] bg-[#0086FF] rounded-lg border-none text-white hover:bg-[#0066CC] transition-colors duration-200"
                    @click="openPurchaseWarningModal(10)"
                  >
                    구매하기
                  </button>
                </div>
              </div>

              <!-- 30회 이용권 -->
              <div
                class="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-5 w-full min-h-[87px] bg-white border border-[#BDBDBD] rounded-lg justify-between gap-4 sm:gap-2"
              >
                <div
                  class="flex flex-col items-start p-0 gap-2 w-full sm:w-[240px] h-[30px]"
                >
                  <span
                    class="font-normal text-base sm:text-xl leading-[150%] tracking-tight text-[#303030] whitespace-nowrap"
                    >지문/문항 생성 30회 이용권</span
                  >
                </div>
                <div
                  class="flex flex-col sm:flex-row justify-end items-start sm:items-center p-0 h-auto sm:h-[47px] w-full sm:w-auto gap-4 sm:gap-2"
                >
                  <div
                    class="flex flex-row justify-end items-center p-0 gap-2 w-full sm:w-[255px] h-6"
                  >
                    <span
                      class="font-medium text-sm sm:text-base leading-[150%] text-right tracking-tight line-through text-[#303030]"
                      >60,000원</span
                    >
                    <span
                      class="flex flex-row justify-center items-center px-2.5 py-0 gap-2.5 font-medium text-sm sm:text-base leading-[150%] text-right tracking-tight text-[#0086FF]"
                      >5% 할인</span
                    >
                    <span
                      class="flex flex-row justify-center items-center px-2.5 py-0 gap-2.5 font-bold text-sm sm:text-base leading-[150%] text-right tracking-tight text-[#0086FF]"
                      >57,000원</span
                    >
                  </div>
                  <button
                    class="flex flex-row justify-center items-center p-2 gap-2 w-full sm:w-[255px] h-[47px] bg-[#0086FF] rounded-lg border-none text-white hover:bg-[#0066CC] transition-colors duration-200"
                    @click="openPurchaseWarningModal(30)"
                  >
                    구매하기
                  </button>
                </div>
              </div>

              <!-- 50회 이용권 -->
              <div
                class="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-5 w-full min-h-[87px] bg-white border border-[#BDBDBD] rounded-lg justify-between gap-4 sm:gap-2"
              >
                <div
                  class="flex flex-col items-start p-0 gap-2 w-full sm:w-[240px] h-[30px]"
                >
                  <span
                    class="font-normal text-base sm:text-xl leading-[150%] tracking-tight text-[#303030] whitespace-nowrap"
                    >지문/문항 생성 50회 이용권</span
                  >
                </div>
                <div
                  class="flex flex-col sm:flex-row justify-end items-start sm:items-center p-0 h-auto sm:h-[47px] w-full sm:w-auto gap-4 sm:gap-2"
                >
                  <div
                    class="flex flex-row justify-end items-center p-0 gap-2 w-full sm:w-[255px] h-6"
                  >
                    <span
                      class="font-medium text-sm sm:text-base leading-[150%] text-right tracking-tight line-through text-[#303030]"
                      >100,000원</span
                    >
                    <span
                      class="flex flex-row justify-center items-center px-2.5 py-0 gap-2.5 font-medium text-sm sm:text-base leading-[150%] text-right tracking-tight text-[#0086FF]"
                      >10% 할인</span
                    >
                    <span
                      class="flex flex-row justify-center items-center px-2.5 py-0 gap-2.5 font-bold text-sm sm:text-base leading-[150%] text-right tracking-tight text-[#0086FF]"
                      >90,000원</span
                    >
                  </div>
                  <button
                    class="flex flex-row justify-center items-center p-2 gap-2 w-full sm:w-[255px] h-[47px] bg-[#0086FF] rounded-lg border-none text-white hover:bg-[#0066CC] transition-colors duration-200"
                    @click="openPurchaseWarningModal(50)"
                  >
                    구매하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 결제 내역 영역 -->
        <div v-else-if="activeTab === 'history'">
          <div>
            <div
              class="flex flex-col sm:flex-row justify-between items-start sm:items-center my-5 gap-4 sm:gap-0"
            >
              <div
                class="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 w-full sm:w-auto"
              >
                <div class="relative inline-block w-full sm:w-auto">
                  <select
                    class="w-full sm:w-[120px] pl-4 pr-8 py-2 border border-[#ddd] rounded-md bg-white text-sm text-[#303030] appearance-none cursor-pointer"
                    v-model="selectedPeriod"
                    @change="updateDateRange"
                  >
                    <option value="">기간 선택</option>
                    <option value="1">최근 1개월</option>
                    <option value="3">최근 3개월</option>
                    <option value="6">최근 6개월</option>
                    <option value="12">최근 12개월</option>
                  </select>
                  <div
                    class="absolute top-1/2 right-3 -translate-y-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-black pointer-events-none"
                  ></div>
                </div>
                <div class="flex items-center w-full sm:w-auto">
                  <input
                    type="date"
                    class="w-full sm:w-[120px] px-2.5 py-2 border border-[#ddd] rounded text-sm cursor-pointer"
                    v-model="startDate"
                  />
                  <span class="mx-1.5 text-[#666]">-</span>
                  <input
                    type="date"
                    class="w-full sm:w-[120px] px-2.5 py-2 border border-[#ddd] rounded text-sm cursor-pointer"
                    v-model="endDate"
                  />
                </div>
                <button
                  class="w-full sm:w-auto bg-[#0086FF] text-white border-none rounded px-4 py-2 text-sm font-medium cursor-pointer"
                  @click="fetchPaymentHistory"
                >
                  검색
                </button>
              </div>
              <div class="flex items-center w-full sm:w-auto justify-end">
                <button
                  class="flex items-center gap-1.5 bg-transparent border-none text-sm text-[#303030] cursor-pointer w-full sm:w-auto justify-center sm:justify-start"
                  @click="downloadExcel"
                >
                  <span>거래내역 다운로드</span>
                  <Icon
                    class="download-icon"
                    icon="ic:baseline-download"
                    width="24"
                    height="24"
                    style="color: #757575"
                  />
                </button>
              </div>
            </div>

            <div class="mb-5 border border-[#e0e0e0] rounded overflow-x-auto">
              <table class="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr>
                    <th
                      class="bg-white p-3 text-left font-semibold text-sm text-[#303030] border-b border-[#757575] w-20"
                    >
                      순번
                    </th>
                    <th
                      class="bg-white p-3 text-left font-semibold text-sm text-[#303030] border-b border-[#757575] w-[250px]"
                    >
                      결제 내역
                    </th>
                    <th
                      class="bg-white p-3 text-left font-semibold text-sm text-[#303030] border-b border-[#757575] w-[120px]"
                    >
                      금액
                    </th>
                    <th
                      class="bg-white p-3 text-left font-semibold text-sm text-[#303030] border-b border-[#757575] w-[150px]"
                    >
                      결제 날짜
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in paginatedHistory"
                    :key="item.payCode"
                  >
                    <td
                      class="p-3 text-sm text-[#303030] border-b border-[#e0e0e0]"
                    >
                      {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                    </td>
                    <td
                      class="p-3 text-sm text-[#303030] border-b border-[#e0e0e0]"
                    >
                      {{ item.payName }}
                    </td>
                    <td
                      class="p-3 text-sm text-[#303030] border-b border-[#e0e0e0]"
                    >
                      {{ item.price }}
                    </td>
                    <td
                      class="p-3 text-sm text-[#303030] border-b border-[#e0e0e0]"
                    >
                      {{ item.date }}
                    </td>
                  </tr>
                  <tr v-if="paginatedHistory.length === 0">
                    <td colspan="4" class="text-center p-5">
                      결제 내역이 없습니다.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              class="flex justify-center items-center w-full mt-5 gap-2"
              v-if="totalPages > 0"
            >
              <button
                v-if="totalPages > 5"
                @click="prevPage"
                :disabled="currentPage === 1"
                class="border-none bg-transparent px-2.5 py-1.5 text-sm cursor-pointer hover:font-bold"
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
                class="border-none bg-transparent px-2.5 py-1.5 text-sm cursor-pointer hover:font-bold"
              >
                &gt;
              </button>
              <button
                @click="lastPage"
                :disabled="currentPage === totalPages"
                class="border-none bg-transparent px-2.5 py-1.5 text-sm cursor-pointer hover:font-bold"
              >
                &raquo;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 모달 컴포넌트들 -->
    <UsageHistoryModal
      :isOpen="showUsageHistoryModal"
      @close="showUsageHistoryModal = false"
    />

    <WarningModalComponent
      :isOpen="isPurchaseWarningModal"
      title="이용권을 구매하시겠습니까?"
      :message="`${purchaseCount}회의 이용권이 충전됩니다.`"
      cancelText="취소하기"
      confirmText="구매하기"
      @close="closeWarningModal"
      @confirm="onWarningConfirm"
    />

    <TossPay
      v-if="showTossPayModal"
      ref="tossPayRef"
      :defaultAmount="ticketPay"
      :orderName="`${purchaseCount}회 이용권`"
      :customerEmail="userData.email"
      :customerName="userData.name"
      :ticCode="purchaseTicket"
    />

    <ConfirmModalComponent
      :isOpen="isConfirmModalOpen"
      title="확인"
      message="구매가 완료되었습니다."
      @close="isConfirmModalOpen = false"
      @confirm="isConfirmModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { apiGet } from "@/utils/http"; // 보안 우선 API 시스템
import UsageHistoryModal from "@/components/mypage/UsageHistoryModal.vue";
import WarningModalComponent from "@/components/common/WarningModalComponent.vue";
import ConfirmModalComponent from "@/components/common/ConfirmModalComponent.vue";
import TossPay from "@/components/payment/TossPay.vue";

// <script setup> 내에 추가
import * as XLSX from "xlsx";

// 라우터와 스토어 초기화
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 사용자 정보를 computed 속성으로 가져오기
const userData = computed(() => authStore.user);
console.log(userData);

// 모달 상태 관리
const showUsageHistoryModal = ref(false);
const isPurchaseWarningModal = ref(false);
const isConfirmModalOpen = ref(false);
const showTossPayModal = ref(false);
const tossPayRef = ref(null);

// 활성화된 탭 상태 관리
const activeTab = ref("usage");

// 날짜 관련 상태 관리
const selectedPeriod = ref("");
const startDate = ref("");
const endDate = ref("");

// 페이지네이션 관련 상태 추가
const currentPage = ref(1);
const itemsPerPage = 5;
const maxVisiblePages = 5;

// 임시 결제 내역 데이터 (실제로는 API 요청으로 대체)
const paymentHistory = ref([]);

// 결제 내역 조회 - 보안 우선 API 시스템 사용
const fetchPaymentHistory = async () => {
  try {
    // 날짜가 비어있으면 기본값 설정
    const startDateEncoded = encodeURIComponent(startDate.value || "1970-01-01");
    const endDateEncoded = encodeURIComponent(
      endDate.value || getTodayFormatted()
    );

    // 마이그레이션 가이드에 따른 새로운 API 호출 방식
    const data = await apiGet(
      `/api/paym/select/list?startDate=${startDateEncoded}&endDate=${endDateEncoded}&page=${currentPage.value}&size=${itemsPerPage}`
    );
    
    paymentHistory.value = data.map((item) => ({
      payCode: item.payCode,
      payName: item.payName,
      price: item.price,
      date: item.date,
    }));
    
    console.log('결제 내역 조회 성공 - 보안 우선 시스템 사용');
  } catch (error) {
    console.error('결제 내역 조회 오류:', error);
    // 에러 처리는 apiGet에서 자동으로 처리됨 (401 에러 포함)
  }
};

// 필터링된 내역 계산
const filteredHistory = computed(() => {
  return paymentHistory.value;
});

// 총 페이지 수 계산
const totalPages = computed(() => {
  if (!filteredHistory.value || filteredHistory.value.length === 0) return 1;
  return Math.ceil(filteredHistory.value.length / itemsPerPage);
});

// 페이지네이션된 내역 계산
const paginatedHistory = computed(() => {
  if (!filteredHistory.value || filteredHistory.value.length === 0) return [];
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredHistory.value.slice(start, start + itemsPerPage);
});

// 표시할 페이지 배열 계산
const visiblePages = computed(() => {
  const total = totalPages.value;
  if (total <= 1) return [1];

  const startPage = Math.max(
    1,
    Math.floor((currentPage.value - 1) / maxVisiblePages) * maxVisiblePages + 1
  );
  const endPage = Math.min(startPage + maxVisiblePages - 1, total);

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );
});

// 페이지 변경 함수
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchPaymentHistory();
  }
};

// 이전 페이지 이동
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// 다음 페이지 이동
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// 마지막 페이지 이동
const lastPage = () => {
  currentPage.value = totalPages.value;
};

const changeTab = (tab) => {
  selectedTab.value = tab;
  currentPage.value = 1;
};

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
const getTodayFormatted = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// n개월 전 날짜를 YYYY-MM-DD 형식으로 반환
const getMonthsAgoFormatted = (months) => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 선택한 기간에 따라 날짜 범위 업데이트
const updateDateRange = () => {
  if (selectedPeriod.value) {
    const months = parseInt(selectedPeriod.value);
    endDate.value = getTodayFormatted();
    startDate.value = getMonthsAgoFormatted(months);
  }
};

// 구매하기 경고모달 관련
const purchaseTicket = ref(0);
const TicketPayment = ref(0);

// ticCode에 따른 이용권 횟수 매핑
const ticketMapping = {
  1: 10,
  2: 30,
  3: 50,
};
const ticketPayMapping = {
  1: 20000,
  2: 57000,
  3: 90000,
};

const openPurchaseWarningModal = (count) => {
  // ticCode로 매핑되도록 수정
  if (count === 10) {
    purchaseTicket.value = 1;
    TicketPayment.value = 1;
  } else if (count === 30) {
    purchaseTicket.value = 2;
    TicketPayment.value = 2;
  } else if (count === 50) {
    purchaseTicket.value = 3;
    TicketPayment.value = 3;
  }
  isPurchaseWarningModal.value = true;
};

const purchaseCount = computed(() => {
  return ticketMapping[purchaseTicket.value] || 0;
});

const ticketPay = computed(() => {
  return ticketPayMapping[TicketPayment.value] || 0;
});

const isProcessing = ref(false);

// 구매확인 함수
const purchaseModal = () => {
  if (isProcessing.value) return; // 중복 클릭 방지
  isProcessing.value = true; //처리 중 상태 설정

  // const apiUrl = import.meta.env.VITE_API_URL;

  // fetch(`/api/paym/insert/each`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   credentials: "include",
  //   body: JSON.stringify({
  //     ticCode: purchaseTicket.value,
  //   }),
  // })
  //   .then((response) => {
  //     if (!response.ok) {
  //       // 인증 오류 처리 (401)
  //       if (response.status === 401) {
  //         // (추가) 로그 - 인증 오류 감지

  //         // 인증 상태 초기화
  //         authStore.user = null;
  //         authStore.isAuthenticated = false;
  //         localStorage.removeItem("authUser");

  //         // 로그인 페이지로 리다이렉트
  //         router.push({
  //           path: "/login",
  //           query: { redirect: route.fullPath },
  //         });

  //         // 추가 처리를 중단하기 위한 에러 발생
  //         throw new Error("인증이 필요합니다");
  //       }
  //       return response.text().then((text) => {
  //         throw new Error(text);
  //       });
  //     }
  //     return response.text();
  //   })
  //   .then((data) => {
  //     // 결제 성공 시 티켓 수 갱신
  //     getTicketCount(); // 최신 티켓 수 다시 조회

  //     // 결제 내역 즉시 갱신
  //     paymentHistory.value = [];
  //     fetchPaymentHistory();

  //     closeWarningModal(); // 경고 모달 닫기

  //     // 결제 확인 모달 표시
  //     isConfirmModalOpen.value = true;
  //   })
  //   .catch((error) => {})
  //   .finally(() => {
  //     // 처리 상태 해제 → 버튼 활성화
  //     isProcessing.value = false;
  //   });
};

const closeWarningModal = () => {
  isPurchaseWarningModal.value = false;
};

async function onWarningConfirm() {
  closeWarningModal();
  showTossPayModal.value = true;
  await nextTick();
  showTossPayModal.value = true;
  await nextTick();
  tossPayRef.value?.requestTossPayment();
}

// 보유 이용권 횟수
const ticketCount = ref("n");

// 컴포넌트가 마운트될 때 자동으로 티켓 정보 조회
onMounted(() => {
  // 컴포넌트 로드 시 티켓 정보 조회
  getTicketCount();
  fetchPaymentHistory(); // 결제 내역 조회
});

// 티켓 정보 조회 함수 - 보안 우선 API 시스템 사용
async function getTicketCount() {
  try {
    console.log('티켓 정보 조회 시작 - 보안 우선 시스템 사용');
    
    // 마이그레이션 가이드에 따른 새로운 API 호출 방식
    const data = await apiGet('/api/info/select/ticket');
    
    // 티켓 정보 갱신
    ticketCount.value = data.balance;
    
    console.log('티켓 정보 조회 성공:', data.balance);
  } catch (error) {
    console.error('티켓 정보 조회 오류:', error);
    // 에러 처리는 apiGet에서 자동으로 처리됨 (401 에러 포함)
  }
}

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  endDate.value = getTodayFormatted();
  // initializeData();
});

const downloadExcel = () => {
  try {
    // 다운로드할 데이터 준비 및 총합 계산
    let totalAmount = 0;
    const dataToExport = filteredHistory.value.map((item, index) => {
      const priceNumeric = parseInt(item.price.replace(/[^0-9]/g, ""));
      totalAmount += priceNumeric;

      return {
        순번: index + 1,
        "결제 내역": item.payName,
        금액: priceNumeric,
        "결제 날짜": item.date,
      };
    });

    if (dataToExport.length === 0) {
      alert("다운로드할 거래내역이 없습니다.");
      return;
    }

    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // 범위 가져오기
    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    // F열 헤더 추가 (F1)
    const headerCell = XLSX.utils.encode_cell({ r: 0, c: 5 }); // F1
    worksheet[headerCell] = { t: "s", v: "총합" };

    // F2 셀에 총합 추가
    const totalCell = XLSX.utils.encode_cell({ r: 1, c: 5 }); // F2
    worksheet[totalCell] = { t: "n", v: totalAmount };

    // 범위 업데이트 (F열 포함)
    worksheet["!ref"] = XLSX.utils.encode_range({
      s: { r: range.s.r, c: range.s.c },
      e: { r: range.e.r, c: Math.max(range.e.c, 5) }, // F열까지 확장
    });

    // 숫자 형식 적용
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: 2 }); // C열(금액)
      if (worksheet[cellRef]) {
        worksheet[cellRef].t = "n";
      }
    }

    // 열 너비 설정
    const columnWidths = [
      { wch: 10 }, // 순번
      { wch: 30 }, // 결제 내역
      { wch: 15 }, // 금액
      { wch: 15 }, // 결제 날짜
      { wch: 10 }, // E열
      { wch: 15 }, // 총합
    ];
    worksheet["!cols"] = columnWidths;

    // 워크북 생성 및 파일 저장
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "결제 내역");

    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(now.getDate()).padStart(2, "0")}`;
    const fileName = `GenieQ_결제내역_${dateStr}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    alert("엑셀 다운로드 중 오류가 발생했습니다.");
  }
};
</script>
