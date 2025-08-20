<template>
  <div
    class="question-item flex items-center bg-white p-3 rounded-lg border border-slate-200 hover:shadow-sm transition-all group">
    <!-- 체크박스 모드 -->
    <template v-if="showCheckbox">
      <input 
        type="checkbox" 
        :checked="isChecked" 
        :disabled="isExisting"
        @change="handleCheckboxChange"
        :class="[
          'w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-3',
          { 'opacity-50 cursor-not-allowed': isExisting }
        ]"
      />
    </template>
    
    <!-- 기본 모드 (드래그 핸들 + 번호) -->
    <template v-else>
      <div class="question-drag-handle cursor-grab text-slate-400 hover:text-slate-600 mr-3">
        <Icon icon="heroicons-solid:menu-alt-4" class="w-5 h-5" />
      </div>
      <span class="question-number font-semibold text-slate-600 mr-3">{{ index + 1 }}.</span>
    </template>

    <!-- 문제 텍스트 (HTML 렌더링) -->
    <div class="flex-grow" @click="handleQuestionClick">
      <div 
        :class="[
          'prose prose-sm text-lg m-0 text-left p-2 rounded transition-colors',
          isExisting ? 'text-gray-400 cursor-default' : 'text-[#303030] cursor-pointer hover:bg-slate-50'
        ]" 
        v-html="question.queQuery"
      />
    </div>

    <!-- 액션 버튼 (체크박스 모드가 아닐 때만 표시) -->
    <div v-if="!showCheckbox" class="items-center space-x-2 ml-4">
      <!-- 삭제 버튼 -->
      <button @click="handleDelete"
        class="action-btn text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        title="문제 삭제">
        <Icon icon="heroicons:trash" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

// Props
const props = defineProps({
  question: {
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
  isChecked: {
    type: Boolean,
    default: false
  },
  isExisting: {
    type: Boolean,
    default: false // add 모드에서 기존 보유 문항인 경우 true
  }
})

// Emits
const emit = defineEmits(['delete', 'update', 'copy', 'checkboxChange', 'click'])

// 편집 기능 제거됨 (TipTap Editor로 대체)

// 문제 삭제
const handleDelete = () => {
  if (confirm('이 문제를 삭제하시겠습니까?')) {
    emit('delete')
  }
}

// 문제 복사
const copyQuestion = () => {
  navigator.clipboard.writeText(props.question.queQuery).then(() => {
    // 복사 성공 알림 (부모 컴포넌트에서 처리)
    emit('copy', props.question)
  }).catch(err => {
    console.error('복사 실패:', err)
  })
}

// 체크박스 변경 핸들러
const handleCheckboxChange = (event) => {
  // 기존 문항이면 변경 방지
  if (props.isExisting) {
    event.preventDefault()
    return
  }
  
  emit('checkboxChange', {
    queCode: props.question.queCode,
    checked: event.target.checked
  })
}

// 문항 클릭 이벤트 (미리보기용)
const handleQuestionClick = () => {
  if (props.showCheckbox) {
    emit('click', props.question)
  }
}

</script>

<style scoped>
/* 호버 효과 */
.question-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.question-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 액션 버튼 스타일 */
.action-btn {
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn:active {
  transform: scale(0.95);
}

/* 텍스트 에어리어 스타일 */
textarea {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}

textarea:focus {
  outline: none;
}

/* 편집 모드 표시 */
.question-item.editing {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 빈 문제 스타일 */
.text-gray-400.italic {
  font-style: italic;
}

/* 드래그 핸들 호버 효과 */
.question-drag-handle:hover {
  color: #6b7280;
}

/* 그룹 호버 시 버튼 표시 */
.group:hover .opacity-0 {
  opacity: 1;
}

/* 트랜지션 효과 */
.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>