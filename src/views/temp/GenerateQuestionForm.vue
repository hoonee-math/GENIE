<template>
    <div class="flex flex-col gap-8 p-0 md:p-8 box-border w-full">

        <!-- 메인 콘텐츠 -->
        <PassageAndQuestionLayout :leftRatio="showQuestionModal ? 1 : 2" :rightRatio="showQuestionModal ? 0 : 1">

            <template #title>
                <!-- 기존 InsertPassage.vue 의 작업 이름이 들어갈 위치 -->
                {{ questionTitle }}
            </template>

            <template #left>
                <div>
                    <!-- 탭 네비게이션 -->
                    <div class="flex border-b border-gray-200 mb-6">
                        <button @click="switchTab('user')" :class="['px-4 py-2 text-sm font-medium border-b-2 transition-colors', activeTab === 'user' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700' ]">
                            사용자 입력
                        </button>
                        <button @click="switchTab('storage')" :class="['px-4 py-2 text-sm font-medium border-b-2 transition-colors', activeTab === 'storage' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700']">
                            자료실 지문
                        </button>
                    </div>

                    <!-- 사용자 입력 탭, 자료실 지문 탭 모두 같은 에디터에 데이터 입력 -->
                    <!-- GeneratedPassageView.vue 에서 추가 예정인 [문항 이어서 생성하기] 버튼을 클릭하면 passage pinia Store 에 저장시켜놓았던 캐시 데이터를 가져와서 해당 데이터를 바로 자료실 지문 탭에 출력 -->
                    <div>
                        <!-- TipTap 에디터 -->
                        <PassageEditor ref="editorRef" :initialContent="passageContent" :parentComponent="'QuestionGenerateForm'" @content-changed="handleContentChange" />
                    </div>
                </div>
            </template>

            <template #right>
                <!-- LoadPassageModal.vue 의 지문 불러오기에서 지문을 선택한 후 불러오기 버튼을 클릭하면 해당 지문을 pinia에 저장시키기. pinia에 저장된 지문과 지문 분석 데이터 출력 (Pinia Store에서 자동으로 데이터 가져옴) -->
                <PassageSummaryLayout>
                    <template #select_generateType>
                        <!-- 단일 지문, 복합 지문, 독서론 (generateType=kind_passage)을 선택할 수 있는 라디오 버튼, 해당 선택 값을 부모 객체에 전달 -->
                        <div class="flex-col md:flex-row justify-between items-center gap-4">
                            <label class="inline-flex items-center">
                                <input type="radio" value="단일 지문" v-model="generateType" class="form-radio text-brand" />
                                <span class="ml-2 whitespace-nowrap">단일 지문</span>
                            </label>
                            <label class="inline-flex items-center ml-4">
                                <input type="radio" value="복합 지문" v-model="generateType" class="form-radio text-brand" />
                                <span class="ml-2 whitespace-nowrap">복합 지문</span>
                            </label>
                            <label class="inline-flex items-center ml-4">
                                <input type="radio" value="독서론" v-model="generateType" class="form-radio text-brand" />
                                <span class="ml-2 whitespace-nowrap">독서론</span>
                            </label>
                        </div>
                    </template>
                </PassageSummaryLayout> 
                
            </template>
        </PassageAndQuestionLayout>

        <!-- 하단 버튼들 (문항 유형 선택 모달이 표시되지 않을 때만) -->
        <div v-if="!isQuestionExampleSelectorVisible" class="flex flex-col sm:flex-row justify-end gap-4 mt-8">
            <!-- 초기화 버튼 -->
            <button @click="resetAll" :disabled="!canReset" :class="['px-8 py-4 text-lg font-medium rounded-lg transition-colors duration-200', isLoading ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-gray-200 hover:bg-gray-300' ]">
                초기화
            </button>
            <!-- 문항 유형 선택하기 버튼 -->
            <button @click="showQuestionExampleSelector" :class="['px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200 bg-brand text-white hover:bg-blue-600']">
                문항 유형 선택하기
            </button>
        </div>

        <!-- 문항 유형 선택 모달 대신 아래 출력되도록 설정 -->
        <!-- (미구현) QuestionExampleSelector 의 [버튼 영역]을 옮기면서 문항 생성하기 버튼으로 문항 생성 요청시 필요한 데이터들을 emit 으로 받아오도록 수정 필요 -->
        <QuestionExampleSelector v-if="isQuestionExampleSelectorVisible" :generateType="generateType" @selectedQuestionExample="handleQuestionSelected"/>

        <!-- 모달 컴포넌트들 -->
        <!-- 지문 불러오기에서 지문을 선택한 후 불러오기 버튼을 클릭하면 해당 지문을 pinia에 저장시키기. pinia에 저장된 지문과 지문 분석 데이터 출력 (Pinia Store에서 자동으로 데이터 가져옴) -->
        <LoadPassageModal :isOpen="showLoadPassageModal" @close="closeLoadPassageModal"
            @selectPasCode="handleLoadPassage" />

        <!-- (미구현) QuestionExampleSelector 의 [버튼 영역]을 이 자리에 옮기기 -->
        <div v-if="isQuestionExampleSelectorVisible" class="flex justify-end space-x-4">
            <button @click="resetAll" :disabled="isLoading"
                :class="[
                    'px-8 py-4 text-lg font-medium rounded-lg transition-colors duration-200',
                    isLoading
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
                ]">
                직접 입력하기
            </button>
            <button @click="generateQuestion" :disabled="isLoading"
                :class="[
                    'px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200',
                    isLoading 
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                        : 'bg-brand text-white hover:bg-blue-600'
                ]">
                <!-- 로딩 스피너 -->
                <div v-if="isLoading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span v-if="loadingStep === 'generating'">문항 생성 중...</span>
                    <span v-else-if="loadingStep === 'saving'">문항 저장 중...</span>
                    <span v-else>처리 중...</span>
                </div>
                <span v-else>문항 생성하기</span>
            </button>
        </div>

        <!-- 문항 생성 확인 모달 -->
        <ConfirmModalComponent :isOpen="isConfirmModalOpen" title="글자 수를 확인해 주세요."
            message="500자 이하의 지문으로 정상적인 문항을 생성하기 어렵습니다. 충분한 지문을 입력해 주세요." @close="isConfirmModalOpen = false"
            @confirm="isConfirmModalOpen = false" />

        <!-- 로딩 모달 -->
        <LoadingModal :isOpen="isGenerating" :message="loadingMessage" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PassageAndQuestionLayout from './PassageAndQuestionLayout.vue'
import PassageSummaryLayout from './PassageSummaryLayout.vue'
import PassageEditor from './PassageEditor.vue'
import LoadPassageModal from '@/components/generation/LoadPassageModal.vue'
import ConfirmModalComponent from '@/components/common/ConfirmModalComponent.vue'
import LoadingModal from '@/components/common/LoadingModal.vue'
import { useQuestion } from '@/composables/useQuestion'
import { usePassage } from '@/composables/usePassage';
import QuestionExampleSelector from './QuestionExampleSelector.vue'

// Router 및 Composables
const route = useRoute()
const router = useRouter()
const {
    passage,
    validateQuestionData,
    processQuestionGeneration
} = useQuestion()
const { fetchPassage, clearPassage, corePointTabs } = usePassage();

// ===== 상태 관리 =====

// 기본 상태
const isLoading = ref(false)
const errorMessage = ref('')
const isGenerating = ref(false)
const isLeavingPageWithClear = ref(true) // 페이지를 나갈 때 passage 데이터를 초기화할지 여부, 문항 생성 요청시에는 false로 설정 예정

const loadingMessage = ref('문항을 생성 중입니다.\\n생성까지 최대 3분이 소요될 수 있습니다.')

// 데이터 상태
const questionTitle = ref('Untitled')
const passageContent = ref('')
const textLength = ref(0)
const selectedQuestionExample = ref(null)
const handleQuestionSelected = (questionExample) => {
    selectedQuestionExample.value = questionExample
    // console.log('받은 문항 데이터:', questionExample);
}

// 탭 상태
const activeTab = ref('user') // ['user': '사용자 입력', 'storage': '자료실 지문' }]
const generateType = ref('단일 지문')

// 모달 상태
const showQuestionModal = ref(false)
const showLoadPassageModal = ref(false)
const isConfirmModalOpen = ref(false)
const isQuestionExampleSelectorVisible = ref(false)

// 에디터 참조
const editorRef = ref(null)

// ===== Computed Properties =====

// 초기화 가능 여부
const canReset = computed(() => {
    return questionTitle.value.trim().length > 0 ||
        passageContent.value.trim().length > 0
})

// 문항 생성 가능 여부
const canGenerate = computed(() => {
    const validation = validateQuestionData(questionTitle.value, passageContent.value)
    if (validation.isValid) {
        errorMessage.value = ''
    } else {
        errorMessage.value = validation.errors.join(' ')
        alert(errorMessage.value) // 에러 메시지 출력
    }
    return validation.isValid
})

// ===== 이벤트 핸들러 =====

/**
 * 에디터 내용 변경 처리
 */
const handleContentChange = ({ content, textLength: length }) => {
    passageContent.value = content
    textLength.value = length
}

/**
 * 탭 전환 처리
 */
const switchTab = (tabKey) => {
    if (tabKey === 'storage') {
        activeTab.value = tabKey
        openLoadPassageModal()
    } else { // 사용자 입력 탭으로 전환
        // 사용자 입력 탭으로 전환 시 passage 데이터를 초기화
        activeTab.value = tabKey
        resetAll();
    }
}

/**
 * 전체 초기화
 */
const resetAll = () => {
    questionTitle.value = 'Untitled'
    passageContent.value = ''
    textLength.value = 0
    activeTab.value = 'user'
    isQuestionExampleSelectorVisible.value = false

    // 에디터 초기화
    if (editorRef.value) {
        editorRef.value.setContent('')
    }

    // store 초기화
    clearPassage()
}

// ===== 모달 관련 함수들 =====

/**
 * 문항 유형 선택하기 버튼 숨기기, 초기화 버튼 숨기기, QuestionExampleSelector 아래 나타내기
 */
const showQuestionExampleSelector = () => {
    // if (!canGenerate.value) {
    //     const validation = validateQuestionData(questionTitle.value, passageContent.value)
    //     if (!validation.isValid) {
    //         errorMessage.value = validation.errors.join(' ')
    //         return
    //     }
    // }

    isQuestionExampleSelectorVisible.value = true
}

/**
 * 지문 불러오기 모달 열기
 */
const openLoadPassageModal = () => {
    showLoadPassageModal.value = true
}

/**
 * 지문 불러오기 모달 닫기
 */
const closeLoadPassageModal = () => {
    showLoadPassageModal.value = false
    // 지문을 호출하지 않고 모달을 닫으면 사용자 입력탭으로 되돌리기
    if (passage.value.pasCode === null || passage.value.pasCode === undefined) {
        activeTab.value = 'user'
    }
}

/**
 * 지문 불러오기 처리, LoadPassageModal.vue 에서 선택된 지문(emit으로 selectPasCode 받아옴)을 가져와서 지문 정보를 호출(fetchPassage)하여 pinia에 저장
 */
const handleLoadPassage = async (selectPasCode) => {
    
    // 중복 호출 방지: 이미 로딩 중이면 종료
    if (isLoading.value) {
        return;
    }
    
    try {
        isLoading.value = true
        await fetchPassage(selectPasCode); // fetchPassage 함수에서 pinia에 passage 데이터를 저장함
        
        // UI 상태 변경
        activeTab.value = 'storage';
        closeLoadPassageModal();
        
    } catch (error) {
        console.error('지문 불러오기 실패:', error);
        errorMessage.value = '지문을 불러오는데 실패했습니다.';
        closeLoadPassageModal();
    } finally {
        isLoading.value = false
    }
}

/**
 * 문항 생성 처리
 */
const generateQuestion = async (questionData) => {
    isGenerating.value = true

    try {
        await processQuestionGeneration(questionData, questionTitle.value, passageContent.value)
        // 성공 시 자동으로 결과 페이지로 이동됨
    } catch (error) {
        console.error('문항 생성 실패:', error)
        errorMessage.value = error.message || '문항 생성에 실패했습니다.'
        closeQuestionModal()
    } finally {
        isGenerating.value = false
    }
}

// ===== 라이프사이클 =====

onMounted(() => {
    console.log('passage', passage.value.pasCode)
    if(passage.value.pasCode){
        activeTab.value = 'storage'
        console.log('📥 [DEBUG] PassageAndQuestionLayout: passage.pasCode')
    } else {
        activeTab.value = 'user'
        console.log('📥 [DEBUG] PassageAndQuestionLayout: passage.pasCode 없음, 사용자 입력 탭으로 설정')
    }
})

// 마운트 해제시
onUnmounted(() => {
    // 문항 생성을 하지 않고, 그냥 페이지를 나가려는 경우 pinia에 저장된 passage 데이터를 초기화
    if (isLeavingPageWithClear.value) {
        clearPassage()
    }
})

// passage store 변경 감지
watch(() => passage.value, (newPassage) => {
    // console.log('🔍 [Watch] passage 변경 감지:', {hasPassage: !!newPassage, title: newPassage?.title || 'null', content: newPassage?.content ? `${newPassage.content.length}자` : 'null', descriptions: newPassage?.descriptions?.length || 0 })
    
    if (newPassage && newPassage.title && newPassage.content) {
        // console.log('✅ [Watch] UI 업데이트 실행')
        
        questionTitle.value = newPassage.title
        passageContent.value = newPassage.content
        
        if (corePointTabs.value.length === 1 && corePointTabs.value[0].pasType === '독서론') {generateType.value = '독서론'}
        else if (corePointTabs.value.length === 1) generateType.value = '단일 지문'
        else if (corePointTabs.value.length > 1) generateType.value = '복합 지문'
        
        // 에디터 업데이트
        if (editorRef.value) {
            editorRef.value.setContent(newPassage.content)
            // console.log('📝 [Watch] 에디터 내용 업데이트 완료')
        } else {
            // console.log('⚠️ [Watch] 에디터 참조 없음')
        }
    } else {
        // console.log('⚠️ [Watch] 조건 미충족:', {hasPassage: !!newPassage, hasTitle: !!(newPassage?.title), hasContent: !!(newPassage?.content)})
    }
}, { deep: true, immediate: true })
</script>

<style scoped></style>