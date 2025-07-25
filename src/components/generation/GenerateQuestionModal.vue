<template>
    <BaseModal :isOpen="isOpen" width="80vw" height="80vh" @close="closeModal">
        <div class="w-full h-full flex flex-col items-start gap-4 box-border max-w-[1232px] max-h-[968px]">
            <h1
                class="w-full font-pretendard font-bold text-lg md:text-xl leading-[150%] tracking-[-0.02em] text-[#303030]">
                문항 생성하기
            </h1>

            <div class="flex flex-col gap-3 w-full">
                <!-- 문항 유형 -->
                <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <span class="font-pretendard font-normal text-sm leading-[150%] tracking-[-0.02em] text-[#424242]">
                        문항 유형
                    </span>
                    <div class="flex flex-wrap gap-2 md:gap-4 overflow-x-auto w-full md:w-auto">
                        <BaseButton v-for="type in questionPattern" :key="type.id" :text="type.label" type="type3"
                            :width="type.width" class="transition-all duration-200" :class="{
                                'bg-[#e6f3ff] border-none text-[#0066cc]':
                                    activePattern === type.label,
                                'bg-white border-[#bdbdbd] text-[#757575] hover:border-[#0086ff] hover:text-[#0086ff]':
                                    activePattern !== type.label,
                            }" @click="activePattern = type.label" />
                    </div>
                </div>

                <!-- 서술 방식 -->
                <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <span class="font-pretendard font-normal text-sm leading-[150%] tracking-[-0.02em] text-[#424242]">
                        서술 방식
                    </span>
                    <div class="flex flex-wrap gap-2 md:gap-4 overflow-x-auto w-full md:w-auto">
                        <BaseButton v-for="type in questionTypes" :key="type.id" :text="type.label" type="type3"
                            :width="type.width" height="40px" class="transition-all duration-200" :class="{
                                'bg-[#e6f3ff] border-none text-[#0066cc]':
                                    activeType === type.label,
                                'bg-white border-[#bdbdbd] text-[#757575] hover:border-[#0086ff] hover:text-[#0086ff]':
                                    activeType !== type.label,
                            }" @click="activeType = type.label" />
                    </div>
                </div>
            </div>

            <!-- 예시 그룹 -->
            <div class="flex flex-col lg:flex-row gap-4 md:gap-5 flex-1 w-full overflow-hidden">
                <!-- 예시 목록 -->
                <div
                    class="w-full flex-1 h-full rounded-[20px] border border-[#bdbdbd] p-4 md:p-5 flex items-center justify-center overflow-hidden">
                    <div v-if="filteredQuestions.length > 0" class="flex flex-col gap-4 w-full h-full overflow-y-auto">
                        <div v-for="(item, index) in filteredQuestions" :key="index"
                            class="w-full h-24 rounded-[20px] border border-[#bdbdbd] p-4 flex flex-col items-start gap-2.5 cursor-pointer transition-all duration-200 hover:border-[#0086ff] hover:bg-[#e6f3ff]"
                            :class="{
                                'border-[#0086ff] bg-[#e6f3ff]':
                                    JSON.stringify(selectedQuestion) ===
                                    JSON.stringify(item),
                            }" @click="selectedQuestion = item">
                            <span
                                class="px-2 py-1 rounded-lg border border-[#0086ff] text-[#0086ff] bg-[#cce5ff] font-semibold text-xs md:text-sm leading-[150%] tracking-[-0.02em]">
                                {{ item.pattern }}
                            </span>
                            <div
                                class="font-medium text-xs md:text-sm leading-[150%] tracking-[-0.02em] text-[#303030]">
                                {{ item.title }}
                            </div>
                        </div>
                    </div>
                    <div v-else class="font-bold text-base md:text-lg leading-[150%] tracking-[-0.02em] text-center">
                        문항 유형과 서술 방식을 선택해 주세요.
                    </div>
                </div>

                <!-- 미리보기 -->
                <div
                    class="w-full flex-1 h-full rounded-[20px] border border-[#bdbdbd] p-4 md:p-6 flex flex-col items-start overflow-hidden">
                    <h2 class="font-bold text-base md:text-lg leading-[150%] tracking-[-0.02em] mb-6 md:mb-8">
                        문항 미리보기
                    </h2>
                    <div v-if="selectedQuestion" class="w-full h-full overflow-y-auto">
                        <div class="font-normal text-base md:text-lg leading-[150%] tracking-[-0.02em] mb-3 text-left">
                            {{ selectedQuestion.title }}
                        </div>
                        <div
                            class="font-normal text-xs md:text-sm leading-10 tracking-[-0.02em] whitespace-pre-wrap text-left">
                            {{ selectedQuestion.question }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- 버튼 영역 -->
            <div class="flex flex-col sm:flex-row gap-2.5 self-end w-full sm:w-auto">
                <div class="flex gap-2.5 w-full sm:w-auto relative">
                    <PlainTooltip id="tooltip" message="생성 시 이용권 1회 차감" width="205px"
                        class="absolute -top-14 right-0" />
                    <BaseButton text="닫기" type="type3" height="54px" class="w-full sm:w-auto px-8 text-sm"
                        @click="closeModal" />
                    <BaseButton :text="createText" type="type1" height="54px" class="w-full sm:w-auto px-8 text-sm"
                        :disabled="!selectedQuestion" @click.once="handleGenerateQuestion" />
                </div>
            </div>
        </div>
    </BaseModal>

    <LoadingModal :isOpen="isLoading" :message="loadingMessage" />
</template>
<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import BaseModal from "@/components/common/BaseModal.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import PlainTooltip from "@/components/common/PlainTooltip.vue";
import questionExample from "@/assets/data/questionExample.json";
import LoadingModal from "@/components/common/LoadingModal.vue";

const router = useRouter();
const emit = defineEmits(["close", "openPaymentModal"]);

const props = defineProps({
    isOpen: Boolean,
    mode: {
        type: String,
        default: "navigate", //'navigate' 또는 'generate'
    },
    createText: { type: String, default: "문항 생성하기" },
    passageTitle: String, // 부모에서 전달된 제목
    passageContent: String, // 부모에서 전달된 내용
});

const activePattern = ref(null); // 문항 유형 선택값
const activeType = ref(null); // 서술 방식 선택값
const activeDifficulty = ref(null); // 난이도 선택값
const selectedQuestion = ref(null); // 선택된 문항을 ref로 저장
const isProcessing = ref(false);
const isLoading = ref(false);
const loadingMessage = ref(
    "문항을 생성 중입니다.\n생성까지 최대 1분이 소요될 수 있습니다."
);

const closeModal = () => {
    emit("close");
    activePattern.value = null;
    activeType.value = null;
    activeDifficulty.value = null;
    selectedQuestion.value = null;
};

const handleGenerateQuestion = async () => {
    if (isProcessing.value) return; // 중복 실행 방지
    isProcessing.value = true;

    try {
        if (selectedQuestion.value) {
            const savedPassageData = localStorage.getItem("tempPassageData");
            let passageData = null;

            if (savedPassageData) {
                passageData = JSON.parse(savedPassageData);

                localStorage.setItem(
                    "generateQuestionPassageData",
                    savedPassageData
                );
                localStorage.setItem(
                    "selectedQuestionData",
                    JSON.stringify(selectedQuestion.value)
                );
            }

            // mode에 따라 다른 동작 수행
            if (props.mode === "generate") {
                emit("openPaymentModal", {
                    pattern: selectedQuestion.value.pattern,
                    type: selectedQuestion.value.type,
                    queExample: selectedQuestion.value.title,
                });
            } else {
                isLoading.value = true;
                loadingMessage.value =
                    "문항을 생성 중입니다.\n생성까지 최대 1분이 소요될 수 있습니다.";

                const requestData = {
                    custom_passage: passageData?.PAS_CONTENT || "",
                    type_question: selectedQuestion.value.pattern,
                    type_question_detail: selectedQuestion.value.type,
                    question_example: selectedQuestion.value.title,
                };

                const response = await fetch("/fastapi/generate-single-passage-question", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestData),
                });

                if (!response.ok)
                    throw new Error(`문항 생성 실패: ${response.status}`);

                const result = await response.json();

                // (추가) 선택지에서 쉼표 제거 또는 대체
                const processedOptions = result.generated_option.map(
                    (option) => {
                        // 쉼표를 다른 문자(예: 대시)로 대체
                        return option
                            .replace(/,/g, "")
                            .replace(/^[①②③④⑤]\s*/, "");
                    }
                );

                console.log("쉼표 제거해 줬는지 확인:", {
                    original: result.generated_option,
                    processed: processedOptions,
                });

                // ✅ 3단계: 문항 저장 API 호출

                console.log(result.generated_option);
                const saveRequestData = {
                    type: result.type_passage,
                    keyword: result.keyword[0],
                    title: passageData?.PAS_TITLE || "",
                    content: passageData?.PAS_CONTENT || "",
                    gist: passageData?.PAS_GIST || result.generated_core_point,
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
                isLoading.value = false;

                router.push({
                    path: "/questions/generate",
                    query: {
                        pattern: selectedQuestion.value.pattern,
                        type: selectedQuestion.value.type,
                        queExample: selectedQuestion.value.title,
                    },
                });
            }

            activePattern.value = null;
            activeType.value = null;
            activeDifficulty.value = null;
            selectedQuestion.value = null;
            emit("close");
        }
    } catch (error) {
        alert(`오류가 발생했습니다.`);
    } finally {
        isProcessing.value = false;
        isLoading.value = false;
    }
};

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

const difficultyLevels = ref([
    { id: 9, label: "하" },
    { id: 10, label: "중" },
    { id: 11, label: "상" },
]);

const questions = questionExample;

// ✅ 선택된 라디오 버튼에 따라 자동 필터링
const filteredQuestions = computed(() => {
    if (
        !activePattern.value ||
        (!activeType.value && !activeDifficulty.value)
    ) {
        return []; // 필터가 선택되지 않았다면 빈 배열 반환
    }

    return questionExample.filter((q) => {
        return (
            (activePattern.value === "전체" ||
                q.pattern === activePattern.value) &&
            (activeType.value === "전체" || q.type === activeType.value) &&
            (activeDifficulty.value === null ||
                activeDifficulty.value === "전체" ||
                q.difficulty === activeDifficulty.value)
        );
    });
});

// ✅ 필터링된 리스트 변경 시 첫 번째 문항을 자동으로 선택
watch(filteredQuestions, (newList) => {
    if (newList.length > 0) {
        // 기존 선택 문항이 필터링 결과에 포함되지 않으면 첫 번째 문항 선택
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
</script>
