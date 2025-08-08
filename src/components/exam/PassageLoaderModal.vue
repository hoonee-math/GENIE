<template>
    <BaseModal :isOpen="isOpen" width="80vw" height="80vh" @close="closeModal">
        <div class="w-full h-full flex flex-col items-start gap-4 box-border max-w-[1232px] max-h-[968px]">
            <h1
                class="w-full font-pretendard font-bold text-lg md:text-xl leading-[150%] tracking-[-0.02em] text-[#303030]">
                지문 및 문항 불러오기
            </h1>

            <div class="flex flex-col gap-3 w-full">
                <!-- 지문 구조 -->
                <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <span class="font-pretendard font-normal text-sm leading-[150%] tracking-[-0.02em] text-[#424242]">
                        지문 구조
                    </span>
                    <div class="flex flex-wrap gap-2 md:gap-4 overflow-x-auto w-full md:w-auto">
                        <BaseButton v-for="structure in passageStructures" :key="structure.id" :text="structure.label" type="type3"
                            :width="structure.width" height="40px" class="transition-all duration-200" :class="{
                                'bg-[#e6f3ff] border-none text-[#0066cc]':
                                    activeStructure === structure.label,
                                'bg-white border-[#bdbdbd] text-[#757575] hover:border-[#0086ff] hover:text-[#0086ff]':
                                    activeStructure !== structure.label,
                            }" @click="activeStructure = structure.label" />
                    </div>
                </div>
            </div>

            <!-- 사용자의 저장된 지문+문항 목록, 문항이 있는 지문들만 호출하여 보여줘야 함. 새로운 api 필요.-->
            <!-- 목록은 @/components/exam/PassageBlock.vue 을 재활용하는 것을 고려. but 구조가 다름. PassageBlock 이나 QuesetionItem 에 들어있는 heroicons-solid:menu-alt-4 아이콘과 index 번호를 출력해주는 대신에 체크 박스가 필요함.-->
            <!-- PassageBlock 이나 QuesetionItem 를 수정하거나 비슷한 구조의 새로운 두 컴포넌트를 만들어 체크박스 형태로 사용. 선택한 지문과 그 지문에 포함된 일부 또는 전체 문항을 PassageLoaderPnael로 전달할 수 있게 설정 -->
            <!-- 해당 체크박스를 이용해서 문제지로 불러올 지문과 문항을 선택. 지문을 체크하면 모든 문항이 체크됨. 일부 문항만 체크하면 지문에 체크된 체크 박스가 부분체크된 상태를 보여주는 형태로 변해야함. -->
            <!-- 위에서 선택한 지문 구조는 loadedPassagesFromStroage 의 각 passage의 descripton 데이터를 보고 확인할 수 있음. usePassage 의 selectGenerateType 함수를 이용하면 됨. -->
            <div class="flex flex-col lg:flex-row gap-4 md:gap-5 flex-1 w-full overflow-hidden">
                <!-- 지문+문항 목록 -->
                <div
                    class="w-full flex-1 h-full rounded-[20px] border border-[#bdbdbd] p-4 md:p-5 overflow-hidden">
                    <div v-if="isLoading" class="flex items-center justify-center h-full">
                        <div class="flex items-center gap-2 text-gray-500">
                            <Icon icon="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
                            지문 목록을 불러오는 중...
                        </div>
                    </div>
                    <div v-else-if="filteredPassages.length > 0" class="flex flex-col gap-4 w-full h-full overflow-y-auto">
                        <TransitionGroup name="passage" tag="div" class="space-y-4">
                            <PassageBlock 
                                v-for="(passage, index) in filteredPassages" 
                                :key="passage.pasCode" 
                                :passage="passage" 
                                :index="index"
                                :showCheckbox="true"
                                :selectedQuestions="selectedQuestions[passage.pasCode] || []"
                                @passageCheckboxChange="handlePassageCheckboxChange"
                                @questionCheckboxChange="handleQuestionCheckboxChange"
                                @toggle="handleTogglePassage(passage.pasCode)" 
                            />
                        </TransitionGroup>
                    </div>
                    <div v-else class="flex items-center justify-center h-full">
                        <div class="text-center text-gray-500">
                            <Icon icon="heroicons:document-text" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p class="font-bold text-base md:text-lg leading-[150%] tracking-[-0.02em]">
                                {{ activeStructure === '전체' ? '문항이 있는 지문이 없습니다.' : `${activeStructure}에 해당하는 지문이 없습니다.` }}
                            </p>
                            <p class="text-sm mt-2">문항 생성 페이지에서 새로운 문항을 생성해주세요.</p>
                        </div>
                    </div>
                </div>

                <!-- 미리보기 -->
                <div
                    class="w-full flex-1 h-full rounded-[20px] border border-[#bdbdbd] p-4 md:p-6 flex flex-col overflow-hidden">
                    <div v-if="previewPassage" class="flex flex-col h-full overflow-hidden">
                        <div class="flex items-center gap-2 mb-4 pb-2 border-b">
                            <h3 class="font-bold text-lg text-gray-800">{{ previewPassage.title }}</h3>
                            <span class="text-xs font-semibold px-2 py-1 rounded-full"
                                :class="getPassageTypeClass(previewPassage.generateType)">
                                {{ previewPassage.generateType }}
                            </span>
                        </div>
                        
                        <div class="flex-1 overflow-y-auto prose prose-sm max-w-none" 
                             v-html="previewPassage.content">
                        </div>
                        
                        <div class="mt-4 pt-2 border-t text-sm text-gray-500">
                            선택된 문항: {{ getSelectedQuestionCount(previewPassage.pasCode) }} / {{ previewPassage.questions?.length || 0 }}개
                        </div>
                    </div>
                    <div v-else class="flex items-center justify-center h-full text-center text-gray-500">
                        <div>
                            <Icon icon="heroicons:eye" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p class="font-semibold">미리보기</p>
                            <p class="text-sm mt-1">지문을 선택하면 내용을 미리볼 수 있습니다.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 버튼 영역 -->
            <div class="flex flex-col sm:flex-row gap-2.5 self-end w-full sm:w-auto">
                <div class="flex gap-2.5 w-full sm:w-auto relative">
                    <BaseButton text="닫기" type="type3" height="54px" class="w-full sm:w-auto px-8 text-sm"
                        @click="closeModal" />
                    <BaseButton 
                        :text="`지문 및 문항 추가하기 (${totalSelectedQuestions}개)`" 
                        type="type1" 
                        height="54px" 
                        class="w-full sm:w-auto px-8 text-sm"
                        :disabled="totalSelectedQuestions === 0" 
                        @click="handleLoadPassageAndQuestionFromStorage" 
                    />
                </div>
            </div>
        </div>
    </BaseModal>

    <LoadingModal :isOpen="isLoading" :message="loadingMessage" />
</template>
<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import BaseModal from "@/components/common/BaseModal.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import LoadingModal from "@/components/common/LoadingModal.vue";
import PassageBlock from "@/components/exam/PassageBlock.vue";
import { usePassage } from "@/composables/usePassage";

// Props & Emits
const props = defineProps({
    isOpen: Boolean,
});

const emit = defineEmits(["close", "loadSelectedData"]);

// Composables
const { fetchPassagesWithQuestionsList, selectGenerateType } = usePassage();

// 반응형 상태
const isLoading = ref(false);
const loadingMessage = ref("지문 목록을 불러오는 중...");
const allPassages = ref([]);
const selectedQuestions = ref({}); // { pasCode: [questionId1, questionId2, ...] }
const previewPassage = ref(null);
const isProcessing = ref(false);

// 지문 구조 필터
const activeStructure = ref("전체");
const passageStructures = ref([
    { id: 1, label: "전체" },
    { id: 2, label: "단일 지문" },
    { id: 3, label: "복합 지문" },
    { id: 4, label: "독서론" },
]);

// 계산된 속성
const filteredPassages = computed(() => {
    if (activeStructure.value === "전체") {
        return allPassages.value;
    }
    return allPassages.value.filter(passage => 
        passage.generateType === activeStructure.value
    );
});

const totalSelectedQuestions = computed(() => {
    return Object.values(selectedQuestions.value).reduce((total, questions) => {
        return total + questions.length;
    }, 0);
});

// 메서드
const loadPassages = async () => {
    if (isLoading.value) return;
    
    isLoading.value = true;
    try {
        const passages = await fetchPassagesWithQuestionsList();
        
        // 원본 데이터 구조 유지하되 PassageBlock에 필요한 필드만 추가
        allPassages.value = passages.map(passage => ({
            ...passage, // 원본 데이터 유지 (pasCode, questions 등)
            type: passage.generateType, // PassageBlock에서 사용하는 type 필드
            isExpanded: false, // 기본적으로 접힌 상태
        }));
        
        console.log("✅ PassageLoaderModal: 지문 목록 로드 완료", allPassages.value.length, "개");
    } catch (error) {
        console.error("❌ PassageLoaderModal: 지문 목록 로드 실패", error);
        // TODO: 에러 처리 UI 추가
    } finally {
        isLoading.value = false;
    }
};

const handlePassageCheckboxChange = (data) => {
    const { passageId, questionIds, checked } = data;
    
    if (checked) {
        // 지문 체크 시 모든 문항 선택
        selectedQuestions.value[passageId] = [...questionIds];
    } else {
        // 지문 체크 해제 시 모든 문항 선택 해제
        selectedQuestions.value[passageId] = [];
    }
    
    // 반응성을 위해 객체를 새로 생성
    selectedQuestions.value = { ...selectedQuestions.value };
};

const handleQuestionCheckboxChange = (data) => {
    const { passageId, questionId, checked } = data;
    
    if (!selectedQuestions.value[passageId]) {
        selectedQuestions.value[passageId] = [];
    }
    
    if (checked) {
        // 개별 문항 선택 - 해당 문항만 선택
        if (!selectedQuestions.value[passageId].includes(questionId)) {
            selectedQuestions.value[passageId] = [...selectedQuestions.value[passageId], questionId];
        }
    } else {
        // 개별 문항 선택 해제 - 해당 문항만 해제
        selectedQuestions.value[passageId] = selectedQuestions.value[passageId].filter(
            id => id !== questionId
        );
    }
    
    // 반응성을 위해 객체를 새로 생성
    selectedQuestions.value = { ...selectedQuestions.value };
};

const handleTogglePassage = (passageId) => {
    const passage = allPassages.value.find(p => p.pasCode === passageId);
    if (passage) {
        passage.isExpanded = !passage.isExpanded;
        
        // 펼쳐질 때 미리보기 설정
        if (passage.isExpanded && !previewPassage.value) {
            previewPassage.value = passage;
        }
    }
};

const getSelectedQuestionCount = (passageId) => {
    return selectedQuestions.value[passageId]?.length || 0;
};

const getPassageTypeClass = (type) => {
    switch (type) {
        case '단일 지문':
            return 'bg-blue-100 text-blue-700';
        case '복합 지문':
            return 'bg-purple-100 text-purple-700';
        case '독서론':
            return 'bg-green-100 text-green-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const closeModal = () => {
    // 상태 초기화
    selectedQuestions.value = {};
    previewPassage.value = null;
    activeStructure.value = "전체";
    
    emit("close");
};

const handleLoadPassageAndQuestionFromStorage = async () => {
    if (isProcessing.value || totalSelectedQuestions.value === 0) return;
    
    isProcessing.value = true;
    loadingMessage.value = "선택한 지문과 문항을 추가하는 중...";
    isLoading.value = true;
    
    try {
        // 선택된 지문과 문항 데이터 준비
        const selectedData = [];
        
        for (const [passageId, questionIds] of Object.entries(selectedQuestions.value)) {
            if (questionIds.length > 0) {
                const passage = allPassages.value.find(p => p.pasCode === parseInt(passageId));
                if (passage) {
                    const selectedQuestionData = passage.questions.filter(q => 
                        questionIds.includes(q.id)
                    );
                    
                    selectedData.push({
                        ...passage,
                        questions: selectedQuestionData
                    });
                }
            }
        }
        
        console.log("📤 PassageLoaderModal: 선택된 데이터 전달", selectedData);
        
        // 부모 컴포넌트에 선택된 데이터 전달
        emit("loadSelectedData", selectedData);
        
    } catch (error) {
        console.error("❌ 지문 및 문항 추가 실패:", error);
        alert("오류가 발생했습니다.");
    } finally {
        isProcessing.value = false;
        isLoading.value = false;
        closeModal();
    }
};

// 지문 구조 필터링 시 미리보기 업데이트
watch(activeStructure, (newStructure) => {
    // 현재 미리보기 중인 지문이 필터링으로 인해 보이지 않게 되면 미리보기 해제
    if (previewPassage.value && newStructure !== "전체") {
        const isVisible = filteredPassages.value.some(p => p.pasCode === previewPassage.value.pasCode);
        if (!isVisible) {
            previewPassage.value = null;
        }
    }
});

// 모달 열릴 때 데이터 로드
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        loadPassages();
    }
});

// 컴포넌트 마운트 시 초기 로드
onMounted(() => {
    if (props.isOpen) {
        loadPassages();
    }
});

</script>
