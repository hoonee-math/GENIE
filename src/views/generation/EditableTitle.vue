<template>
    <div class="flex items-center gap-2">
        <!-- 편집 모드 -->
        <div v-if="isEditing" ref="editableElement" contenteditable="true" @blur="handleBlur"
            @keydown.enter.prevent="finishEdit" @keydown.esc="cancelEdit" :class="[
                'outline-none border border-blue-500 rounded px-2 py-1',
                titleClass
            ]"></div>

        <!-- 읽기 모드 -->
        <div v-else @click="startEdit" :class="[
            'cursor-pointer hover:bg-gray-50 rounded px-2 py-1',
            titleClass
        ]">
            {{ displayTitle || placeholder }}
        </div>

        <!-- 편집 버튼 -->
        <button @mousedown="handleButtonMouseDown" @click="toggleEdit" :disabled="isSaving || isProcessing"
            class="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 disabled:opacity-50">
            <Icon :icon="isEditing ? 'mingcute:check-fill' : 'mingcute:pencil-fill'" width="24" height="24"
                :class="isEditing ? 'text-green-600' : 'text-gray-600'" />
        </button>

        <!-- 저장 중 표시 -->
        <div v-if="isSaving" class="text-sm text-gray-500">저장 중...</div>
    </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { apiPut } from '@/utils/http'
import { usePassage } from '@/composables/usePassage'
import { updatePassagePartial } from '@/api/passage'

const props = defineProps({
    // v-model 지원 (새 지문용)
    modelValue: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: '제목을 입력하세요'
    },
    titleClass: {
        type: String,
        default: 'text-xl font-medium'
    }
})

const emit = defineEmits(['update:modelValue'])

// Store에서 passage 가져오기
const { passage } = usePassage()

// 상태
const isEditing = ref(false)
const isSaving = ref(false)
const isProcessing = ref(false) // 버튼 처리 중 상태 추가
const shouldIgnoreBlur = ref(false) // blur 이벤트 무시 플래그
const editableElement = ref(null)
const originalValue = ref('')

// 자동 감지: pasCode가 있으면 기존 지문, 없으면 새 지문
const isExistingPassage = computed(() => !!passage.value.pasCode)

// 현재 제목 - 자동으로 Store 또는 v-model에서 가져오기
const displayTitle = computed(() => {
    return isExistingPassage.value ? passage.value.title : props.modelValue
})

// 편집 시작
const startEdit = () => {
    //console.log('startEdit 호출')
    isEditing.value = true
    originalValue.value = displayTitle.value || ''

    nextTick(() => {
        if (editableElement.value) {
            editableElement.value.textContent = displayTitle.value || ''
            editableElement.value.focus()

            // 텍스트 전체 선택 (간단한 방식)
            const range = document.createRange()
            range.selectNodeContents(editableElement.value)
            const selection = window.getSelection()
            selection.removeAllRanges()
            selection.addRange(range)
        }
    })
}

// 편집 완료
const finishEdit = async () => {
    //console.log('finishEdit 호출, isEditing:', isEditing.value)
    if (!isEditing.value) return

    const newValue = editableElement.value?.textContent?.trim() || ''
    //console.log('새 값:', newValue, '기존 값:', originalValue.value)

    // 값이 안 바뀌면 그냥 종료
    if (newValue === originalValue.value) {
        //console.log('값이 동일함, 편집 종료')
        isEditing.value = false
        return
    }

    //console.log('편집 종료')
    isEditing.value = false

    if (isExistingPassage.value) {
        // 기존 지문 - Store 먼저 업데이트 (낙관적 업데이트)
        const oldTitle = passage.value.title
        passage.value.title = newValue

        isSaving.value = true
        try {
            await updatePassagePartial(passage.value.pasCode, {
                title: newValue
            })
            //console.log('제목 저장 완료')
        } catch (error) {
            console.error('제목 저장 실패:', error)
            // 실패하면 되돌리기
            passage.value.title = oldTitle
            alert('제목 저장에 실패했습니다. 다시 시도해주세요.')
        } finally {
            isSaving.value = false
        }
    } else {
        // 새 지문 - 부모로 emit (v-model 업데이트)
        emit('update:modelValue', newValue)
    }
}

// 버튼 mousedown 처리
const handleButtonMouseDown = () => {
    //console.log('버튼 mousedown - blur 무시 설정')
    shouldIgnoreBlur.value = true
}

// blur 이벤트 처리
const handleBlur = () => {
    //console.log('blur 이벤트, shouldIgnoreBlur:', shouldIgnoreBlur.value)

    if (shouldIgnoreBlur.value) {
        //console.log('blur 무시됨')
        shouldIgnoreBlur.value = false
        return
    }

    finishEdit()
}

// 편집 취소
const cancelEdit = () => {
    isEditing.value = false
}

// 토글
const toggleEdit = async () => {
    //console.log('toggleEdit 호출, isEditing:', isEditing.value, 'isProcessing:', isProcessing.value)

    // 이미 처리 중이면 무시
    if (isProcessing.value || isSaving.value) return

    isProcessing.value = true
    shouldIgnoreBlur.value = false // 초기화

    try {
        if (isEditing.value) {
            //console.log('편집 모드 -> 읽기 모드')
            await finishEdit()
        } else {
            //console.log('읽기 모드 -> 편집 모드')
            startEdit()
        }
    } finally {
        isProcessing.value = false
        //console.log('toggleEdit 완료, 최종 isEditing:', isEditing.value)
    }
}
</script>

<style scoped>
[contenteditable]:empty:before {
    content: attr(data-placeholder);
    color: #9CA3AF;
}
</style>