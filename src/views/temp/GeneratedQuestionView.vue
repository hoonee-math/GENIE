<template>
    <!-- isCalledFromGeneratedQuestionView 값으로 하는 일
     1. GeneratedPassageView에서 pinia store를 업데이트하는 fetch 요청에 문항을 포함할지 결정함
     2. PassageEditor 에서 사용하는 parentComponent 값을 GeneratedQuestionView로 인식하게함
     3. PassageEditor 에서 TipTap 에디터 영역을 수정가능하게 만들어줌 -->
    <GeneratedPassageView :isCalledFromGeneratedQuestionView="true" @title-changed="handlePassageTitleChange" @content-changed="handlePassageContentChange">
        <template #questions>
                <PassageAndQuestionLayout>
                    <template #pagination v-if="questions.length>1">
                        <div class="flex items-center gap-2 mt-4">
                            <button @click="prevPageBlock" :disabled="currentPageBlockStart === 1">이전</button>

                            <button v-for="page in currentPageBlockEnd - currentPageBlockStart + 1"
                                    :key="page"
                                    @click="goToPage(currentPageBlockStart + page - 1)"
                                    :class="['w-12 px-3 py-1 border rounded', currentPage === currentPageBlockStart + page - 1 ? 'bg-blue-500 text-white' : 'bg-white text-black']">
                            {{ currentPageBlockStart + page - 1 }}
                            </button>

                            <button @click="nextPageBlock" :disabled="currentPageBlockEnd === totalPages">다음</button>
                        </div>


                    </template>
                    <template #left>
                        <!-- question.queQuery 생성된 문제문 -->
                        <div class="flex">
                            <div class="flex font-semibold text-sm md:text-2xl mr-5">
                                <span>Q.</span>
                                <TipTapEditor :initialContent="question.queQuery" :isEditable="editableQueryAndOption" @content-changed="handleQueQueryChange" :addClass="'text-2xl'"/>
                            </div>
                            <!-- 수정 버튼을 누르면 #left 영역의 question.queQuery 값과 아래 question.queOption 값을 각각 수정할 수 있게 변경. 각각 TipTap Editor로 따로 구현하거나 더 나은방법 고려해보기. -->
                            <button @click="editQueQueryAndOption" class="flex flex-row justify-center items-center text-sm md:text-xl pl-2 py-3 w-[86px] h-[35px] left-[1485px] top-[50px] bg-[#CCCCCC] rounded-lg">
                                수정
                                <Icon icon="mingcute:pencil-fill" width="20" height="20" class="mx-1" :class=" false ? 'text-[#0086FF]' : 'text-[#303030]'" />
                            </button>
                        </div>
                        <!-- question.queOption 은 div 대신 TipTap editor를 이용해 출력해주기. 기본값 editable=false, question.queQuery 옆의 수정 버튼을 눌러 question.queOption의 editable 갑도 true로 변경-->
                        <div>
                            <!-- 현재 question.queOption는 배열 형식인데 String 으로 수정 예정, 임시로 배열을 String으로 바꿔서 TipTap 에디터에 넣어주기. -->
                            <TipTapEditor :initialContent="question.queOption" :isEditable="editableQueryAndOption" @content-changed="handleQueOptionChange" :addClass="'text-xl leading-10'"/>
                        </div>
                    </template>
                    <template #right>
                        
                        <div class="box-border flex flex-col flex-1 items-start px-4 py-4 gap-4 w-full bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-y-auto scrollbar-hide">
                            <div class="flex flex-row items-center w-full gap-4">
                                <p class="font-bold text-sm md:text-2xl leading-[150%] tracking-[-0.02em] text-[#303030]">
                                    정답
                                </p>
                                <!-- question.queAnswer 값은 editQueAnswer 값에 따라서 저장된 값을 출력하거나, 라디오 버튼으로 수정가능하게 변경 -->
                                <p v-if="!editableAnswerAndDesc" class="font-normal text-xl md:text-3xl leading-[150%] tracking-[-0.02em] text-[#303030] break-words flex-1">
                                    {{ question.queAnswer }}
                                </p>

                                <!-- 라디오 버튼 그룹 -->
                                <div v-if="editableAnswerAndDesc" class="flex flex-1 gap-1">
                                    <button v-for="option in ['①','②','③','④','⑤']" :key="option" @click="selectQueAnswerOption(option)"
                                        :class="[ 'text-xl md:text-3xl font-light transition-colors mx-2 hover:scale-[1.1]',
                                        queAnswer === option ? 'font-bold text-brand' : '']"
                                        >
                                        {{ option }}
                                    </button>
                                </div>


                                <!-- 수정 버튼을 누르면 #right 영역의 question.queAnswer 값과 아래 question.description 값을 각각 수정할 수 있게 변경. -->
                                <button @click="editQueAnswerAndDesc" class="flex flex-row justify-center items-center text-sm md:text-xl pl-2 py-3 w-[86px] h-[35px] left-[1485px] top-[50px] bg-[#CCCCCC] rounded-lg">
                                    {{ editableAnswerAndDesc ? '완료' : '수정' }}
                                    <Icon icon="mingcute:pencil-fill" width="20" height="20" class="mx-1" :class=" false ? 'text-[#0086FF]' : 'text-[#303030]'" />
                                </button>
                            </div>
                            <div class="flex flex-col items-start gap-4 w-full flex-1">
                                <p class="font-bold text-sm md:text-2xl leading-[150%] tracking-[-0.02em] text-[#303030] min-w-[80px] shrink-0">
                                    해설
                                </p>
                                <!-- 해설 데이터인 question.description 는 div 대신 TipTap 에디터를 이용해서 출력 -->
                                <div class="w-full font-normal text-sm md:text-xl leading-[200%] tracking-[-0.02em] text-[#303030] flex-1 overflow-auto">
                                    <TipTapEditor :initialContent="question.description" :isEditable="editableAnswerAndDesc" @content-changed="handelQueDescriptionChange" :addClass="'text-xl'" />
                                </div>
                            </div>
                            
                        </div>
                    </template>
                    
                </PassageAndQuestionLayout>
            <div v-if="!isQuestionExampleSelectorVisible" class="flex flex-col justify-between sm:flex-row gap-4 mt-8">
                <div class="flex gap-5">
                    <button @click="" :disabled="false" :class="['px-12 py-4 text-2xl font-medium rounded-lg transition-colors duration-200', isSaved ? 'text-gray-700 bg-gray-200 hover:bg-gray-300 cursor-not-allowed':'bg-brand text-white hover:bg-blue-600']">
                        저장하기
                    </button>
                    <button @click="" :disabled="false" :class="['px-12 py-4 text-2xl font-medium rounded-lg transition-colors duration-200', isSaved ? 'bg-brand text-white hover:bg-blue-600':'text-gray-400 bg-gray-100 cursor-not-allowed']">
                        추출하기
                    </button>
                </div>
                <!-- 여기는 문항 추가하기지만 우선 문항 유형 선택하기가 먼저 출력된 후 다시 문한 추가하기 버튼을 눌러줘야함. -->
                <button @click="showQuestionExampleSelector" :class="['px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200 bg-brand text-white hover:bg-blue-600']">
                    문항 추가하기
                </button>
            </div>
            
            <QuestionExampleSelector v-if="isQuestionExampleSelectorVisible" :generateType="generateType" @selectedQuestionExample="handleQuestionSelected"/>

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
                <button @click="openPaymentUsageModal" :disabled="isLoading"
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
        </template>
    </GeneratedPassageView>

    <!-- 문항 생성 확인 모달 -->
    <ConfirmModalComponent :isOpen="isConfirmModalOpen" title="글자 수를 확인해 주세요."
        message="500자 이하의 지문으로 정상적인 문항을 생성하기 어렵습니다. 충분한 지문을 입력해 주세요." @close="isConfirmModalOpen = false"
        @confirm="isConfirmModalOpen = false" />


    <!-- 로딩 모달 -->
    <LoadingModal :isOpen="isLoading" :message="loadingMessage" />

    <PaymentUsageModal
        ref="paymentUsageModalRef"
        :isOpen="isPaymentUsageModalOpen"
        @close="closePaymentUsageModal"
        @generate="handleGenerate"
    />
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import GeneratedPassageView from './GeneratedPassageView.vue'
import PassageAndQuestionLayout from './PassageAndQuestionLayout.vue'
import { useQuestion } from '@/composables/useQuestion'
import { usePassage } from '@/composables/usePassage';
import TipTapEditor from './TipTapEditor.vue'
import QuestionExampleSelector from './QuestionExampleSelector.vue'
import PaymentUsageModal from "@/components/generation/PaymentUsageModal.vue";

// Router 및 Composables
const router = useRouter()
const { addQuestionToExistingPassage } = useQuestion()
const { passage, corePointTabs } = usePassage()

const isLoading = ref(false)
const isSaved = ref(true)
const editableQueryAndOption = ref(false)
const editableAnswerAndDesc = ref(false)
const isQuestionExampleSelectorVisible = ref(false)
const isPaymentUsageModalOpen = ref(false); // 결제 사용 모달 
const paymentUsageModalRef = ref(null);

// queAnswer 값은 각 question 값에 딸라 초기값이 달라짐. 나중에 구현할 하단 문항을 페이지네이션 처리하게되면 각 question 에 따라서 그 값이 달라지므로 수정 필요
const queAnswer = ref('①')

const questions = computed(() => {
    return passage.value.questions || []
})
const question = computed(() => {
    return questions.value[currentPage.value - 1] || {}
})

const editQueQueryAndOption = () => {
    editableQueryAndOption.value = !editableQueryAndOption.value;
}

const editQueAnswerAndDesc = () => {
    editableAnswerAndDesc.value = !editableAnswerAndDesc.value;
}

// 페이징 처리 관련 함수
const currentPage = ref(1)
const itemsPerPage = 1

const totalPages = computed(() => Math.ceil(21 / itemsPerPage))

// 🔢 페이지 블록 범위 계산
const pageBlockSize = 5
const currentPageBlockStart = computed(() => Math.floor((currentPage.value - 1) / pageBlockSize) * pageBlockSize + 1)
const currentPageBlockEnd = computed(() => Math.min(currentPageBlockStart.value + pageBlockSize - 1, totalPages.value))

const paginatedQuestion = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    return questions.value.slice(start, start + itemsPerPage)
})

const goToPage = (page) => {
    currentPage.value = page
}

const nextPageBlock = () => {
    const next = currentPageBlockEnd.value + 1
    if (next <= totalPages.value) currentPage.value = next
}

const prevPageBlock = () => {
    const prev = currentPageBlockStart.value - pageBlockSize
    if (prev >= 1) currentPage.value = prev
}

// 라디오 버튼 선택 함수 추가
const selectQueAnswerOption = (option) => {
    queAnswer.value = option
    // 이건 저장하기 버튼 활성화를 어떻게 할지 고민 필요
}

// #GeneratedPassageView 영역 content, title 관련 변수
const savedPassageTitle = ref('')
const savedPassageContent = ref('')
const isPassageModified = ref(false)

// GeneratedPassageView에서 오는 title 변경 이벤트 핸들러
const handlePassageTitleChange = (newTitle) => {
    console.log('Passage title changed:', newTitle)
    savedPassageTitle.value = newTitle
    isPassageModified.value = true
    isSaved.value = false // 저장하기 버튼 활성화
}

// GeneratedPassageView에서 오는 content 변경 이벤트 핸들러  
const handlePassageContentChange = ({ content, textLength }) => {
    console.log('Passage content changed:', content, 'Length:', textLength)
    savedPassageContent.value = content
    isPassageModified.value = true
    isSaved.value = false // 저장하기 버튼 활성화
}

// #Left 영역 TipTapEditor 관련 변수
const savedQueQuery = ref('')
const savedQueOption = ref('')
const savedDescription = ref('')
const queQueryLength = ref(0)
const queOptionLength = ref(0)
const queDescriptionLength = ref(0)
const numberLength = ref(3000)

// TipTapEditor 콘텐츠 변경 핸들러
const handleQueQueryChange = ({ content, textLength }) => {
  console.log('Content:', content)
  console.log('Length:', textLength)
  savedQueQuery.value = content
  queQueryLength.value = textLength
    isSaved.value = false // 저장하기 버튼 활성화
}
const handleQueOptionChange = ({ content, textLength }) => {
  console.log('Content:', content)
  console.log('Length:', textLength)
  savedQueOption.value = content
  queOptionLength.value = textLength
    isSaved.value = false // 저장하기 버튼 활성화
}
const handelQueDescriptionChange = ({ content, textLength }) => {
  console.log('Content:', content)
  console.log('Length:', textLength)
  savedDescription.value = content
  queDescriptionLength.value = textLength
    isSaved.value = false // 저장하기 버튼 활성화
}


// 문항 유형 선택하기
const selectedQuestionExample = ref(null)
const handleQuestionSelected = (questionExample) => {
    selectedQuestionExample.value = questionExample
    // console.log('받은 문항 데이터:', questionExample);
}
const showQuestionExampleSelector = () => {
    // 버튼을 클릭하는 시점에 generateType 계산
    generateType.value = calculateGenerateType()
    console.log("✅ 계산된 generateType:", generateType.value)
    isQuestionExampleSelectorVisible.value = true
}
// computed 대신 ref로 변경
const generateType = ref('단일 지문')

// 또는 계산 함수로 분리
const calculateGenerateType = () => {
    if (!passage.value?.descriptions?.length) {
        return '단일 지문'
    }
    
    const descriptions = passage.value.descriptions
    if (descriptions.length === 1 && descriptions[0]?.pasType === '독서론') {
        return '독서론'
    } else if (descriptions.length === 1) {
        return '단일 지문'
    } else if (descriptions.length > 1) {
        return '복합 지문'
    }
    return '단일 지문'
}

// 문항 추가 함수
const addQuestion = async () => {
    // (custom_passage, selectedQuestionExample, generateType, pasCode) 
    await addQuestionToExistingPassage(savedPassageContent.value, '','',passage.value.pasCode)
}

// 저장하기 함수
const savePassageAndQuestion = async () => {
    // 수정된 지문 데이터와 현재 문항 데이터를 함께 전달
    const passageData = {
        title: savedPassageTitle.value || passage.value.title,
        content: savedPassageContent.value || passage.value.content
    }
    
    const questionData = {
        queQuery: savedQueQuery.value,
        queOption: savedQueOption.value, 
        queAnswer: queAnswer.value,
        description: savedDescription.value
    }
    // 현재 미구현 상태
    // await updateQuestion()
}

// payment 모달 관련 함수

// 결제 사용 모달 관련 함수
const openPaymentUsageModal = () => {
    
    isPaymentUsageModalOpen.value = true;
    if (checkContentLength(new Event("click"))) {
        // 저장된 지문 데이터를 로컬 스토리지에 임시 저장
        const passageData = {
            // title: title.value,
            // content: content.value,
            // summary: summary.value,
            // pasCode: pasCode.value,
            // type: type.value,
            // keyword: keyword.value,
        };
        // localStorage.setItem(
        //     "generateQuestionPassageData",
        //     JSON.stringify(passageData)
        // );

        // 모달 열기 전에 이용권 정보 갱신
        if (
            paymentUsageModalRef.value &&
            paymentUsageModalRef.value.updateCreditCount
        ) {
            authStore.updateTicketCount().then((count) => {
                paymentUsageModalRef.value.updateCreditCount(count);

                // 갱신 후 모달 열기
                isPaymentUsageModalOpen.value = true;
            });
        } else {
            // ref나 초기화 메서드가 없어도 모달은 열어줌
            isPaymentUsageModalOpen.value = true;
        }
    }
};

const closePaymentUsageModal = () => {
    isPaymentUsageModalOpen.value = false;
};

const handleGenerate = () => {
    if (isProcessing.value) {
        return;
    }

    closePaymentUsageModal();
    // 재생성 처리 로직
    isProcessing.value = true;
    isLoading.value = true;
    loadingMessage.value =
        "지문을 재생성 중입니다.\n재생성까지 최대 3분이 소요될 수 있습니다.";

    // 로컬 스토리지에서 문자열로 데이터 가져오기
    const savedGenerateDataStr = localStorage.getItem("genieq-passage-data");

    if (!savedGenerateDataStr) {
        isLoading.value = false;
        return;
    }

    // 문자열을 객체로 파싱
    let savedGenerateData;
    try {
        savedGenerateData = JSON.parse(savedGenerateDataStr);
    } catch (error) {
        alert("지문 데이터 처리 중 오류가 발생했습니다.");
        isLoading.value = false;
        return;
    }

    const requestData = {
        type_passage: savedGenerateData.type,
        keyword: [savedGenerateData.keyword],
    };

    fetch("/fastapi/generate-passage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`API 호출 실패: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            savePassageToBackend(data);
            isContentChanged.value = false;
            hasManualSave.value = true;
        })
        .catch((error) => {
            isLoading.value = false;
            isProcessing.value = false;
        })
        .finally(() => {
            isLoading.value = false;
            isProcessing.value = false;
        });
};
const savePassageToBackend = (data) => {}

onMounted(() => {
    // generateType();
})
</script>