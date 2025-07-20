<template>
    <PassageAndQuestionLayout>
    <template #left>
    <div class="w-full h-full flex flex-col items-start gap-4 box-border "> <!--max-w-[1232px] -->
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
                    <BaseButton v-for="pattern in questionPatterns" :key="pattern.id" :text="pattern.label" type="type3"
                        :width="pattern.width" class="transition-all duration-200" :class="{
                            'bg-[#e6f3ff] border-none text-[#0066cc]':
                                activePattern === pattern.label,
                            'bg-white border-[#bdbdbd] text-[#757575] hover:border-[#0086ff] hover:text-[#0086ff]':
                                activePattern !== pattern.label,
                        }" @click="activePattern = pattern.label" />
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
                class="w-full flex-1 h-[462px] rounded-[20px] border border-[#bdbdbd] p-4 md:p-5 flex items-center justify-center overflow-hidden">
                <div v-if="filteredQuestions.length > 0" class="flex flex-col gap-4 w-full h-full overflow-y-auto">
                    <div v-for="(item, index) in filteredQuestions" :key="index"
                        class="w-full h-24 rounded-[20px] border border-[#bdbdbd] p-4 flex flex-col items-start gap-2.5 cursor-pointer transition-all duration-200 hover:border-[#0086ff] hover:bg-[#e6f3ff]"
                        :class="{
                            'border-[#0086ff] bg-[#e6f3ff]':
                                JSON.stringify(selectedQuestion) ===
                                JSON.stringify(item),
                        }" @click="selectedQuestion = item">
                        <div>
                            <span
                                class="px-2 py-1 rounded-lg border border-[#0086ff] text-[#0086ff] bg-[#cce5ff] font-semibold text-xs md:text-sm leading-[150%] tracking-[-0.02em] mr-4">
                                {{ item.pattern }}
                            </span>
                            
                            <span
                                class="px-2 py-1 rounded-lg border border-[#BDBDBD] text-[#757575] bg-[#D9D9D9] font-semibold text-xs md:text-sm leading-[150%] tracking-[-0.02em]">
                                {{ item.tag }}
                            </span>

                        </div>
                        <div class="font-medium text-xs md:text-sm leading-[150%] tracking-[-0.02em] text-[#303030]">
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
                class="w-full flex-1  h-[462px] rounded-[20px] border border-[#bdbdbd] p-4 md:p-6 flex flex-col items-start overflow-hidden">
                <div class="flex justify-between w-full mb-6 md:mb-8">
                    <div class="font-bold text-base md:text-lg leading-[150%] tracking-[-0.02em] ">
                        문항 미리보기
                    </div>
                    <div v-if="selectedQuestion" class="px-2 py-1 rounded-lg border border-[#BDBDBD] text-[#000000] bg-[#D9D9D9] font-semibold text-xs md:text-sm leading-[150%] tracking-[-0.02em]">
                        {{ selectedQuestion.reference }}
                    </div>
                </div>
                <div v-if="selectedQuestion" class="w-full h-full overflow-y-auto">
                    <div class="font-normal text-base md:text-lg leading-[150%] tracking-[-0.02em] mb-3 text-left">
                        {{ selectedQuestion.title }}
                    </div>
                    <div v-if="selectedQuestion.subpassage" class="border border-2 w-full p-2 mb-2 text-xs md:text-sm leading-10 tracking-[-0.02em] text-left ">
                        보기
                        {{ selectedQuestion.subpassage }}
                    </div>
                    <div
                        class="font-normal text-xs md:text-sm leading-10 tracking-[-0.02em] whitespace-pre-wrap text-left">
                        {{ selectedQuestion.question }}
                    </div>
                </div>
            </div>
        </div>
    </div></template>
    </PassageAndQuestionLayout>
</template>
<script setup>
import { ref, computed, watch } from "vue";
import BaseButton from "@/components/common/BaseButton.vue";
import questionExampleData from '@/assets/data/question_example.json';
import PassageAndQuestionLayout from "./PassageAndQuestionLayout.vue";

const props = defineProps({
    generateType: String, // 부모에서 절달된 내용
});

const emit = defineEmits(["selectedQuestionExample"]); // 부모 컴포넌트로 선택된 문항 전달

const activePattern = ref(null); // 문항 유형 선택값
const activeType = ref(null); // 서술 방식 선택값
const activeDifficulty = ref(null); // 난이도 선택값
const selectedQuestion = ref(null); // 선택된 문항을 ref로 저장

const questionPatterns = ref([
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
    { id: 12, label: "긍정형" },
]);

// 1. 기본 questions를 구조별로 필터링
const questions = computed(() => {
    // structure 타입 결정
    let structureType = props.generateType.replace(/\s/g, '');
    
    // question_example.json에서 구조별 필터링
    return questionExampleData.filter(question => {
        if (question.structure && question.structure.length > 0) {
            return question.structure.includes(structureType)
        }
        return true
    })
})

// 2. 기존 filteredQuestions를 업데이트 (패턴, 타입별 필터링)
const filteredQuestions = computed(() => {
    if (!activePattern.value || (!activeType.value && !activeDifficulty.value)) {
        return [];
    }

    return questions.value.filter((q) => { // questionExample → questions.value 변경
        return (
            (activePattern.value === "전체" || q.pattern === activePattern.value) &&
            (activeType.value === "전체" || q.type === activeType.value) &&
            (activeDifficulty.value === null || activeDifficulty.value === "전체" || q.difficulty === activeDifficulty.value)
        );
    });
});

// 3. 기존 watch는 그대로 유지
watch(filteredQuestions, (newList) => {
    if (newList.length > 0) {
        if (!selectedQuestion.value || !newList.includes(selectedQuestion.value)) {
            selectedQuestion.value = newList[0];
        }
    } else {
        selectedQuestion.value = null;
    }
});

// emit 이벤트를 통해 선택된 문항을 부모 컴포넌트로 전달
watch(selectedQuestion, (newQuestion) => {
    emit('selectedQuestionExample', newQuestion);
}, { immediate: true });
</script>
