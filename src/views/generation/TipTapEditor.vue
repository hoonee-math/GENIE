<template>
    <!-- TipTap 에디터 -->
    <div :class="['box-border pt-[1px] ', isEditable ? ' border border-[#757575] ' : '']">
        <editor-content :editor="editor" :class="['text-[#303030] text-left ', addClass]" />
    </div>
    <!-- 오른쪽 정렬 -->
    <div v-if="props.showContentLength" class="flex justify-end mt-2">
        <span class="text-brand">{{ textLength }}</span><span class="text-[#BDBDBD]">/{{ MAX_LENGTH }}</span>
    </div>
</template>
<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'

// Props
const props = defineProps({
    initialContent: { // 부모객체로 부터 받아오는 지문 내용 영역 데이터
        type: String,
        default: '',
    },
    isEditable: {
        type: Boolean,
        default: false,
    },
    addClass: {
        type: String,
        default: 'text-base',
    },
    showContentLength: {
        type: Boolean,
        default: false,
    }
})

// 상수 정의
const MAX_LENGTH = 3000

// Emits
const emit = defineEmits(['content-changed'])

// 반응형 상태
const content = ref(props.initialContent || '')
const textLength = ref(0)
const isEditable = ref(true) // 편집 가능 여부 상태

// 편집 가능 여부 설정 함수 추가
const setEditable = () => {
    isEditable.value = props.isEditable;
}

// TipTap 에디터 설정
const editor = useEditor({
    extensions: [
        StarterKit,
        Underline,
    ],
    content: props.initialContent,
    editable: isEditable.value,  // 편집 가능 여부 설정
    editorProps: {
        attributes: {
            class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
            style: ''
        },
        handleKeyDown: (view, event) => {
            // 편집 불가능한 상태에서는 모든 입력 차단
            if (!isEditable.value) {
                event.preventDefault()
                return true
            }
            // 최대 길이 체크
            if (textLength.value >= MAX_LENGTH &&
                !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
                event.preventDefault()
                return true
            }
            return false
        }
    },
    onUpdate: ({ editor }) => {
        // 편집 불가능한 상태에서는 변경 이벤트 발생 안함
        if (!isEditable.value) return

        const html = editor.getHTML()
        const text = editor.getText()

        // 최대 길이 체크
        if (text.length > MAX_LENGTH) {
            // 텍스트를 최대 길이로 제한
            const truncatedText = text.substring(0, MAX_LENGTH)
            editor.commands.setContent(truncatedText)
            return
        }

        content.value = html
        textLength.value = text.length

        // 부모 컴포넌트에 변경 알림
        emit('content-changed', {
            content: html,
            textLength: text.length
        })
    },
    onCreate: ({ editor }) => {
        // 초기 텍스트 길이 설정
        textLength.value = editor.getText().length
    }
})

// 외부에서 내용 설정
const setContent = (newContent) => {
    if (editor.value && newContent !== editor.value.getHTML()) {
        editor.value.commands.setContent(newContent)
        // ✅ 추가: textLength 업데이트
        textLength.value = editor.value.getText().length
    }
}

// 내용 가져오기
const getContent = () => {
    return editor.value ? editor.value.getHTML() : ''
}

// 텍스트 길이 검증
const validateTextLength = () => {
    return textLength.value >= 500
}


// Props 변경 감지
watch(() => props.initialContent, (newContent) => {
    if (newContent !== content.value) {
        setContent(newContent)
    }
})
// 에디터 편집 가능 여부를 동적으로 변경하는 로직을 포함하기 위해서 watch 방식 사용.. TipTap 에디터 (외부 라이브러리)는 직접 수정로직이 필요함.
watch(() => props.isEditable, () => {
    setEditable()   // Vue 상태 업데이트
    // 에디터 편집 가능 여부 동적 변경
    if (editor.value) {
        editor.value.setEditable(isEditable.value) // 외부 라이브러리 동기화
    }
})

// 마운트/언마운트 처리
onMounted(() => {
    setEditable()  // 편집 가능 여부 설정
})

onBeforeUnmount(() => {
    if (editor.value) {
        editor.value.destroy()
    }
})

// 외부에서 접근 가능한 메서드들
defineExpose({
    setContent,
    getContent,
    validateTextLength,
    editor
})
</script>

<style scoped>
:deep(.ProseMirror p) {
    margin: 0 0 1em 0;
}

/* TipTap 에디터 커스텀 스타일 */
/* 스크롤바 스타일링 */
:deep(.ProseMirror)::-webkit-scrollbar {
    width: 6px;
}

:deep(.ProseMirror)::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

:deep(.ProseMirror)::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.5);
    border-radius: 3px;
}

:deep(.ProseMirror)::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>