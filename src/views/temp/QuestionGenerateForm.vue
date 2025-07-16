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
                        <PassageEditor ref="editorRef" :initialContent="questionContent" :parentComponent="'QuestionGenerateForm'" @content-changed="handleContentChange" />
                    </div>
                </div>
            </template>

            <template #right>
                <!-- LoadPassageModal.vue 의 지문 불러오기에서 지문을 선택한 후 불러오기 버튼을 클릭하면 해당 지문을 pinia에 저장시키기. pinia에 저장된 지문과 지문 분석 데이터 출력 (Pinia Store에서 자동으로 데이터 가져옴) -->
                <PassageSummaryLayout v-if="!showQuestionModal"/>
                
            </template>
        </PassageAndQuestionLayout>

        <!-- 하단 버튼들 (문항 유형 선택 모달이 표시되지 않을 때만) -->
        <div v-if="!showQuestionModal" class="flex flex-col sm:flex-row justify-end gap-4 mt-8">
            <BaseButton id="reset_button" text="초기화" type="type2" width="248px" height="54px" :disabled="!canReset"
                @click="resetAll" class="hover:shadow-xl active:scale-[0.98]" />
            <BaseButton id="select-type" text="문항 유형 선택하기" type="type1" width="248px" height="54px"
                :disabled="!canGenerate" @click="openQuestionModal" class="hover:shadow-xl active:scale-[0.98]" />
        </div>

        <!-- 문항 유형 선택 모달이 표시될 때 -->
        <div v-if="showQuestionModal" class="w-full">
            <GenerateQuestionModal :isOpen="true" :mode="'inline'" :passageTitle="questionTitle"
                :passageContent="questionContent" @close="closeQuestionModal" @generate="handleQuestionGenerate" />
        </div>

        <!-- 모달 컴포넌트들 -->
        <!-- (미구현) 지문 불러오기에서 지문을 선택한 후 불러오기 버튼을 클릭하면 해당 지문을 pinia에 저장시키기. pinia에 저장된 지문과 지문 분석 데이터 출력 (Pinia Store에서 자동으로 데이터 가져옴) -->
        <LoadPassageModal :isOpen="showLoadPassageModal" @close="closeLoadPassageModal"
            @selectPasCode="handleLoadPassage" />

        <ConfirmModalComponent :isOpen="isConfirmModalOpen" title="글자 수를 확인해 주세요."
            message="500자 이하의 지문으로 정상적인 문항을 생성하기 어렵습니다. 충분한 지문을 입력해 주세요." @close="isConfirmModalOpen = false"
            @confirm="isConfirmModalOpen = false" />

        <!-- 로딩 모달 -->
        <LoadingModal :isOpen="isGenerating" :message="loadingMessage" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PassageAndQuestionLayout from './PassageAndQuestionLayout.vue'
import PassageSummaryLayout from './PassageSummaryLayout.vue'
import PassageEditor from './PassageEditor.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import GenerateQuestionModal from '@/components/generation/GenerateQuestionModal.vue'
import LoadPassageModal from '@/components/generation/LoadPassageModal.vue'
import ConfirmModalComponent from '@/components/common/ConfirmModalComponent.vue'
import LoadingModal from '@/components/common/LoadingModal.vue'
import { useQuestion } from '@/composables/useQuestion'
import { usePassage } from '@/composables/usePassage';

// Router 및 Composables
const route = useRoute()
const router = useRouter()
const {
    passage,
    validateQuestionData,
    processQuestionGeneration,
    loadPassageFromStorage,
    continueFromGeneratedPassage,
    resetPassageData
} = useQuestion()
const { fetchPassage } = usePassage();

// ===== 상태 관리 =====

// 기본 상태
const isLoading = ref(false)
const errorMessage = ref('')
const isGenerating = ref(false)
const loadingMessage = ref('문항을 생성 중입니다.\\n생성까지 최대 3분이 소요될 수 있습니다.')

// 데이터 상태
const questionTitle = ref('Untitled')
const questionContent = ref('')
const textLength = ref(0)

// 탭 상태
const activeTab = ref('user') // ['user': '사용자 입력', 'storage': '자료실 지문' }]

// 모달 상태
const showQuestionModal = ref(false)
const showLoadPassageModal = ref(false)
const isConfirmModalOpen = ref(false)

// 에디터 참조
const editorRef = ref(null)

// ===== Computed Properties =====

// 초기화 가능 여부
const canReset = computed(() => {
    return questionTitle.value.trim().length > 0 ||
        questionContent.value.trim().length > 0
})

// 문항 생성 가능 여부
const canGenerate = computed(() => {
    const validation = validateQuestionData(questionTitle.value, questionContent.value)
    return validation.isValid
})

// ===== 이벤트 핸들러 =====

/**
 * 에디터 내용 변경 처리
 */
const handleContentChange = ({ content, textLength: length }) => {
    questionContent.value = content
    textLength.value = length
}

/**
 * 탭 전환 처리
 */
const switchTab = (tabKey) => {
    if (tabKey === 'storage') {
        activeTab.value = tabKey
        openLoadPassageModal()
    } else {
        activeTab.value = tabKey
    }
}

/**
 * 전체 초기화
 */
const resetAll = () => {
    questionTitle.value = 'Untitled'
    questionContent.value = ''
    textLength.value = 0
    activeTab.value = 'user'

    // 에디터 초기화
    if (editorRef.value) {
        editorRef.value.setContent('')
    }

    // store 초기화
    resetPassageData()
}

// ===== 모달 관련 함수들 =====

/**
 * 문항 유형 선택 모달 열기
 */
const openQuestionModal = () => {
    if (!canGenerate.value) {
        const validation = validateQuestionData(questionTitle.value, questionContent.value)
        if (!validation.isValid) {
            errorMessage.value = validation.errors.join(' ')
            return
        }
    }

    showQuestionModal.value = true
}

/**
 * 문항 유형 선택 모달 닫기
 */
const closeQuestionModal = () => {
    showQuestionModal.value = false
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
    // 모달을 닫으면 사용자 입력 탭으로 돌아가기
    // activeTab.value = 'user'
}

/**
 * 지문 불러오기 처리
 */
const handleLoadPassage = async (selectPasCode) => {
    // console.log('🔥 [DEBUG] handleLoadPassage 호출됨 - selectPasCode:', selectPasCode, 'typeof:', typeof selectPasCode);
    
    // 중복 호출 방지: 이미 로딩 중이면 종료
    if (isLoading.value) {
        // console.log('⚠️ [DEBUG] QuestionGenerateForm: 이미 로딩 중이므로 함수 종료');
        return;
    }
    
    // // 유효성 검증 추가
    // if (!selectPasCode || selectPasCode === null || selectPasCode === undefined) {
    //     console.warn('⚠️ [DEBUG] QuestionGenerateForm: 잘못된 selectPasCode 값으로 인해 함수 종료:', selectPasCode);
    //     return;
    // }
    
    try {
        isLoading.value = true
        await fetchPassage(selectPasCode);
        
        // UI 상태 변경
        activeTab.value = 'storage';
        closeLoadPassageModal();
        
        // console.log('📥 지문 불러오기 완료');
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
const handleQuestionGenerate = async (questionData) => {
    isGenerating.value = true

    try {
        await processQuestionGeneration(questionData, questionTitle.value, questionContent.value)
        // 성공 시 자동으로 결과 페이지로 이동됨
    } catch (error) {
        console.error('문항 생성 실패:', error)
        errorMessage.value = error.message || '문항 생성에 실패했습니다.'
        closeQuestionModal()
    } finally {
        isGenerating.value = false
    }
}

// ===== 초기화 함수 =====

/**
 * 컴포넌트 초기화
 */
const initializeComponent = async () => {
    isLoading.value = true

    try {
        // URL 파라미터에서 pasCode 확인 (이어서 생성하기)
        const pasCode = route.params.pasCode || route.query.pasCode

        if (pasCode) {
            try {
                // 캐시에서 지문 데이터 로드
                const loadedData = continueFromGeneratedPassage(Number(pasCode))

                // UI 업데이트
                questionTitle.value = loadedData.title
                questionContent.value = loadedData.content
                activeTab.value = 'storage'

                // 에디터 업데이트 (nextTick으로 DOM 업데이트 후 실행)
                await nextTick()
                if (editorRef.value) {
                    editorRef.value.setContent(loadedData.content)
                }
            } catch (error) {
                console.error('캐시된 지문 로드 실패:', error)
                // 실패 시 기본 상태로 유지
            }
        }
    } catch (error) {
        console.error('컴포넌트 초기화 실패:', error)
        errorMessage.value = '페이지를 불러오는데 실패했습니다.'
    } finally {
        isLoading.value = false
    }
}

// ===== 라이프사이클 =====

onMounted(() => {
    initializeComponent()
})

// passage store 변경 감지
watch(() => passage.value, (newPassage) => {
    // console.log('🔍 [Watch] passage 변경 감지:', {hasPassage: !!newPassage, title: newPassage?.title || 'null', content: newPassage?.content ? `${newPassage.content.length}자` : 'null', descriptions: newPassage?.descriptions?.length || 0 })
    
    if (newPassage && newPassage.title && newPassage.content) {
        // console.log('✅ [Watch] UI 업데이트 실행')
        
        questionTitle.value = newPassage.title
        questionContent.value = newPassage.content

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