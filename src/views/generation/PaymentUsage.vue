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
            {{ creditCount }}회
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
            <span class="text-[#0086ff]">{{ usageCount }}</span>회
          </div>
        </div>

        <div
          v-if="creditCount > 0"
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
            {{ remainingCount }}회
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
import { ref, computed, watch, onMounted } from "vue";

// ========== Props & Emits ==========
const props = defineProps({
  // 외부에서 이용권 수를 직접 설정할 수 있도록 허용
  initialCreditCount: {
    type: Number,
    default: 5
  },
  initialUsageCount: {
    type: Number, 
    default: 1
  }
});

const emit = defineEmits(["credit-update"]);

// ========== Reactive State ==========
// 하드코딩된 예시 데이터로 시작
const creditCount = ref(props.initialCreditCount); // 보유 이용권
const usageCount = ref(props.initialUsageCount);   // 사용 예정 이용권

// ========== Computed Properties ==========
const remainingCount = computed(() => {
  return Math.max(0, creditCount.value - usageCount.value);
});

// ========== Methods ==========
// 외부에서 이용권 수를 업데이트할 수 있는 메서드
function updateCreditCount(count) {
  if (typeof count === 'number' && count >= 0) {
    creditCount.value = count;
    emit("credit-update", creditCount.value);
  }
}

// 사용 예정 이용권 변경
function updateUsageCount(count) {
  if (typeof count === 'number' && count >= 0) {
    usageCount.value = count;
  }
}

// ========== Watchers ==========
// 이용권 수 변경 감지
watch(creditCount, (newValue) => {
  emit("credit-update", newValue);
});

// ========== Lifecycle ==========
onMounted(() => {
  // 초기 이용권 수 emit
  emit("credit-update", creditCount.value);
});

// ========== Expose ==========
// 외부에서 접근 가능한 메서드들
defineExpose({
  creditCount,
  usageCount,
  remainingCount,
  updateCreditCount,
  updateUsageCount
});  
</script>
