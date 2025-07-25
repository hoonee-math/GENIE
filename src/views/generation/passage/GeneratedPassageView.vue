<template>
    <div class="flex flex-col p-0 md:p-8 gap-6 box-border w-full h-full">
        <!-- PassageAndQuestionLayout에 flex-1 삭제: 남은 공간 차지하되 축소 가능한 설정 제거 -->
        <div class=""> <!-- flex-1 min-h-0 overflow-hidden 제거 -->
            <PassageAndQuestionLayout :left-ratio="2" :right-ratio="1">
                <template #title>
                    <EditableTitle title-class="text-3xl font-semibold" />
                </template>
                <template #left>
                    <!-- TipTapEditor (1) savedContent 값을 props 로 자식 컴포넌트의 initialContent 변수로 전달 -->
                    <!-- TipTapEditor (2) 자식 컴포넌트에서 emit 으로 부모 컴포넌트에 전달, 자식이 emit 한 데이터를 받는 함수 handleContentChange -->
                    <PassageEditor :max-length="numberLength" :initialContent="savedContent"
                        :parentComponent="currentParentComponent" @content-changed="handleContentChange" />
                </template>
                <template #right>
                    <!-- 지문 분석 (Pinia Store에서 자동으로 데이터 가져옴) -->
                    <PassageSummaryLayout />
                </template>
            </PassageAndQuestionLayout>
        </div>

        <!-- 재생성하기, 문항 이어서 생성하기, 저장하기, 추출하기 버튼 추가 예정 -->

        <!-- 하단 버튼 -->
        <div v-if="existRequestData" class="flex justify-end space-x-4 flex-shrink-0">
            <button @click="GenerateQuestionWithThisPassage" :disabled="isLoading"
                class="px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200 bg-brand text-white hover:bg-blue-600">
                이어서 문항 생성하기
            </button>
            <button @click="openPaymentUsageModal" :disabled="isLoading"
                class="px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200 bg-brand text-white hover:bg-blue-600">
                재생성하기
            </button>
        </div>
        
        <!-- GeneratedQuestionView에서 사용할 슬롯 -->
        <slot name="questions"></slot>
    </div>

    <!-- 로딩 모달 -->
    <LoadingModal :isOpen="isLoading" :message="loadingMessage" />

    <PaymentUsageModal ref="paymentUsageModalRef" :isOpen="isPaymentUsageModalOpen" @close="closePaymentUsageModal"
        @generate="reGeneratePassageWithPrevDescription" />
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PassageAndQuestionLayout from '@/views/generation/PassageAndQuestionLayout.vue'
import PassageSummaryLayout from '@/views/generation/PassageSummaryLayout.vue'
import PassageEditor from '@/views/generation/PassageEditor.vue'
import { usePassage } from '@/composables/usePassage'
import EditableTitle from '@/views/generation/EditableTitle.vue'
import PaymentUsageModal from "@/components/generation/PaymentUsageModal.vue";
import LoadingModal from '@/components/common/LoadingModal.vue'

const props = defineProps({
    isCalledFromGeneratedQuestionView: {
        type: Boolean,
        default: false
    }
})
// defineEmits 추가
const emit = defineEmits(['title-changed', 'content-changed'])

// Router 및 Composable 설정
const route = useRoute()
const router = useRouter()
const { fetchPassage, generateAndSavePassage, passage, isLoading: passageLoading } = usePassage()

// 로딩 및 에러 상태
const isLoading = ref(true)
const errorMessage = ref('')
const goToQuestionGenerateForm = ref(false)

// script에 추가할 상태들
const editableTitle = ref(false)
const editedTitle = ref('')

// 지문 재생성 요청을 위한 변수
const isReGenerating = ref(false)
const existRequestData = ref(false) // 요청 데이터 존재 여부 상태, 이전 페이지가 GeneratePassageForm 일 경우 localStorage에 저장된 requestData를 확인함
const loadingMessage = ref('')
const isPaymentUsageModalOpen = ref(false)
const paymentUsageModalRef = ref()

// 타이틀 편집 토글
const toggleTitleEdit = () => {
    if (!editableTitle.value) {
        // 편집 시작
        editableTitle.value = true
        editedTitle.value = passage.value.title || ''
    } else {
        // 편집 완료
        editableTitle.value = false
        // 부모 컴포넌트에 변경사항 전달
        emit('title-changed', editedTitle.value)
    }
}

// 타이틀 변경 핸들러
const handleTitleChange = () => {
    // 실시간으로 변경사항을 부모에게 알림 (저장하기 버튼 활성화용)
    emit('title-changed', editedTitle.value)
}

// TipTapEditor 관련 변수
const savedContent = ref('')
const currentLength = ref(0)
const numberLength = ref(3000)

// TipTapEditor 콘텐츠 변경 핸들러
const handleContentChange = ({ content, textLength }) => {
    console.log('Content:', content)
    console.log('Length:', textLength)
    savedContent.value = content
    currentLength.value = textLength

    // 부모 컴포넌트(문항 생성 페이지: GeneratedQuestionView)에 content 변경사항도 전달
    emit('content-changed', { content, textLength })
}

// URL에서 pasCode 추출 및 데이터 로드 (캐시 우선)
const loadPassageData = async () => {
    try {
        isLoading.value = true
        errorMessage.value = ''

        const pasCode = route.params.pasCode
        if (!pasCode) {
            throw new Error('지문 코드가 없습니다.')
        }

        console.log('📜 지문 데이터 로드 시작 (캐시 우선):', pasCode)

        // usePassage의 fetchPassage 사용 (캐시 우선 + API 호출)
        if (props.isCalledFromGeneratedQuestionView) {
            await fetchPassage(pasCode, { includeQuestions: true })
        } else {
            await fetchPassage(pasCode)
        }

        // TipTap 에디터에 초기 콘텐츠 설정
        savedContent.value = passage.value.content || ''
        // 데이터 로드 후 title 초기화
        editedTitle.value = passage.value.title || ''

        console.log('✅ 지문 데이터 로드 완료:', {
            pasCode: passage.value.pasCode,
            title: passage.value.title
        })


    } catch (error) {
        console.error('❌ 지문 로드 실패:', error)
        errorMessage.value = '지문을 불러오는데 실패했습니다.'
    } finally {
        isLoading.value = false
    }
}

// 해당 지문을 이용해 문항 생성 페이지로 이동
const GenerateQuestionWithThisPassage = () => {
    if (isLoading.value) return // 로딩 중이면 클릭 방지
    goToQuestionGenerateForm.value = true
    router.push(`/questions/form`)
}

// 기존 제재를 이용해 지문 다시 만들기 요청
const reGeneratePassageWithPrevDescription = async () => {
    isLoading.value = true
    loadingMessage.value = '지문을 생성 중입니다.\n생성까지 최대 1분이 소요될 수 있습니다.'
    try{
        const generateType = localStorage.getItem('generateType')
        const requestData = JSON.parse(localStorage.getItem('requestData') || '{}')

        const newPasCode = await generateAndSavePassage(generateType, passage.value.title, requestData)
        
        isReGenerating.value = true
        router.push(`/passage/view/${newPasCode}`)
        
    } catch(error) {
        alert('지문 재생성 요청에 실패하였습니다. 관리자에게 문의하세요')
    } finally {
        loadingMessage.value = ''
        isLoading.value = false;
    }
}
// 결제 사용 모달 관련 함수
const openPaymentUsageModal = () => { isPaymentUsageModalOpen.value = true; };
const closePaymentUsageModal = () => { isPaymentUsageModalOpen.value = false; };

// PassageEditor 의 parentComponent 변수에 전달할 값(currentParentComponent) 설정 
const currentParentComponent = computed(() => {
    return props.isCalledFromGeneratedQuestionView ? 'GeneratedQuestionView' : 'GeneratedPassageView'
})

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
    loadPassageData()
    isReGenerating.value=false
    
    // localStorage에서 필요한 데이터 확인
    const generateType = localStorage.getItem('generateType')
    const requestData = localStorage.getItem('requestData')
    
    // 두 값이 모두 존재하는지 확인
    if (generateType && requestData) {
        try {
        // requestData가 유효한 JSON인지 검증
        JSON.parse(requestData)
        existRequestData.value = true
        console.log('✅ 이전 생성 데이터 발견:', { generateType, requestData })
        } catch (error) {
        // JSON 파싱 실패시 무효한 데이터로 간주
        console.warn('⚠️ 유효하지 않은 requestData:', error)
        existRequestData.value = false
        // 잘못된 데이터 정리
        localStorage.removeItem('generateType')
        localStorage.removeItem('requestData')
        }
    } else {
        existRequestData.value = false
        console.log('ℹ️ 이전 생성 데이터 없음')
    }
})


onBeforeUnmount(() => {
    // 컴포넌트 언마운트 시 localStorage 정리
    if (!isReGenerating.value) { // 재생성 요청시에는 localStorage 유지, 그 이외의 경우에만 removeItem 시도
        localStorage.removeItem('generateType')
        localStorage.removeItem('requestData')
    }
    // 컴포넌트 종료 시 리스트만 클리어
    const { clearPassage } = usePassage()
    if (!goToQuestionGenerateForm.value) { // QuestionGenerateForm.vue 로 이동하지 않는 경우에만 passage 데이터 클리어
        clearPassage() // Pinia Store에서 passage 데이터 클리어
    }
})

</script>

<style scoped>
.text-brand {
    color: #0086FF;
}
</style>
