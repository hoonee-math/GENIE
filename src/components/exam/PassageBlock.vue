<template>
  <div
    class="passage-block bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200">
    <!-- 지문 헤더 -->
    <div class="flex items-center p-4 bg-white border-b border-slate-200">
      <!-- 체크박스 모드 -->
      <template v-if="showCheckbox">
        <input 
          type="checkbox" 
          :checked="isChecked"
          :indeterminate="isIndeterminate"
          @change="handlePassageCheckboxChange"
          ref="passageCheckboxRef"
          class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-4"
        />
      </template>
      
      <!-- 기본 모드 (드래그 핸들 + 번호) -->
      <template v-else>
        <div class="passage-drag-handle cursor-grab text-slate-400 hover:text-slate-600 mr-4">
          <Icon icon="heroicons-solid:menu-alt-4" class="w-6 h-6" />
        </div>
        <div class="flex-grow flex items-center">
          <span class="passage-number text-xl font-bold text-blue-600 mr-4">{{ index + 1 }}</span>
        </div>
      </template>
      
      <!-- 공통 헤더 콘텐츠 -->
      <div class="flex-grow flex items-center" :class="showCheckbox ? '' : 'ml-0'">
        <h2 class="text-lg font-semibold truncate w-[230px] text-slate-800" 
          :class="showCheckbox ? 'ml-0' : ''">{{ passage.title }}</h2>
        <span class="ml-auto text-xs text-nowrap font-semibold px-2.5 py-0.5 rounded-full"
          :class="getPassageTypeClass(passage.type)">
          {{ passage.type }}
        </span>
      </div>
      <button @click="toggleExpanded" class="toggle-button ml-1 text-slate-500 hover:text-slate-800">
        <Icon icon="heroicons:chevron-down" class="w-6 h-6 transition-transform"
          :class="{ 'rotate-180': passage.isExpanded }" />
      </button>
    </div>

    <!-- 문제 리스트 -->
    <Transition name="expand" appear>
      <div v-show="passage.isExpanded">
        <div class="questions-list bg-slate-50/50 p-2 sm:p-4 space-y-2">
          <TransitionGroup name="question" tag="div" class="space-y-2">
            <QuestionItem v-for="(question, qIndex) in passage.questions" 
              :key="question.id" 
              :question="question"
              :index="qIndex" 
              :showCheckbox="showCheckbox"
              :isChecked="selectedQuestions.includes(question.id)"
              @delete="$emit('deleteQuestion', question.id)"
              @update="$emit('updateQuestion', question.id, $event)"
              @checkboxChange="handleQuestionCheckboxChange" />
          </TransitionGroup>

          <!-- 문제 추가 버튼 (체크박스 모드가 아닐 때만) -->
          <button v-if="!showCheckbox" @click="$emit('addQuestion')"
            class="w-full text-left text-sm text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 p-3 rounded-lg transition-colors flex items-center">
            <Icon icon="heroicons:plus" class="w-5 h-5 mr-2" />
            이 지문에 문제 추가하기
          </button>
        </div>
        
        <!-- 지문 삭제 버튼 (체크박스 모드가 아닐 때만) -->
        <div v-if="!showCheckbox" class="p-2 border-t border-slate-100 bg-slate-50/30">
          <button @click="$emit('remove')"
            class="w-full text-sm text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center">
            <Icon icon="heroicons:trash" class="w-4 h-4 mr-2" />
            지문 삭제
          </button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import QuestionItem from './QuestionItem.vue'

// Props
const props = defineProps({
  passage: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  showCheckbox: {
    type: Boolean,
    default: false
  },
  selectedQuestions: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'toggle',
  'addQuestion',
  'deleteQuestion',
  'updateQuestion',
  'remove',
  'passageCheckboxChange',
  'questionCheckboxChange'
])

// 반응형 상태
const passageCheckboxRef = ref(null)

// 지문 접기/펴기 토글
const toggleExpanded = () => {
  emit('toggle')
}

// 체크박스 관련 계산된 속성
const totalQuestions = computed(() => props.passage.questions?.length || 0)
const selectedQuestionCount = computed(() => {
  if (!props.showCheckbox || totalQuestions.value === 0) return 0
  return props.selectedQuestions.filter(qId => 
    props.passage.questions?.some(q => q.id === qId)
  ).length
})

// 지문 체크박스 상태
const isChecked = computed(() => {
  if (!props.showCheckbox || totalQuestions.value === 0) return false
  return selectedQuestionCount.value === totalQuestions.value
})

const isIndeterminate = computed(() => {
  if (!props.showCheckbox || totalQuestions.value === 0) return false
  const count = selectedQuestionCount.value
  return count > 0 && count < totalQuestions.value
})

// 체크박스 DOM 업데이트
watch([isIndeterminate], async () => {
  await nextTick()
  if (passageCheckboxRef.value) {
    passageCheckboxRef.value.indeterminate = isIndeterminate.value
  }
})

// 지문 체크박스 변경 핸들러
const handlePassageCheckboxChange = (event) => {
  const checked = event.target.checked
  const questionIds = props.passage.questions?.map(q => q.id) || []
  
  emit('passageCheckboxChange', {
    passageId: props.passage.id,
    questionIds,
    checked
  })
}

// 문제 체크박스 변경 핸들러
const handleQuestionCheckboxChange = (data) => {
  emit('questionCheckboxChange', {
    passageId: props.passage.id,
    questionId: data.questionId,
    checked: data.checked
  })
}

// 지문 타입에 따른 CSS 클래스
const getPassageTypeClass = (type) => {
  switch (type) {
    case '단일 지문':
      return 'bg-blue-100 text-blue-700'
    case '복합 지문':
      return 'bg-purple-100 text-purple-700'
    case '독서론':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}
</script>

<style scoped>
/* 지문 접기/펴기 애니메이션 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  transform: translateY(-8px);
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 1000px;
  transform: translateY(0);
}

/* 문제 추가/삭제 애니메이션 */
.question-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.question-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

.question-enter-from {
  opacity: 0;
  transform: translateX(-20px) scale(0.95);
}

.question-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

.question-move {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 호버 효과 */
.passage-block {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.passage-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

/* 아이콘 회전 애니메이션 */
.rotate-180 {
  transform: rotate(180deg);
}

.toggle-button svg {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 버튼 호버 효과 */
button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
}

button:active:not(:disabled) {
  transform: translateY(0);
}
</style>