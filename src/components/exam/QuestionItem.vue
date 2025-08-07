<template>
  <div
    class="question-item flex items-center bg-white p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-sm transition-all group">
    <div class="question-drag-handle cursor-grab text-slate-400 hover:text-slate-600 mr-3">
      <Icon icon="heroicons-solid:menu-alt-4" width="20" height="20" />
    </div>

    <span class="question-number font-semibold text-slate-600 mr-3">{{ index + 1 }}.</span>

    <!-- 편집 가능한 문제 텍스트 -->
    <div class="flex-grow">
      <textarea v-if="isEditing" v-model="editingText" @blur="saveEdit" @keydown.enter.prevent="saveEdit"
        @keydown.escape="cancelEdit"
        class="w-full p-2 text-slate-700 border border-blue-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        rows="2" ref="textareaRef" />
      <p v-else @click="startEdit"
        class="flex-grow text-slate-700 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
        :class="{ 'text-gray-400 italic': question.text === '새로운 문제를 입력하세요' }">
        {{ question.text || '새로운 문제를 입력하세요' }}
      </p>
    </div>

    <!-- 액션 버튼 -->
    <div class="items-center space-x-2 ml-4">
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
import { ref, nextTick, onMounted } from 'vue'
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
  }
})

// Emits
const emit = defineEmits(['delete', 'update', 'copy'])

// 반응형 상태
const isEditing = ref(false)
const editingText = ref('')
const textareaRef = ref(null)

// 편집 모드 시작
const startEdit = () => {
  isEditing.value = true
  editingText.value = props.question.text

  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus()
      textareaRef.value.select()
    }
  })
}

// 편집 모드 토글
const toggleEdit = () => {
  if (isEditing.value) {
    saveEdit()
  } else {
    startEdit()
  }
}

// 편집 저장
const saveEdit = () => {
  if (editingText.value.trim() !== props.question.text) {
    emit('update', {
      ...props.question,
      text: editingText.value.trim() || '새로운 문제를 입력하세요'
    })
  }
  isEditing.value = false
}

// 편집 취소
const cancelEdit = () => {
  editingText.value = props.question.text
  isEditing.value = false
}

// 문제 삭제
const handleDelete = () => {
  if (confirm('이 문제를 삭제하시겠습니까?')) {
    emit('delete')
  }
}

// 문제 복사
const copyQuestion = () => {
  navigator.clipboard.writeText(props.question.text).then(() => {
    // 복사 성공 알림 (부모 컴포넌트에서 처리)
    emit('copy', props.question)
  }).catch(err => {
    console.error('복사 실패:', err)
  })
}

// 컴포넌트 마운트 시 빈 문제인 경우 자동 편집 모드
onMounted(() => {
  if (props.question.text === '새로운 문제를 입력하세요' || !props.question.text) {
    // 잠시 후 편집 모드로 전환 (애니메이션 완료 후)
    setTimeout(() => {
      startEdit()
    }, 300)
  }
})
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