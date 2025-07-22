<template>
    <div class="w-full bg-white">
        <!-- 모바일 헤더 -->
        <header
            class="sticky top-0 z-999 bg-white/90 backdrop-blur-md justify-center shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-4 py-3.5 flex items-center"
        >
            <div class="flex items-center gap-2">
                <div class="flex justify-center items-center w-full">
                    <router-link
                        to="/passage"
                        class="text-base text-center font-bold bg-[#222] bg-clip-text text-transparent"
                        >지문생성</router-link
                    >
                </div>
            </div>
        </header>

        <!-- Step 정보 -->
        <div class="w-full bg-white z-10 pt-4 pb-2 px-4">
            <div class="flex items-center">
                <div
                    v-for="step in stages"
                    :key="step.id"
                    class="flex items-center"
                    :class="step.id === stages.length ? 'flex-none' : 'flex-1'"
                >
                    <div
                        class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
                        :class="
                            currentStep >= step.id
                                ? 'bg-[#0086ff] text-white'
                                : 'bg-gray-200 text-gray-600'
                        "
                    >
                        {{ step.id }}
                    </div>
                    <div
                        v-if="step.id < stages.length"
                        class="flex-1 h-0.5 mx-2 bg-gray-200 transition-colors"
                        :class="
                            currentStep > step.id
                                ? 'bg-[#0086ff]'
                                : 'bg-gray-200'
                        "
                    ></div>
                </div>
            </div>
            <div class="flex justify-between mt-1 text-xs text-gray-500 px-1">
                <span>{{ stages[0].label }}</span>
                <span>{{ stages[1].label }}</span>
                <span>{{ stages[2].label }}</span>
            </div>
        </div>

        <div>
            <!-- Step 1: 제목/분야 -->
            <div v-if="currentStep === 1" class="step-content">
                <div class="p-4 h-full flex flex-col justify-between">
                    <div>
                        <p class="text-lg font-bold text-[#303030] mb-2">
                            작업이름
                        </p>
                        <input
                            type="text"
                            v-model="title"
                            @input="onTitleChange"
                            placeholder="작업 이름을 입력해주세요. (최대 50자)"
                            class="w-full h-[46px] px-4 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] hover:shadow-lg hover:-translate-y-0.3 hover:border-[var(--primary)] transition-all duration-300 ease-out"
                        />
                        <p class="text-lg font-bold text-[#303030] mt-6 mb-2">
                            지문 분야 선택
                        </p>
                        <div class="grid grid-cols-2 gap-2">
                            <div
                                v-for="cat in categories"
                                :key="cat.value"
                                class="flex"
                            >
                                <input
                                    type="radio"
                                    :id="cat.value"
                                    name="category"
                                    :value="cat.value"
                                    v-model="selectedCategory"
                                    @change="onCategoryChange(cat.value)"
                                    class="hidden peer"
                                />
                                <label
                                    :for="cat.value"
                                    class="w-full py-2 px-3 text-center border border-dashed border-[#E5E7EB] rounded-lg cursor-pointer bg-gray-50 peer-checked:border-[#0086ff] peer-checked:bg-[#0086ff]/10 peer-checked:text-[#0086ff] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-200"
                                >
                                    {{ cat.label }}
                                </label>
                            </div>
                        </div>
                    </div>
                    <button
                        @click="nextStep"
                        :disabled="!isNextButtonEnabled"
                        class="w-full h-[54px] bg-[#0086ff] rounded-lg text-white font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.3 disabled:hover:bg-gray-300 disabled:hover:shadow-none disabled:hover:transform-none transition-all duration-200"
                    >
                        다음
                    </button>
                </div>
            </div>

            <!-- Step 2: 제재 입력 -->
            <div v-if="currentStep === 2" class="step-content">
                <div class="p-4 h-full flex flex-col justify-between">
                    <div class="flex-1 flex flex-col">
                        <p class="text-lg font-bold text-[#303030] mb-2">
                            지문 제재 입력
                        </p>
                        <div class="flex-1 flex flex-col">
                            <textarea
                                v-model="inputText"
                                @input="onInputChange"
                                placeholder="100자 이내의 지문 제재를 작성해주세요."
                                maxlength="100"
                                class="w-full h-full p-4 bg-white border border-[#E5E7EB] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] hover:shadow-lg hover:-translate-y-0.3 hover:border-[var(--primary)] transition-all duration-300 ease-out"
                            ></textarea>
                            <p class="text-right text-sm text-gray-500 mt-1">
                                {{ inputText.length }}/100
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-3 mt-4">
                        <button
                            @click="prevStep"
                            class="flex-1 h-[54px] border border-[#E5E7EB] text-[#16252d] rounded-lg font-medium hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg hover:-translate-y-0.3 transition-all duration-200"
                        >
                            이전
                        </button>
                        <button
                            @click="nextStep"
                            :disabled="!isNextButtonEnabled"
                            class="flex-1 h-[54px] bg-[#0086ff] text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.3 disabled:hover:bg-gray-300 disabled:hover:shadow-none disabled:hover:transform-none transition-all duration-200"
                        >
                            다음
                        </button>
                    </div>
                </div>
            </div>

            <!-- Step 3: 결제 정보 -->
            <div v-if="currentStep === 3" class="step-content">
                <div class="p-4 h-full flex flex-col justify-between">
                    <!-- 이용권 정보 추가 -->
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h3 class="text-lg font-bold text-[#16252d] mb-4">
                            이용권 정보
                        </h3>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <span class="text-[#16252d]">보유 이용권</span>
                                <span class="text-[#0086ff] font-bold"
                                    >{{ ticketCount }}개</span
                                >
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-[#16252d]">사용 예정</span>
                                <span class="text-[#16252d] font-bold"
                                    >1개</span
                                >
                            </div>
                            <div class="border-t border-gray-200 pt-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-[#16252d] font-bold"
                                        >잔여 이용권</span
                                    >
                                    <span class="text-[#0086ff] font-bold"
                                        >{{ ticketCount - 1 }}개</span
                                    >
                                </div>
                            </div>
                            <p class="text-sm text-gray-500 mt-4">
                                ※ 생성이 시작된 중단 및 취소가 불가능합니다.
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <button
                            @click="prevStep"
                            class="flex-1 h-[54px] border border-[#E5E7EB] text-[#16252d] rounded-lg font-medium hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg hover:-translate-y-0.3 transition-all duration-200"
                        >
                            이전
                        </button>
                        <button
                            @click="createPassage"
                            :disabled="!isCreateButtonEnabled"
                            class="flex-1 h-[54px] bg-[#0086ff] text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.3 disabled:hover:bg-gray-300 disabled:hover:shadow-none disabled:hover:transform-none transition-all duration-200"
                        >
                            지문 생성하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";

const emit = defineEmits([
    "input-change",
    "category-change",
    "title-change",
    "credit-update",
    "handle-create-passage",
]);

// 내부 스텝 상태
const currentStep = ref(1);

// 스테이지 정보
const stages = [
    { id: 1, label: "제목/분야" },
    { id: 2, label: "제재 입력" },
    { id: 3, label: "결제 정보" },
];

// 폼 상태
const title = ref("");
const inputText = ref("");
const selectedCategory = ref("인문");
const categories = [
    { value: "인문", label: "인문" },
    { value: "예술", label: "예술" },
    { value: "사회", label: "사회" },
    { value: "과학", label: "과학" },
    { value: "기술", label: "기술" },
];

// 이용권 정보
const authStore = useAuthStore();
const ticketCount = ref(0);
const updateCreditCount = async () => {
    await authStore.updateTicketCount();
    ticketCount.value = authStore.userTicketCount;
    emit("credit-update", ticketCount.value);
};
onMounted(() => {
    updateCreditCount();
});

// 버튼 활성화
const isNextButtonEnabled = computed(() => {
    if (currentStep.value === 1) return title.value.trim().length > 0;
    if (currentStep.value === 2) return inputText.value.trim().length > 0;
    return false;
});
const isCreateButtonEnabled = computed(() => {
    return title.value.trim().length > 0 && inputText.value.trim().length > 0;
});

// 이벤트 핸들러
function onTitleChange(e) {
    if (e.target.value.length > 50)
        e.target.value = e.target.value.slice(0, 50);
    title.value = e.target.value;
    emit("title-change", title.value);
}
function onCategoryChange(val) {
    selectedCategory.value = val;
    emit("category-change", val);
}
function onInputChange() {
    if (inputText.value.length > 100)
        inputText.value = inputText.value.slice(0, 100);
    emit("input-change", inputText.value);
}

// 스텝 이동
function nextStep() {
    if (isNextButtonEnabled.value) currentStep.value++;
}
function prevStep() {
    currentStep.value--;
}
function createPassage() {
    if (isCreateButtonEnabled.value) {
        emit("handle-create-passage");
    }
}
</script>

<style scoped>
.step-content {
    display: block;
    width: 100%;
    height: calc(100vh - 184px);
}
</style>
