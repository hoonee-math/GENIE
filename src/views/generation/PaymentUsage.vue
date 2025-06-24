<template>
  <div
    class="box-border w-full max-w-[35%] min-w-[260px] min-h-[200px] bg-white border border-[#E5E7EB] rounded-xl relative max-h-[90vh] mx-auto lg:max-w-[35%] md:max-w-[60%] sm:max-w-full sm:min-w-0 shadow-sm"
  >
    <div
      class="flex flex-col items-start gap-4 md:gap-6 w-full max-w-[95%] min-w-0 min-h-0 mt-[2%] mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4 box-border sm:max-w-full sm:px-3"
    >
      <p
        class="w-full max-w-full h-8 m-0 font-pretendard font-bold text-lg md:text-xl leading-[150%] tracking-[-0.02em] text-[#303030]"
      >
        결제
      </p>
      <div
        class="box-border flex flex-col items-start w-full max-w-full min-w-0 min-h-0 border border-[#E5E7EB] rounded-lg"
      >
        <div
          class="box-border flex flex-row justify-between items-center px-3 md:px-4 lg:px-6 py-2 gap-2 w-full min-w-0 h-10 md:h-12 border-b border-[#E5E7EB]"
        >
          <div
            class="h-6 font-pretendard font-medium text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030]"
          >
            보유 이용권
          </div>
          <div
            class="h-6 font-pretendard font-semibold text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030]"
          >
            {{ creditcount }}회
          </div>
        </div>

        <div
          class="box-border flex flex-row justify-between items-center px-3 md:px-4 lg:px-6 py-2 gap-2 w-full min-w-0 h-10 md:h-12 border-b border-[#E5E7EB]"
        >
          <div
            class="h-6 font-pretendard font-medium text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030]"
          >
            사용 예정 이용권
          </div>
          <div
            class="h-6 font-pretendard font-semibold text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030]"
          >
            <span class="text-[#0086ff]">1</span>회
          </div>
        </div>

        <div
          v-if="creditcount > 0"
          class="box-border flex flex-row justify-between items-center px-3 md:px-4 lg:px-6 py-2 gap-2 w-full min-w-0 h-10 md:h-12 bg-[#7fc7ff2e] border-none rounded-b-lg"
        >
          <div
            class="h-6 font-pretendard font-medium text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030]"
          >
            잔여 이용권
          </div>
          <div
            class="h-6 font-pretendard font-semibold text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030]"
          >
            {{ creditcount - 1 }}회
          </div>
        </div>
        <div
          v-else
          class="box-border flex flex-row justify-between items-center px-3 md:px-4 lg:px-6 py-2 gap-2 w-full min-w-0 h-auto min-h-[40px] md:min-h-[48px] bg-[#7fc7ff2e] border-none rounded-b-lg"
        >
          <div
            class="w-full font-pretendard font-medium text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030] break-keep"
          >
            ※ 보유하신 잔여 이용권이 모두 소진되었습니다.
          </div>
        </div>
      </div>
    </div>
    <p
      class="w-full h-6 px-4 md:px-6 lg:px-8 font-pretendard font-normal text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#e84739] mt-3 md:mt-4"
    >
      ※ 생성이 시작된 중단 및 취소가 불가능합니다.
    </p>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";

const creditcount = ref(0); // 초기값 0
const authStore = useAuthStore();

// 이벤트 정의
const emit = defineEmits(["credit-update"]);

// creditcount 변경 감지
watch(creditcount, (newValue) => {
  emit("credit-update", newValue);
});

// creditcount를 외부에 노출
const updateCreditCount = (count) => {
  creditcount.value = count || authStore.userTicketCount;
  emit("credit-update", creditcount.value);
};

// 컴포넌트 마운트 시 이벤트 발생
onMounted(() => {
  // authStore의 updateTicketCount 메서드 호출
  authStore
    .updateTicketCount()
    .then((count) => {
      creditcount.value = count; // 반환된 값으로 creditcount 업데이트
      emit("credit-update", creditcount.value);
    })
    .catch((error) => {
      // 에러 발생 시 기본값 혹은 현재 authStore에 있는 값 사용
      creditcount.value = authStore.userTicketCount;
      emit("credit-update", creditcount.value);
    });
});

// 외부에서 사용할 수 있도록 defineExpose 사용
defineExpose({
  creditcount,
  updateCreditCount,
});
</script>
