<template>
    <div class="min-h-screen flex justify-center items-center mx-auto p-4 sm:p-8 w-full ">
        <!-- hidden md:block flex flex-col gap-3 mx-auto p-4 sm:p-8 w-full -->
        <div class="w-[1312px]">
            <!-- 헤더 -->
            <div class="mb-4">
                <EditableTitle v-model="newPassageTitle" title-class="text-2xl font-bold"
                    placeholder="새 지문 제목을 입력하세요" />
            </div>

            <!-- 메인 콘텐츠 -->
            <div class="max-w-screen-2xl mx-auto">
                <div class="grid grid-cols-21">


                    <!-- 탭 네비게이션 -->
                    <div class="flex space-x-2 px-2">
                        <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key" :class="[
                            'flex items-center px-6 py-3 text-base text-nowrap font-medium rounded-t transition-all duration-200',
                            activeTab === tab.key
                                ? 'border border-gray-300'
                                : 'text-gray-600 bg-white hover:border-brand hover:text-brand'
                        ]">
                            {{ tab.label }}

                            <!-- Tooltip 적용 -->
                            <BaseTooltip v-if="tab.tooltip" :content="tab.tooltipContent" position="top" class="ml-2">
                                <template #trigger>
                                    <svg width="17" height="17" viewBox="0 0 17 17" fill="currentColor"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" d="M8.50033 6.02083C8.21853 6.02083..." />
                                        <path fill-rule="evenodd" d="M2.47949 8.5013C2.47949 6.90448..." />
                                    </svg>
                                </template>
                            </BaseTooltip>
                        </button>
                    </div>

                    <!-- 메인 영역 -->
                    <div class="col-span-8 bg-white rounded-lg p-9 border h-[752px]">
                        <PassageGenerationFormSplitLayout v-if="activeTab === 'single'">
                            <template #left>
                                <!-- 지문 분야 선택 -->
                                <div>
                                    <h3 class="text-2xl font-semibold text-gray-900 mb-6">
                                        지문 분야 선택 <span class="text-red-500">*</span>
                                    </h3>
                                    <div class="grid grid-cols-3 gap-8">
                                        <button v-for="pasType in pasTypes" :key="pasType"
                                            @click="singleForm.type_passage = pasType" :class="[
                                                'py-6 px-6 text-xl font-medium rounded-lg border-2 transition-all duration-200',
                                                singleForm.type_passage === pasType
                                                    ? 'bg-brand/20 border-brand text-brand'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:border-brand hover:text-brand'
                                            ]">
                                            {{ pasType }}
                                        </button>
                                    </div>
                                </div>

                                <!-- 지문 제재 입력 -->
                                <div>
                                    <h3 class="text-2xl font-semibold text-gray-900 mb-6">
                                        지문 제재 입력 <span class="text-red-500">*</span>
                                    </h3>
                                    <textarea v-model="singleForm.keyword"
                                        placeholder="50자 이내의 원하는 지문의 제재, 필수 포함 키워드를 작성해 주세요.&#10;(ex : 인공지능, 기계학습)"
                                        rows="8"
                                        class="w-full p-6 text-xl border-2 border-gray-300 rounded-lg resize-none focus:border-brand focus:outline-none transition-colors duration-200" />
                                </div>
                            </template>

                            <template #right>
                                <!-- 지문 구조 설계 (선택) -->
                                <div>
                                    <h3 class="text-2xl font-semibold text-gray-900 mb-6">
                                        지문 구조 설계 (선택)
                                    </h3>
                                    <div class="grid grid-cols-3 gap-8">
                                        <button v-for="structure in structures" :key="structure"
                                            @click="singleForm.type_structure = structure" :class="[
                                                'py-6 text-xl text-nowrap font-medium rounded-lg border-2 transition-all duration-200',
                                                singleForm.type_structure === structure
                                                    ? 'bg-brand/20 border-brand text-brand'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:border-brand hover:text-brand'
                                            ]">
                                            {{ structure }}
                                        </button>
                                    </div>
                                </div>

                                <!-- 추가 요청 사항 (선택) -->
                                <div>
                                    <h3 class="text-2xl font-semibold text-gray-900 mb-6">
                                        추가 요청 사항 (선택)
                                    </h3>
                                    <textarea v-model="singleForm.requirement" placeholder="지문 작성에 유의할 점이 있다면 작성해 주세요."
                                        rows="8"
                                        class="w-full p-6 text-xl border-2 border-gray-300 rounded-lg resize-none focus:border-brand focus:outline-none transition-colors duration-200" />
                                </div>
                            </template>
                        </PassageGenerationFormSplitLayout>

                        <PassageGenerationFormSplitLayout v-if="activeTab === 'multiple'">
                            <template #left>
                                <h2 class="text-2xl font-bold text-gray-900">(가) 지문</h2>

                                <div>
                                    <h3 class="text-2xl font-semibold text-gray-900 mb-6">
                                        분야 선택 <span class="text-red-500">*</span>
                                    </h3>
                                    <div class="grid grid-cols-5 gap-3">
                                        <button v-for="pasType in pasTypes" :key="'first-' + pasType"
                                            @click="multipleForm.first_type_passage = pasType" :class="[
                                                'py-3 px-4 text-xl font-medium rounded-lg border-2 transition-all duration-200',
                                                multipleForm.first_type_passage === pasType
                                                    ? 'bg-brand/20 border-brand text-brand'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:border-brand hover:text-brand'
                                            ]">
                                            {{ pasType }}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 class="text-2xl font-semibold text-gray-900 mb-6">
                                        제재 입력 <span class="text-red-500">*</span>
                                    </h3>
                                    <textarea v-model="multipleForm.first_keyword"
                                        placeholder="20자 이내의 원하는 지문의 제재, 필수 포함 키워드를 작성해 주세요. (ex : 인공지능, 기계학습)" rows="3"
                                        class="w-full p-4 text-xl border-2 border-gray-300 rounded-lg resize-none focus:border-brand focus:outline-none transition-colors duration-200" />
                                </div>

                                <div>
                                    <h3 class="text-2xl font-semibold text-gray-900 mb-6">
                                        추가 요청 사항 (선택)
                                    </h3>
                                    <textarea v-model="multipleForm.first_requirement"
                                        placeholder="지문 작성에 유의할 점이 있다면 작성해 주세요." rows="5"
                                        class="w-full p-4 text-xl border-2 border-gray-300 rounded-lg resize-none focus:border-brand focus:outline-none transition-colors duration-200" />
                                </div>
                            </template>

                            <template #right>
                                <h2 class="text-2xl font-bold text-gray-900">(나) 지문</h2>

                                <div>
                                    <h3 class="text-2xl font-semibold text-gray-900 mb-6">
                                        분야 선택 <span class="text-red-500">*</span>
                                    </h3>
                                    <div class="grid grid-cols-5 gap-3">
                                        <button v-for="pasType in pasTypes" :key="'second-' + pasType"
                                            @click="multipleForm.second_type_passage = pasType" :class="[
                                                'py-3 px-4 text-xl font-medium rounded-lg border-2 transition-all duration-200',
                                                multipleForm.second_type_passage === pasType
                                                    ? 'bg-brand/20 border-brand text-brand'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:border-brand hover:text-brand'
                                            ]">
                                            {{ pasType }}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 class="text-2xl font-semibold text-gray-900 mb-6">
                                        제재 입력 <span class="text-red-500">*</span>
                                    </h3>
                                    <textarea v-model="multipleForm.second_keyword"
                                        placeholder="20자 이내의 원하는 지문의 제재, 필수 포함 키워드를 작성해 주세요. (ex : 인공지능, 기계학습)" rows="3"
                                        class="w-full p-4 text-xl border-2 border-gray-300 rounded-lg resize-none focus:border-brand focus:outline-none transition-colors duration-200" />
                                </div>

                                <div>
                                    <h3 class="text-2xl font-semibold text-gray-900 mb-6">
                                        추가 요청 사항 (선택)
                                    </h3>
                                    <textarea v-model="multipleForm.second_requirement"
                                        placeholder="지문 작성에 유의할 점이 있다면 작성해 주세요." rows="5"
                                        class="w-full p-4 text-xl border-2 border-gray-300 rounded-lg resize-none focus:border-brand focus:outline-none transition-colors duration-200" />
                                </div>
                            </template>
                        </PassageGenerationFormSplitLayout>

                        <PassageGenerationFormSplitLayout v-if="activeTab === 'reading'">
                            <template #left>
                                <!-- 지문 제재 입력 -->
                                <div>
                                    <h3 class="text-2xl font-semibold text-gray-900 mb-6">
                                        지문 제재 입력 <span class="text-red-500">*</span>
                                    </h3>
                                    <textarea v-model="readingForm.keyword"
                                        placeholder="20자 이내의 원하는 지문의 제재, 필수 포함 키워드를 작성해 주세요. (ex : 인공지능, 기계학습)" rows="7"
                                        class="w-full p-6 text-xl border-2 border-gray-300 rounded-lg resize-none focus:border-brand focus:outline-none transition-colors duration-200" />
                                </div>

                                <!-- 추가 요청 사항 -->
                                <div>
                                    <h3 class="text-2xl font-semibold text-gray-900 mb-6">
                                        추가 요청 사항 (선택)
                                    </h3>
                                    <textarea v-model="readingForm.requirement" placeholder="지문 작성에 유의할 점이 있다면 작성해 주세요."
                                        rows="7"
                                        class="w-full p-6 text-xl border-2 border-gray-300 rounded-lg resize-none focus:border-brand focus:outline-none transition-colors duration-200" />
                                </div>
                            </template>

                            <template #right>
                            </template>
                        </PassageGenerationFormSplitLayout>
                    </div>

                </div>

                <!-- 에러 메시지 -->
                <div v-if="errorMessage" class="flex justify-center mt-6">
                    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md w-full">
                        <div class="flex">
                            <svg class="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clip-rule="evenodd"></path>
                            </svg>
                            <span>{{ errorMessage }}</span>
                        </div>
                    </div>
                </div>

                <!-- 하단 버튼 -->
                <div class="flex justify-end space-x-4 mt-12">
                    <button @click="openPaymentUsageModal" :disabled="isLoading" :class="[
                        'px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200',
                        isLoading
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-brand text-white hover:bg-blue-600'
                    ]">
                        <!-- 로딩 스피너 -->
                        <div v-if="isLoading" class="flex items-center">
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600"
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            <span v-if="loadingStep === 'generating'">지문 생성 중...</span>
                            <span v-else-if="loadingStep === 'saving'">지문 저장 중...</span>
                            <span v-else>처리 중...</span>
                        </div>
                        <span v-else>지문 생성하기</span>
                    </button>
                    <button @click="resetForm" :disabled="isLoading" :class="[
                        'px-8 py-4 text-lg font-medium rounded-lg transition-colors duration-200',
                        isLoading
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
                    ]">
                        초기화
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- 로딩 모달 -->
    <LoadingModal :isOpen="isLoading" :message="loadingMessage" />

    <PaymentUsageModal ref="paymentUsageModalRef" :isOpen="isPaymentUsageModalOpen" @close="closePaymentUsageModal"
        @generate="generatePassage" />
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import PassageGenerationFormSplitLayout from '@/views/generation/PassageGenerationFormSplitLayout.vue'
import BaseTooltip from '@/components/common/BaseTooltip.vue'
import { generateSinglePassageAPI, generateReadingPassageAPI, generateMultiplePassageAPI } from '@/api/generate'
import { savePassageToDatabase } from '@/api/passage'
import { usePassage } from '@/composables/usePassage'
import EditableTitle from '@/views/generation/EditableTitle.vue'
import PaymentUsageModal from "@/components/generation/PaymentUsageModal.vue";
import LoadingModal from '@/components/common/LoadingModal.vue'

// Router 및 Composable 설정
const router = useRouter()
const { cacheGeneratedPassage } = usePassage()

// 로딩 및 에러 상태
const isLoading = ref(false)
const loadingStep = ref('') // 'generating' | 'saving' | ''
const errorMessage = ref('')
// 문서 제목
const newPassageTitle = ref('Untitled')
const isPaymentUsageModalOpen = ref(false); // 결제 사용 모달 
const paymentUsageModalRef = ref(null);
const loadingMessage = ref('');

// 탭 데이터
const tabs = [
    { key: 'single', label: '단일 지문', tooltip: true, tooltipContent: '하나의 주제와 분야로 출제되는 지문 유형입니다.' },
    { key: 'multiple', label: '복합 지문', tooltip: true, tooltipContent: '서로 다른 주제나 분야의 지문 두 개가 조합되어 하나의 세트로 출제되는 지문 유형입니다.' },
    { key: 'reading', label: '독서 지문', tooltip: true, tooltipContent: '독서의 방법론이나 독서 과정, 독서에 대한 이론 등을 다루는 지문 유형입니다.' }
]

// 현재 활성 탭
const activeTab = ref('single')

// 카테고리 데이터
const pasTypes = ['인문', '사회', '과학', '기술', '예술']

// 지문 구조 데이터
const structures = ['설명과 분석', '비교와 대조', '문제와 해결', '흐름과 과정', 'AI 추천 설정']

// 폼 데이터
const singleForm = reactive({
    type_passage: '',
    keyword: '',
    type_structure: '',
    requirement: ''
})

const multipleForm = reactive({
    first_type_passage: '',
    first_keyword: '',
    first_requirement: '',
    second_type_passage: '',
    second_keyword: '',
    second_requirement: ''
})

const readingForm = reactive({
    keyword: '',
    requirement: ''
})

// 현재 분석 정보
const currentAnalysis = computed(() => {
    if (activeTab.value === 'single') {
        return {
            type: singleForm.type_passage,
            subject: singleForm.keyword,
            corePoint: '-'
        }
    } else if (activeTab.value === 'multiple') {
        const subjects = []
        if (multipleForm.first_keyword) subjects.push(multipleForm.first_keyword)
        if (multipleForm.second_keyword) subjects.push(multipleForm.second_keyword)

        return {
            type: multipleForm.first_type_passage || multipleForm.second_type_passage,
            subject: subjects.join(', '),
            corePoint: '-'
        }
    } else {
        return {
            type: '독서',
            subject: readingForm.keyword,
            corePoint: '-'
        }
    }
})

// 폼 초기화
const resetForm = () => {
    if (activeTab.value === 'single') {
        Object.assign(singleForm, {
            type_passage: '',
            keyword: '',
            type_structure: '',
            requirement: ''
        })
    } else if (activeTab.value === 'multiple') {
        Object.assign(multipleForm, {
            first_type_passage: '',
            first_keyword: '',
            first_requirement: '',
            second_type_passage: '',
            second_keyword: '',
            second_requirement: ''
        })
    } else {
        Object.assign(readingForm, {
            keyword: '',
            requirement: ''
        })
    }
}

// 데이터 변환 함수들

// 제목 생성 함수
const generateTitle = (generateType, requestData) => {
    if (newPassageTitle.value !== "Untitled") {
        return newPassageTitle.value;
    }

    const now = new Date()
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`

    if (generateType === 'single') {
        return `[단일 지문] ${requestData.keyword.slice(0, 10)} (${dateStr})`
    } else if (generateType === 'multiple') {
        return `[복합 지문] ${requestData.first_type_passage} & ${requestData.second_type_passage} (${dateStr})`
    } else if (generateType === 'reading') {
        return `[독서론 지문] ${requestData.keyword.slice(0, 10)} (${dateStr})`
    }
    return newPassageTitle.value;
}

// DescriptionDto 구조에 맞춰 생성
const createDescriptions = (apiResponse, requestData, generateType) => {
    if (generateType === 'single') {
        return [{
            pasType: requestData.type_passage,
            keyword: requestData.keyword,
            gist: apiResponse.generated_core_point[0],
            order: 1
        }]
    } else if (generateType === 'multiple') {
        return [
            {
                pasType: requestData.first_type_passage,
                keyword: requestData.first_keyword,
                gist: apiResponse.generated_core_point[0],
                order: 1
            },
            {
                pasType: requestData.second_type_passage,
                keyword: requestData.second_keyword,
                gist: apiResponse.generated_core_point[1],
                order: 2
            }
        ]
    } else if (generateType === 'reading') {
        return [{
            pasType: '독서론',
            keyword: requestData.keyword,
            gist: apiResponse.generated_core_point[0],
            order: 1
        }]
    }
}

const transformApiResponseToDbFormat = (apiResponse, requestData, generateType) => {
    return {
        title: generateTitle(generateType, requestData),
        content: convertNewlinesToParagraphs(apiResponse.generated_passage),
        isGenerated: 1,
        descriptions: createDescriptions(apiResponse, requestData, generateType)
    }
}

// fastApi 응답 데이터의 '\n' 형식을 Tiptap 형식에 맞게 수정하여 db 저장할 때 사용
const convertNewlinesToParagraphs = (text) => {
    if (!text) return ''
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<p>${line}</p>`)
        .join('')
}

// 지문 생성 요청 데이터 (request data)
const generatePassage = async () => {
    // 에러 및 로딩 상태 초기화
    errorMessage.value = ''
    if(isLoading.value){
        return;
    }
    isLoading.value = true

    try {
        let requestData = {}
        let generateType = ''
        let apiFunction = null

        // 1. 요청 데이터 구성
        if (activeTab.value === 'single') {
            generateType = 'single'
            requestData = {
                type_passage: singleForm.type_passage,
                keyword: singleForm.keyword
            }
            // Optional 필드들은 값이 있을 때만 추가
            if (singleForm.type_structure) {
                requestData.type_structure = singleForm.type_structure
            }
            if (singleForm.requirement && singleForm.requirement.trim()) {
                requestData.requirement = singleForm.requirement
            }
            apiFunction = generateSinglePassageAPI

        } else if (activeTab.value === 'multiple') {
            generateType = 'multiple'
            requestData = {
                first_type_passage: multipleForm.first_type_passage,
                first_keyword: multipleForm.first_keyword,
                second_type_passage: multipleForm.second_type_passage,
                second_keyword: multipleForm.second_keyword
            }
            // Optional 필드들은 값이 있을 때만 추가
            if (multipleForm.first_requirement && multipleForm.first_requirement.trim()) {
                requestData.first_requirement = multipleForm.first_requirement
            }
            if (multipleForm.second_requirement && multipleForm.second_requirement.trim()) {
                requestData.second_requirement = multipleForm.second_requirement
            }
            apiFunction = generateMultiplePassageAPI

        } else if (activeTab.value === 'reading') {
            generateType = 'reading'
            requestData = {
                type_passage: '독서론',
                keyword: readingForm.keyword
            }
            // Optional 필드들은 값이 있을 때만 추가
            if (readingForm.requirement && readingForm.requirement.trim()) {
                requestData.requirement = readingForm.requirement
            }
            apiFunction = generateReadingPassageAPI
        }

        console.log('🚀 지문 생성 시작:', { generateType, requestData })

        // 2. FastAPI 호출 (지문 생성)
        loadingStep.value = 'generating'
        const apiResponse = await apiFunction(requestData)
        console.log('✅ FastAPI 응답 성공:', apiResponse)

        // 3. 데이터 변환 (백엔드 저장 형식)
        const dbData = transformApiResponseToDbFormat(apiResponse, requestData, generateType)
        console.log('🔄 DB 저장용 데이터 변환:', dbData)

        // 4. 백엔드 DB 저장
        loadingStep.value = 'saving'
        const savedPassage = await savePassageToDatabase(dbData)
        console.log('✅ DB 저장 성공:', savedPassage)

        // 5. Simple Store 에 캐싱 (중복 API 호출 방지)
        cacheGeneratedPassage(savedPassage.pasCode, apiResponse, savedPassage)
        console.log('✅ Simple Store 캐싱 완료:', savedPassage.pasCode)

        // 6. 결과 페이지로 이동
        console.log('📫 결과 페이지로 이동:', `/passage/view/${savedPassage.pasCode}`)
        await router.push(`/passage/view/${savedPassage.pasCode}`)

    } catch (error) {
        console.error('❌ 지문 생성 실패:', error)

        // 에러 메시지 설정
        if (loadingStep.value === 'generating') {
            errorMessage.value = '지문 생성에 실패했습니다. 다시 시도해 주세요.'
        } else if (loadingStep.value === 'saving') {
            errorMessage.value = '지문 저장에 실패했습니다. 다시 시도해 주세요.'
        } else {
            errorMessage.value = '예기치 못한 오류가 발생했습니다.'
        }
    } finally {
        isLoading.value = false
        loadingStep.value = ''
    }
}

// payment 모달 관련 함수

// 결제 사용 모달 관련 함수
const openPaymentUsageModal = () => { isPaymentUsageModalOpen.value = true; };
const closePaymentUsageModal = () => { isPaymentUsageModalOpen.value = false; };
</script>

<style scoped>
.bg-brand {
    background-color: #0086FF;
}

.text-brand {
    color: #0086FF;
}

.border-brand {
    border-color: #0086FF;
}

.hover\:bg-blue-600:hover {
    background-color: #004499;
}

.hover\:border-brand:hover {
    border-color: #0086FF;
}

.hover\:text-brand:hover {
    color: #0086FF;
}

.focus\:border-brand:focus {
    border-color: #0086FF;
}
</style>