<template>
    <div class="flex flex-col gap-8 p-0 md:p-8 box-border w-full h-full">
        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
            <div class="flex flex-col items-center">
                <svg class="animate-spin h-12 w-12 text-brand mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-gray-600">지문 데이터를 불러오는 중...</p>
            </div>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="errorMessage" class="flex justify-center items-center min-h-[400px]">
            <div class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md w-full">
                <div class="flex">
                    <svg class="w-6 h-6 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                    </svg>
                    <div>
                        <h3 class="font-semibold">오류 발생</h3>
                        <p>{{ errorMessage }}</p>
                        <button @click="loadPassageData" class="mt-2 text-sm underline hover:no-underline">
                            다시 시도
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 정상 상태 -->
        <PassageAndQuestionLayout v-else :left-ratio="2" :right-ratio="1">
            <template #title>
                {{ passageTitle }}
            </template>
            <template #left>
                <!-- TipTapEditor (1) savedContent 값을 props 로 자식 컴포넌트의 initialContent 변수로 전달 -->
                <!-- TipTapEditor (2) 자식 컴포넌트에서 emit 으로 부모 컴포넌트에 전달, 자식이 emit 한 데이터를 받는 함수 handleContentChange -->
                <PassageEditor :max-length="numberLength" :initialContent="savedContent" :parentComponent="'GeneratedPassageView'" @content-changed="handleContentChange"/>
            </template>
            <template #right>
                <!-- 지문 분석 (Pinia Store에서 자동으로 데이터 가져옴) -->
                <PassageSummaryLayout />
            </template>
        </PassageAndQuestionLayout>

        <div>qjxms</div>

        <!-- 재생성하기, 문항 이어서 생성하기, 저장하기, 추출하기 버튼 추가 예정 -->
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PassageAndQuestionLayout from './PassageAndQuestionLayout.vue'
import PassageSummaryLayout from './PassageSummaryLayout.vue'
import PassageEditor from './PassageEditor.vue'
import { usePassage } from '@/composables/usePassage'

// Router 및 Composable 설정
const route = useRoute()
const { fetchPassage, passage, isLoading: passageLoading } = usePassage()

// 로딩 및 에러 상태
const isLoading = ref(true)
const errorMessage = ref('')

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
    await fetchPassage(pasCode)
    
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

// Computed 속성들 (usePassage에서 데이터 가져오기)
const passageTitle = computed(() => {
  if (isLoading.value) return '로딩 중...'
  if (errorMessage.value) return '오류'
  return passage.value.title || 'Untitled'
})

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadPassageData()
})
</script>

<style scoped>
.text-brand {
  color: #0086FF;
}
</style>
