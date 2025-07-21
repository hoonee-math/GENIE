<template>
    <!-- isCalledFromGeneratedQuestionView 값으로 하는 일
     1. GeneratedPassageView에서 pinia store를 업데이트하는 fetch 요청에 문항을 포함할지 결정함
     2. PassageEditor 에서 사용하는 parentComponent 값을 GeneratedQuestionView로 인식하게함
     3. PassageEditor 에서 TipTap 에디터 영역을 수정가능하게 만들어줌 -->
    <GeneratedPassageView :isCalledFromGeneratedQuestionView="true">
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
            <div class="flex flex-col justify-between sm:flex-row gap-4 mt-8">
                <div class="flex gap-5">
                    <button @click="" :disabled="false" :class="['px-12 py-4 text-2xl font-medium rounded-lg transition-colors duration-200', isSaved ? 'text-gray-700 bg-gray-200 hover:bg-gray-300 cursor-not-allowed':'bg-brand text-white hover:bg-blue-600']">
                        저장하기
                    </button>
                    <button @click="" :disabled="false" :class="['px-12 py-4 text-2xl font-medium rounded-lg transition-colors duration-200', isSaved ? 'bg-brand text-white hover:bg-blue-600':'text-gray-400 bg-gray-100 cursor-not-allowed']">
                        추출하기
                    </button>
                </div>
                <button @click="addQuestion" :class="['px-16 py-4 text-2xl font-medium rounded-lg transition-all duration-200 bg-brand text-white hover:bg-blue-600']">
                    문항 추가하기
                </button>
            </div>


        </template>
    </GeneratedPassageView>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import GeneratedPassageView from './GeneratedPassageView.vue'
import PassageAndQuestionLayout from './PassageAndQuestionLayout.vue'
import { useQuestion } from '@/composables/useQuestion'
import TipTapEditor from './TipTapEditor.vue'

// Router 및 Composables
const router = useRouter()
const { passage, addQuestionToExistingPassage } = useQuestion()

const isLoading = ref(false)
const isSaved = ref(true)
const editableQueryAndOption = ref(false)
const editableAnswerAndDesc = ref(false)

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
}
const handleQueOptionChange = ({ content, textLength }) => {
  console.log('Content:', content)
  console.log('Length:', textLength)
  savedQueOption.value = content
  queOptionLength.value = textLength
}
const handelQueDescriptionChange = ({ content, textLength }) => {
  console.log('Content:', content)
  console.log('Length:', textLength)
  savedDescription.value = content
  queDescriptionLength.value = textLength
}

// 문항 추가 함수
const addQuestion = async () => {
    await addQuestionToExistingPassage();
    
}
</script>