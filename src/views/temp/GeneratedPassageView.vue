<template>
    <div class="flex flex-col gap-8 p-0 md:p-8 box-border w-full">
        <PassageAndQuestionLayout :left-ratio="2" :right-ratio="1" >
            <template #title>
                {{ passageTitle }}
            </template>
            <template #left>
                {{ generatedPassage }}
                <!-- TipTapEditor (1) savedContent 값을 props 로 자식 컴포넌트의 initialContent 변수로 전달 -->
                <!-- TipTapEditor (2) 자식 컴포넌트에서 emit 으로 부모 컴포넌트에 전달, 자식이 emit 한 데이터를 받는 함수 handleContentChange -->
                <PassageEditor :max-length=numberLength :initialContent="savedContent" @content-changed="handleContentChange"/>
            </template>
            <template #right>
                <!-- 지문 분석 (Pinia Store에서 자동으로 데이터 가져옴) -->
                <PassageSummaryLayout />
            </template>
        </PassageAndQuestionLayout>
    </div>
</template>

<script setup>
import PassageAndQuestionLayout from './PassageAndQuestionLayout.vue'
import PassageSummaryLayout from './PassageSummaryLayout.vue'
import PassageEditor from './PassageEditor.vue'
import { usePassageStore } from '@/stores/passage'
import { computed, ref } from 'vue'

// TipTapEditor (1) GeneratedPassageView 진입시 보여줄 지문 데이터를 TipTapEditor 에 전달하기 위한 변수
const savedContent = ref('<p>서버에서 <span class="boxed">가져온</span> 기존 내용</p>')
const currentLength = ref(0)

// TipTapEditor (2) TipTapEditor 에서 가져온 데이터
const handleContentChange = ({ content, textLength }) => {
  console.log('Content:', content)
  console.log('Length:', textLength)

  savedContent.value = content
  currentLength.value = textLength
}

// Pinia store 사용
const passageStore = usePassageStore()

// Store에서 데이터 가져오기
const generatedPassage = computed(() => passageStore.responseData?.pas_content || '생성된 지문이 여기에 표시됩니다.')
const passageTitle = computed(() => {
  if (passageStore.passageType === 'single') return '단일 지문'
  else if (passageStore.passageType === 'multiple') return '복합 지문'
  else if (passageStore.passageType === 'reading') return '독서 지문'
  return 'Untitled'
})

// 사용 예시를 위한 임시 데이터 (DB 구조 기반)
const sampleData = {
  single: {
    requestData: {
      type_passage: '인문',
      keyword: '인공지능, 머신러닝, 딥러닝'
    },
    responseData: {
      pas_title: '단일 지문 예시',
      pas_content: '이곳에 생성된 지문 내용이 들어갑니다. 인공지능과 딥러닝에 대한 다양한 내용이 포함되어 있습니다. 현대 사회에서 인공지능 기술의 발전은 우리의 삶을 크게 변화시키고 있습니다.',
      description: [
        {
          type_passage: '인문',
          core_point: '첫 번째 핵심 논점 내용입니다. 인공지능의 철학적 의미와 인간의 사고에 미치는 영향에 대해 다룹니다.'
        }
      ]
    }
  },
  multiple: {
    requestData: {
      first_type_passage: '과학',
      first_keyword: '기계학습',
      second_type_passage: '기술',
      second_keyword: '신경망'
    },
    responseData: {
      pas_title: '복합 지문 예시',
      pas_content: '(가) 기계학습의 원리는 데이터로부터 패턴을 학습하여 예측 모델을 구축하는 것이다...\n\n(나) 신경망은 인간의 뇌 구조를 모방한 계산 모델로서...',
      description: [
        {
          type_passage: '과학',
          core_point: '(가) 지문 핵심 논점: 기계학습의 수학적 원리와 알고리즘에 대한 내용입니다.'
        },
        {
          type_passage: '기술',
          core_point: '(나) 지문 핵심 논점: 신경망 기술의 실제 응용과 미래 발전 방향에 대한 내용입니다.'
        }
      ]
    }
  }
}

// Store에 샘플 데이터 설정 (테스트용 - 실제로는 PassageGenerationForm에서 설정)
if (!passageStore.responseData) {
  // 단일 지문 예시 (기본값)
  passageStore.setRequestData(sampleData.single.requestData, 'single')
  passageStore.setResponseData(sampleData.single.responseData)
  
  // 복합 지문 테스트를 원한다면 아래 주석을 해제하세요
  
  passageStore.setRequestData(sampleData.multiple.requestData, 'multiple')
  passageStore.setResponseData(sampleData.multiple.responseData)
  
}
</script>

<style scoped>
    
</style>
