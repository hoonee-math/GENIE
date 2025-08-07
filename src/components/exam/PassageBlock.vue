<template>
  <div
    class="passage-block bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200">
    <!-- 지문 헤더 -->
    <div class="flex items-center p-4 bg-white border-b border-slate-200">
      <div class="passage-drag-handle cursor-grab text-slate-400 hover:text-slate-600 mr-4">
        <Icon icon="heroicons:bars-3" class="w-6 h-6" />
      </div>
      <div class="flex-grow flex items-center">
        <span class="passage-number text-xl font-bold text-blue-600 mr-4">{{ index + 1 }}</span>
        <h2 class="text-lg font-semibold text-slate-800">{{ passage.title }}</h2>
        <span class="ml-auto text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full"
          :class="getPassageTypeClass(passage.type)">
          {{ passage.type }}
        </span>
      </div>
      <button @click="toggleExpanded" class="toggle-button ml-4 text-slate-500 hover:text-slate-800">
        <Icon icon="heroicons:chevron-down" class="w-6 h-6 transition-transform"
          :class="{ 'rotate-180': passage.isExpanded }" />
      </button>
    </div>

    <!-- 문제 리스트 -->
    <Transition name="expand" appear>
      <div v-show="passage.isExpanded" class="questions-list bg-slate-50/50 p-2 sm:p-4 space-y-2">
        <TransitionGroup name="question" tag="div" class="space-y-2">
          <QuestionItem v-for="(question, qIndex) in passage.questions" :key="question.id" :question="question"
            :index="qIndex" @delete="$emit('deleteQuestion', question.id)"
            @update="$emit('updateQuestion', question.id, $event)" />
        </TransitionGroup>

        <button @click="$emit('addQuestion')"
          class="w-full text-left text-sm text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 p-3 rounded-lg transition-colors flex items-center">
          <Icon icon="heroicons:plus" class="w-5 h-5 mr-2" />
          이 지문에 문제 추가하기
        </button>
      </div>
    </Transition>

    <!-- 지문 삭제 버튼 -->
    <div class="p-2 border-t border-slate-100 bg-slate-50/30">
      <button @click="$emit('remove')"
        class="w-full text-sm text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center">
        <Icon icon="heroicons:trash" class="w-4 h-4 mr-2" />
        지문 삭제
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
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
  }
})

// Emits
const emit = defineEmits([
  'toggle',
  'addQuestion',
  'deleteQuestion',
  'updateQuestion',
  'remove'
])

// 지문 접기/펴기 토글
const toggleExpanded = () => {
  emit('toggle')
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