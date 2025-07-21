<template>
    <div class="flex flex-col p-0 md:p-8 gap-6 box-border w-full h-full">
        <!-- PassageAndQuestionLayout에 flex-1 삭제: 남은 공간 차지하되 축소 가능한 설정 제거 -->
        <div class="">  <!-- flex-1 min-h-0 overflow-hidden 제거 -->
            <PassageAndQuestionLayout :left-ratio="2" :right-ratio="1">
                <template #title>
                    {{ passageTitle }}
                </template>
                <template #left>
                    <!-- TipTapEditor (1) savedContent 값을 props 로 자식 컴포넌트의 initialContent 변수로 전달 -->
                    <!-- TipTapEditor (2) 자식 컴포넌트에서 emit 으로 부모 컴포넌트에 전달, 자식이 emit 한 데이터를 받는 함수 handleContentChange -->
                    <PassageEditor :max-length="numberLength" :initialContent="savedContent" :parentComponent="currentParentComponent" @content-changed="handleContentChange"/>
                </template>
                <template #right>
                    <!-- 지문 분석 (Pinia Store에서 자동으로 데이터 가져옴) -->
                    <PassageSummaryLayout />
                </template>
            </PassageAndQuestionLayout>
        </div>

        <!-- 재생성하기, 문항 이어서 생성하기, 저장하기, 추출하기 버튼 추가 예정 -->
         
        <!-- 하단 버튼 -->
        <div v-if="!isCalledFromGeneratedQuestionView" class="flex justify-end space-x-4 flex-shrink-0">
            <button @click="GenerateQuestionWithThisPassage" :disabled="isLoading" class="px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200 bg-brand text-white hover:bg-blue-600">
                이어서 문항 생성하기
            </button>
        </div>

        <!-- GeneratedQuestionView에서 사용할 슬롯 -->
        <slot name="questions"></slot>
    </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PassageAndQuestionLayout from './PassageAndQuestionLayout.vue'
import PassageSummaryLayout from './PassageSummaryLayout.vue'
import PassageEditor from './PassageEditor.vue'
import { usePassage } from '@/composables/usePassage'
import GenerateQuestion from '../generation/question/GenerateQuestion.vue'

const props = defineProps({
    isCalledFromGeneratedQuestionView: {
        type: Boolean,
        default: false
    }
})

// Router 및 Composable 설정
const route = useRoute()
const router = useRouter()
const { fetchPassage, passage, isLoading: passageLoading } = usePassage()

// 로딩 및 에러 상태
const isLoading = ref(true)
const errorMessage = ref('')
const goToQuestionGenerateForm = ref(false)

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
    if(props.isCalledFromGeneratedQuestionView) {
        await fetchPassage(pasCode, { includeQuestions: true })
    } else {
        await fetchPassage(pasCode)
    }
    
    // TipTap 에디터에 초기 콘텐츠 설정
    savedContent.value = passage.value.content || ''
    
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

// Computed 속성들 (usePassage에서 데이터 가져오기)
const passageTitle = computed(() => {
  if (isLoading.value) return '로딩 중...'
  if (errorMessage.value) return '오류'
  return passage.value.title || 'Untitled'
})

// PassageEditor 의 parentComponent 변수에 전달할 값(currentParentComponent) 설정 
const currentParentComponent = computed(() => {
    return props.isCalledFromGeneratedQuestionView ? 'GeneratedQuestionView' : 'GeneratedPassageView'
})

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadPassageData()
})

onBeforeUnmount(() => {
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
