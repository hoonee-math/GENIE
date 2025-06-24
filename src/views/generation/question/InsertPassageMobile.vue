<template>
    <div class="w-full bg-white h-screen flex flex-col">
        <!-- Header -->
        <header
            class="sticky top-0 z-999 bg-white/90 backdrop-blur-md justify-center shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-4 py-3.5 flex items-center"
        >
            <div class="flex items-center gap-2">
                <div class="flex justify-center items-center w-full">
                    <router-link
                        to="/questions"
                        class="text-base text-center font-bold bg-[#222] bg-clip-text text-transparent"
                        >문항생성</router-link
                    >
                </div>
            </div>
        </header>

        <!-- Step Indicator -->
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

        <div class="flex-1 overflow-y-auto">
            <!-- Step 1: 제목/지문 -->
            <div v-if="currentStep === 1" class="step-content">
                <div class="p-4 flex flex-col">
                    <div class="flex-1">
                        <div>
                            <p class="text-lg font-bold text-[#303030] mb-2">
                                작업이름
                            </p>
                            <input
                                type="text"
                                v-model="passageTitle"
                                @input="onTitleChange"
                                placeholder="작업 이름을 입력해주세요. (최대 50자)"
                                class="w-full h-[46px] px-4 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0086ff] hover:border-[#0086ff] hover:shadow-md transition-all duration-200"
                            />
                            <p
                                class="text-lg font-bold text-[#303030] mt-6 mb-4"
                            >
                                지문 입력 방식
                            </p>
                            <div class="flex flex-col gap-2">
                                <!-- 입력 방식 선택 -->
                                <div class="grid grid-cols-2 gap-2 mb-4">
                                    <div
                                        v-for="type in inputTypes"
                                        :key="type.value"
                                        class="flex"
                                    >
                                        <input
                                            type="radio"
                                            :id="type.value"
                                            name="inputType"
                                            :value="type.value"
                                            v-model="selectedInputType"
                                            @change="onInputTypeChange"
                                            class="hidden peer"
                                        />
                                        <label
                                            :for="type.value"
                                            class="w-full py-2 px-3 text-center border border-dashed border-[#E5E7EB] rounded-lg cursor-pointer bg-gray-50 peer-checked:border-[#0086ff] peer-checked:bg-[#0086ff]/10 peer-checked:text-[#0086ff] transition-all duration-200"
                                        >
                                            {{ type.label }}
                                        </label>
                                    </div>
                                </div>

                                <!-- 사용자 입력 -->
                                <div
                                    v-if="selectedInputType === 'user'"
                                    class="w-full"
                                >
                                    <textarea
                                        v-model="userInputContent"
                                        @input="onUserInputChange"
                                        placeholder="지문을 입력해주세요. (최소 500자)"
                                        class="w-full h-[300px] p-4 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0086ff] hover:border-[#0086ff] hover:shadow-md transition-all duration-200 resize-none"
                                    ></textarea>
                                    <p class="text-sm text-gray-500 mt-2">
                                        현재 {{ userInputContent.length }}자 /
                                        최소 500자
                                    </p>
                                </div>

                                <!-- 자료실 선택 -->
                                <div
                                    v-if="selectedInputType === 'store'"
                                    class="w-full"
                                >
                                    <button
                                        @click="openLoadPassageModal"
                                        class="w-full py-3 px-4 text-left border border-dashed border-[#E5E7EB] rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-[#0086ff] hover:shadow-md transition-all duration-200"
                                    >
                                        <div
                                            class="flex justify-between items-center"
                                        >
                                            <span class="text-[#16252d]">{{
                                                selectedPassage
                                                    ? selectedPassage.PAS_TITLE
                                                    : "지문을 선택해주세요"
                                            }}</span>
                                            <span class="text-[#0086ff]"
                                                >선택</span
                                            >
                                        </div>
                                    </button>
                                    <!-- 선택된 지문 미리보기 -->
                                    <div
                                        v-if="selectedPassage"
                                        class="mt-4 p-4 border border-[#E5E7EB] rounded-lg mb-4"
                                    >
                                        <h3
                                            class="font-bold text-[#16252d] mb-2"
                                        >
                                            지문 미리보기
                                        </h3>
                                        <p
                                            class="text-sm text-[#424242] line-clamp-3"
                                        >
                                            {{ selectedPassage.PAS_CONTENT }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-100">
                        <button
                            @click="nextStep"
                            :disabled="!isNextButtonEnabled"
                            class="w-full h-[54px] bg-[#0086ff] rounded-lg text-white font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#0066cc] hover:shadow-lg transition-all duration-200"
                        >
                            다음
                        </button>
                    </div>
                </div>
            </div>

            <!-- Step 2: 문항 유형 -->
            <div v-if="currentStep === 2" class="step-content">
                <div class="p-4 flex flex-col">
                    <div class="flex-1">
                        <div>
                            <p class="text-lg font-bold text-[#303030] mb-2">
                                문항 유형
                            </p>
                            <div class="flex flex-wrap gap-2 mb-4">
                                <button
                                    v-for="type in questionPattern"
                                    :key="type.id"
                                    class="px-4 py-2 rounded-lg border transition-all duration-200"
                                    :class="{
                                        'bg-[#e6f3ff] border-none text-[#0066cc]':
                                            activePattern === type.label,
                                        'bg-white border-[#bdbdbd] text-[#757575] hover:border-[#0086ff] hover:text-[#0086ff] hover:shadow-md':
                                            activePattern !== type.label,
                                    }"
                                    @click="activePattern = type.label"
                                >
                                    {{ type.label }}
                                </button>
                            </div>

                            <p class="text-lg font-bold text-[#303030] mb-2">
                                서술 방식
                            </p>
                            <div class="flex flex-wrap gap-2 mb-4">
                                <button
                                    v-for="type in questionTypes"
                                    :key="type.id"
                                    class="px-4 py-2 rounded-lg border transition-all duration-200"
                                    :class="{
                                        'bg-[#e6f3ff] border-none text-[#0066cc]':
                                            activeType === type.label,
                                        'bg-white border-[#bdbdbd] text-[#757575] hover:border-[#0086ff] hover:text-[#0086ff] hover:shadow-md':
                                            activeType !== type.label,
                                    }"
                                    @click="activeType = type.label"
                                >
                                    {{ type.label }}
                                </button>
                            </div>

                            <!-- 예시 목록 -->
                            <div
                                class="w-full rounded-lg border border-[#bdbdbd] p-4"
                            >
                                <div
                                    v-if="filteredQuestions.length > 0"
                                    class="flex flex-col gap-4"
                                >
                                    <div
                                        v-for="(
                                            item, index
                                        ) in filteredQuestions"
                                        :key="index"
                                        class="w-full p-4 rounded-lg border border-[#bdbdbd] flex flex-col items-start gap-2.5 cursor-pointer transition-all duration-200 hover:border-[#0086ff] hover:bg-[#f8fbff]"
                                        :class="{
                                            'border-[#0086ff] bg-[#e6f3ff]':
                                                JSON.stringify(
                                                    selectedQuestion
                                                ) === JSON.stringify(item),
                                        }"
                                        @click="openPreviewModal(item)"
                                    >
                                        <div class="flex items-center gap-2">
                                            <span
                                                class="px-2 py-1 rounded-lg border border-[#0086ff] text-[#0086ff] bg-[#cce5ff] font-semibold text-sm"
                                            >
                                                {{ item.pattern }}
                                            </span>
                                            <span
                                                class="px-2 py-1 rounded-lg border border-[#0086ff] text-[#0086ff] bg-[#cce5ff] font-semibold text-sm"
                                            >
                                                {{ item.type }}
                                            </span>
                                        </div>
                                        <div
                                            class="font-medium text-sm text-[#303030]"
                                        >
                                            {{ item.title }}
                                        </div>
                                        <div
                                            class="flex items-center gap-2 text-xs text-[#757575]"
                                        >
                                            <span>난이도:</span>
                                            <span
                                                class="px-2 py-0.5 rounded-full"
                                                :class="{
                                                    'bg-[#e6f3ff] text-[#0086ff]':
                                                        item.difficulty ===
                                                        '하',
                                                    'bg-[#fff4e6] text-[#ff9500]':
                                                        item.difficulty ===
                                                        '중',
                                                    'bg-[#ffe6e6] text-[#ff3b30]':
                                                        item.difficulty ===
                                                        '상',
                                                }"
                                            >
                                                {{ item.difficulty }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="text-center text-gray-500">
                                    문항 유형과 서술 방식을 선택해 주세요.
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-100">
                        <div class="flex gap-3">
                            <button
                                @click="prevStep"
                                class="flex-1 h-[54px] border border-[#E5E7EB] text-[#16252d] rounded-lg font-medium hover:border-[#0086ff] hover:text-[#0086ff] hover:shadow-md transition-all duration-200"
                            >
                                이전
                            </button>
                            <button
                                @click="nextStep"
                                :disabled="!isNextButtonEnabled"
                                class="flex-1 h-[54px] bg-[#0086ff] text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#0066cc] hover:shadow-lg transition-all duration-200"
                            >
                                다음
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Step 3: 결제 정보 -->
            <div v-if="currentStep === 3" class="step-content">
                <div class="p-4 flex flex-col">
                    <div class="flex-1">
                        <!-- 이용권 정보 추가 -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h3 class="text-lg font-bold text-[#16252d] mb-4">
                                이용권 정보
                            </h3>
                            <div class="space-y-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-[#16252d]"
                                        >보유 이용권</span
                                    >
                                    <span class="text-[#0086ff] font-bold"
                                        >{{ creditCount }}개</span
                                    >
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-[#16252d]"
                                        >사용 예정</span
                                    >
                                    <span class="text-[#16252d] font-bold"
                                        >1개</span
                                    >
                                </div>
                                <div class="border-t border-gray-200 pt-4">
                                    <div
                                        class="flex items-center justify-between"
                                    >
                                        <span class="text-[#16252d] font-bold"
                                            >잔여 이용권</span
                                        >
                                        <span class="text-[#0086ff] font-bold"
                                            >{{ creditCount - 1 }}개</span
                                        >
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p class="text-sm text-gray-500 mt-4">
                            ※ 생성이 시작된 중단 및 취소가 불가능합니다.
                        </p>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-100">
                        <div class="flex gap-3">
                            <button
                                @click="prevStep"
                                class="flex-1 h-[54px] border border-[#E5E7EB] text-[#16252d] rounded-lg font-medium hover:border-[#0086ff] hover:text-[#0086ff] hover:shadow-md transition-all duration-200"
                            >
                                이전
                            </button>
                            <button
                                @click="handleGenerateQuestion"
                                :disabled="!isCreateButtonEnabled"
                                class="flex-1 h-[54px] bg-[#0086ff] text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#0066cc] hover:shadow-lg transition-all duration-200"
                                @click.once="handleGenerateQuestion"
                            >
                                문항 생성하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 지문 불러오기 모달 -->
    <LoadPassageModal
        :isOpen="showLoadPassageModal"
        @close="closeLoadPassageModal"
        @loadPassage="handleLoadPassage"
    />

    <!-- 문항 미리보기 모달 -->
    <div
        v-if="showPreviewModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
        <div
            class="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl overflow-hidden h-[80vh]"
        >
            <!-- 모달 헤더 -->
            <div
                class="flex items-center justify-between p-4 border-b border-gray-200"
            >
                <h3 class="text-lg font-bold text-[#16252d]">문항 미리보기</h3>
                <button
                    @click="closePreviewModal"
                    class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <svg
                        class="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            <!-- 모달 내용 -->
            <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <!-- 문항 유형 태그 -->
                <div class="flex gap-2">
                    <span
                        class="px-3 py-1.5 rounded-full bg-[#e6f3ff] text-[#0086ff] text-sm font-medium"
                    >
                        {{ previewQuestion.pattern }}
                    </span>
                    <span
                        class="px-3 py-1.5 rounded-full bg-[#f0f9ff] text-[#0086ff] text-sm font-medium"
                    >
                        {{ previewQuestion.type }}
                    </span>
                </div>

                <!-- 문항 제목 -->
                <div class="p-4 bg-[#f9fafb] rounded-xl">
                    <h4 class="font-bold text-[#16252d] mb-2">문항 제목</h4>
                    <p class="text-[#424242] text-sm leading-relaxed">
                        {{ previewQuestion.title }}
                    </p>
                </div>

                <!-- 문항 내용 -->
                <div class="p-4 bg-[#f9fafb] rounded-xl">
                    <h4 class="font-bold text-[#16252d] mb-2">문항 내용</h4>
                    <p
                        class="text-[#424242] text-sm leading-relaxed whitespace-pre-wrap"
                    >
                        {{ previewQuestion.question }}
                    </p>
                </div>
            </div>

            <!-- 모달 푸터 -->
            <div class="p-4 border-t border-gray-200 bg-gray-50">
                <button
                    @click="selectAndClosePreview"
                    class="w-full h-[46px] bg-[#0086ff] text-white rounded-lg font-medium hover:bg-[#0073e6] transition-colors"
                >
                    이 문항 선택하기
                </button>
            </div>
        </div>
    </div>

    <!-- 로딩 모달 -->
    <div
        v-if="isLoading"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div class="text-center">
                <div
                    class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0086ff] mx-auto mb-4"
                ></div>
                <p class="text-[#16252d] whitespace-pre-line">
                    {{ loadingMessage }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import LoadPassageModal from "@/components/generation/LoadPassageModal.vue";
import questionExample from "@/assets/data/questionExample.json";

const router = useRouter();
const emit = defineEmits([
    "input-change",
    "type-change",
    "title-change",
    "credit-update",
    "handle-create-question",
]);

// 내부 스텝 상태
const currentStep = ref(1);

// 스테이지 정보
const stages = [
    { id: 1, label: "제목/지문" },
    { id: 2, label: "문항 유형" },
    { id: 3, label: "결제 정보" },
];

// 입력 방식 선택
const inputTypes = [
    { value: "user", label: "직접 입력" },
    { value: "store", label: "자료실 선택" },
];
const selectedInputType = ref("user");

// 폼 상태
const passageTitle = ref("");
const userInputContent = ref("");
const selectedPassage = ref(null);
const selectedQuestion = ref(null);

// 모달 상태
const showLoadPassageModal = ref(false);

// 이용권 정보
const authStore = useAuthStore();
const creditCount = ref(0);
const updateCreditCount = async () => {
    await authStore.updateTicketCount();
    creditCount.value = authStore.userTicketCount;
    emit("credit-update", creditCount.value);
};

// 문항 유형 관련 상태
const activePattern = ref(null);
const activeType = ref(null);

const questionPattern = ref([
    { id: 1, label: "전체" },
    { id: 2, label: "사실적 읽기" },
    { id: 3, label: "추론적 읽기" },
    { id: 4, label: "비판적 읽기" },
    { id: 5, label: "어휘 및 문법" },
]);

const questionTypes = ref([
    { id: 6, label: "전체" },
    { id: 7, label: "정답형" },
    { id: 8, label: "부정형" },
]);

// 필터링된 문항 목록
const filteredQuestions = computed(() => {
    if (!activePattern.value || !activeType.value) {
        return [];
    }

    return questionExample.filter((q) => {
        return (
            (activePattern.value === "전체" ||
                q.pattern === activePattern.value) &&
            (activeType.value === "전체" || q.type === activeType.value)
        );
    });
});

// 필터링된 리스트 변경 시 첫 번째 문항 자동 선택
watch(filteredQuestions, (newList) => {
    if (newList.length > 0) {
        if (
            !selectedQuestion.value ||
            !newList.includes(selectedQuestion.value)
        ) {
            selectedQuestion.value = newList[0];
        }
    } else {
        selectedQuestion.value = null;
    }
});

// 버튼 활성화
const isNextButtonEnabled = computed(() => {
    if (currentStep.value === 1) {
        const hasTitle = passageTitle.value.trim().length > 0;
        const hasContent =
            selectedInputType.value === "user"
                ? userInputContent.value.length >= 500
                : selectedPassage.value !== null;
        return hasTitle && hasContent;
    }
    if (currentStep.value === 2) return selectedQuestion.value !== null;
    return false;
});

const isCreateButtonEnabled = computed(() => {
    const hasTitle = passageTitle.value.trim().length > 0;
    const hasContent =
        selectedInputType.value === "user"
            ? userInputContent.value.length >= 500
            : selectedPassage.value !== null;
    return (
        hasTitle &&
        hasContent &&
        selectedQuestion.value &&
        creditCount.value > 0
    );
});

// 이벤트 핸들러
function onTitleChange(e) {
    if (e.target.value.length > 50)
        e.target.value = e.target.value.slice(0, 50);
    passageTitle.value = e.target.value;
    emit("title-change", passageTitle.value);
}

function onUserInputChange(e) {
    userInputContent.value = e.target.value;
    emit("input-change", userInputContent.value);
}

function onInputTypeChange() {
    // 입력 방식 변경 시 기존 내용 초기화
    if (selectedInputType.value === "user") {
        selectedPassage.value = null;
    } else {
        userInputContent.value = "";
    }
}

// 모달 관련 함수
function openLoadPassageModal() {
    showLoadPassageModal.value = true;
}

function closeLoadPassageModal() {
    showLoadPassageModal.value = false;
}

function handleLoadPassage(passage) {
    selectedPassage.value = passage;
    closeLoadPassageModal();
}

// 스텝 이동
function nextStep() {
    if (isNextButtonEnabled.value) currentStep.value++;
}

function prevStep() {
    currentStep.value--;
}

// 문항 생성 상태
const isProcessing = ref(false);
const isLoading = ref(false);
const loadingMessage = ref(
    "문항을 생성 중입니다.\n생성까지 최대 3분이 소요될 수 있습니다."
);

// 문항 생성 함수
async function handleGenerateQuestion() {
    if (isProcessing.value) return;
    isProcessing.value = true;
    isLoading.value = true;

    try {
        if (isCreateButtonEnabled.value) {
            const passageData =
                selectedInputType.value === "user"
                    ? {
                          PAS_TITLE: passageTitle.value,
                          PAS_CONTENT: userInputContent.value,
                          PAS_GIST: "",
                      }
                    : selectedPassage.value;

            // 문항 생성 API 호출
            const requestData = {
                custom_passage: passageData.PAS_CONTENT || "",
                type_question: selectedQuestion.value.pattern,
                type_question_detail: selectedQuestion.value.type,
                question_example: selectedQuestion.value.title,
            };

            const response = await fetch("/fastapi/generate-question", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok)
                throw new Error(`문항 생성 실패: ${response.status}`);

            const result = await response.json();

            // 선택지에서 쉼표 제거
            const processedOptions = result.generated_option.map((option) => {
                return option.replace(/,/g, "").replace(/^[①②③④⑤]\s*/, "");
            });

            // 문항 저장 API 호출
            const saveRequestData = {
                type: result.type_passage,
                keyword: result.keyword[0],
                title: passageData.PAS_TITLE || "",
                content: passageData.PAS_CONTENT || "",
                gist: passageData.PAS_GIST || result.generated_core_point,
                isGenerated: 0,
                questions: [
                    {
                        queQuery: result.generated_question,
                        queOption: processedOptions,
                        queAnswer: result.generated_answer,
                        description: result.generated_description,
                    },
                ],
            };

            const saveResponse = await fetch(`/api/pass/ques/insert/each`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(saveRequestData),
            });

            if (!saveResponse.ok)
                throw new Error(`문항 저장 실패: ${saveResponse.status}`);

            const saveResult = await saveResponse.json();

            localStorage.setItem(
                "saveResponse",
                JSON.stringify({
                    question: selectedQuestion.value,
                    passage: saveResult,
                })
            );

            // 생성 완료 후 문항 목록 페이지로 이동
            router.push({
                path: "/questions/generate",
                query: {
                    pattern: selectedQuestion.value.pattern,
                    type: selectedQuestion.value.type,
                    queExample: selectedQuestion.value.title,
                },
            });
        }
    } catch (error) {
        console.error("문항 생성 중 오류 발생:", error);
        alert("문항 생성 중 오류가 발생했습니다.");
    } finally {
        isProcessing.value = false;
        isLoading.value = false;
    }
}

// 미리보기 모달 상태
const showPreviewModal = ref(false);
const previewQuestion = ref(null);

// 미리보기 모달 관련 함수
function openPreviewModal(question) {
    previewQuestion.value = question;
    showPreviewModal.value = true;
}

function closePreviewModal() {
    showPreviewModal.value = false;
    previewQuestion.value = null;
}

function selectAndClosePreview() {
    selectedQuestion.value = previewQuestion.value;
    closePreviewModal();
}

onMounted(async () => {
    await updateCreditCount();

    // 저장된 지문 데이터 로드
    const savedPassage = localStorage.getItem("passageForQuestion");
    if (savedPassage) {
        try {
            const passageData = JSON.parse(savedPassage);
            console.log("=====로드된 지문 데이터:", passageData);

            // 입력 방식 자동 설정
            selectedInputType.value = "store";

            // 제목과 내용 설정
            passageTitle.value = passageData.title || "";
            userInputContent.value = passageData.content || "";

            // 선택된 지문으로 설정
            selectedPassage.value = {
                PAS_TITLE: passageData.title,
                PAS_CONTENT: passageData.content,
                PAS_GIST: passageData.gist,
                PAS_TYPE: passageData.type,
                PAS_KEYWORD: passageData.keyword,
                PAS_CODE: passageData.pasCode,
            };

            // 다음 단계로 자동 이동
            nextStep();

            // 데이터 로드 후 로컬 스토리지에서 삭제
            localStorage.removeItem("passageForQuestion");
        } catch (error) {
            console.error("Failed to load saved passage:", error);
        }
    }
});
</script>

<style scoped>
.step-content {
    display: block;
    width: 100%;
    height: 100%;
}

/* 스크롤바 숨기기 */
.overflow-y-auto {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
}

.overflow-y-auto::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
}
</style>
