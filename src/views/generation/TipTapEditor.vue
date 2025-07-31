<template>
    <!-- TipTap 에디터 -->
    <div :class="['box-border pt-[1px] relative', isEditable ? ' border border-[#757575] ' : '']">
        <editor-content :editor="editor" :class="['text-[#303030] text-left ', addClass]" />
    </div>
    <!-- 🆕 툴팁을 body에 텔레포트 (잘림 방지) -->
    <!-- 컨텍스트 메뉴 툴팁 -->
    <Teleport to="body">
        <div 
            v-if="showContextMenu && isEditable" 
            :style="{
                position: 'fixed',  // absolute → fixed로 변경
                top: menuPosition.top + 'px',
                left: menuPosition.left + 'px',
                transform: 'translateX(-50%)',
                zIndex: 9999  // 높은 z-index
            }"
            class="bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1 flex gap-1 pointer-events-auto"
        >
        <!-- <div v-if="showContextMenu && isEditable" :style="{
            top: menuPosition.top + 'px',
            left: menuPosition.left + 'px',
            transform: 'translateX(-50%)' // 중앙 정렬을 위한 transform
        }"
            class="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1 flex gap-1 pointer-events-auto"> -->
            <!-- 굵게 버튼 -->
            <button @click="toggleBold" :class="[
                'p-2 rounded hover:bg-gray-100 transition-colors',
                editor?.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            ]" title="굵게 (Ctrl+B)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
                </svg>
            </button>

            <!-- 밑줄 버튼 -->
            <button @click="toggleUnderline" :class="[
                'p-2 rounded hover:bg-gray-100 transition-colors',
                editor?.isActive('underline') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            ]" title="밑줄 (Ctrl+U)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
                </svg>
            </button>

            <!-- 기울임꼴 버튼 -->
            <button @click="toggleItalic" :class="[
                'p-2 rounded hover:bg-gray-100 transition-colors',
                editor?.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            ]" title="기울임꼴 (Ctrl+I)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" />
                </svg>
            </button>

            <!-- 취소선 버튼 -->
            <button @click="toggleStrike" :class="[
                'p-2 rounded hover:bg-gray-100 transition-colors',
                editor?.isActive('strike') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            ]" title="취소선 (Ctrl+S)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M6.85 7.08C6.85 4.37 9.45 3 12.24 3c1.64 0 3 .49 3.9 1.28.77.65 1.46 1.73 1.46 3.24h-3.01c0-.31-.05-.59-.15-.85-.29-.86-1.2-1.28-2.25-1.28-1.86 0-2.34 1.02-2.34 1.7 0 .48.25.88.74 1.21.38.25.77.48 1.41.7H7.39c-.21-.34-.54-.89-.54-1.92zM21 12v-2H3v2h9.62c1.15.45 1.96.75 1.96 1.97 0 1-.81 1.67-2.28 1.67-1.54 0-2.93-.54-2.93-2.51H6.4c0 .55.08 1.13.24 1.58.81 2.29 3.29 3.3 5.67 3.3 2.27 0 5.3-.89 5.30-4.05 0-.3-.01-1.16-.48-1.94H21V12z" />
                </svg>
            </button>
            <!-- 기존 버튼들... -->
        </div>
    </Teleport>
    <!-- 오른쪽 정렬 -->
    <div v-if="props.showContentLength" class="flex justify-end mt-2">
        <span class="text-brand">{{ textLength }}</span><span class="text-[#BDBDBD]">/{{ MAX_LENGTH }}자</span>
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

// 컨텍스트 메뉴 관련 반응형 상태 추가
const showContextMenu = ref(false)
const menuPosition = ref({ top: 0, left: 0 })

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
    editable: isEditable.value,
    editorProps: {
        attributes: {
            class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none max-h-[400px] md:max-h-[45vh] overflow-y-auto',
            style: ''
        },
        handleKeyDown: (view, event) => {
            // 기존 키보드 이벤트 처리...
            if (!isEditable.value) {
                event.preventDefault()
                return true
            }

            const isCtrlOrCmd = event.ctrlKey || event.metaKey

            if (isCtrlOrCmd) {
                switch (event.key.toLowerCase()) {
                    case 'b':
                        event.preventDefault()
                        toggleBold()
                        return true
                    case 'u':
                        event.preventDefault()
                        toggleUnderline()
                        return true
                    case 'i':
                        event.preventDefault()
                        toggleItalic()
                        return true
                    case 's':
                        event.preventDefault()
                        toggleStrike()
                        return true
                }
            }

            if (textLength.value >= MAX_LENGTH &&
                !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
                event.preventDefault()
                return true
            }
            return false
        },
        // 🆕 마우스 이벤트 처리 추가
        handleDOMEvents: {
            contextmenu: (view, event) => {
                if (!isEditable.value) {
                    return false
                }

                const { from, to } = view.state.selection
                if (from !== to) {
                    event.preventDefault()
                    calculateMenuPositionFromClick(event)
                    return true
                }

                return false
            },
            // 🆕 일반 클릭 이벤트 추가
            click: (view, event) => {
                // 툴팁이 열려있으면 숨김
                if (showContextMenu.value) {
                    showContextMenu.value = false
                }
                return false // 기본 클릭 동작은 유지
            },
            // 🆕 스크롤 시 툴팁 숨김
            scroll: (view, event) => {
                if (showContextMenu.value) {
                    showContextMenu.value = false
                }
                return false
            }
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


// 서식 적용 함수들
const toggleBold = () => {
    editor.value.chain().focus().toggleBold().run()
}

const toggleUnderline = () => {
    editor.value.chain().focus().toggleUnderline().run()
}

const toggleItalic = () => {
    editor.value.chain().focus().toggleItalic().run()
}

const toggleStrike = () => {
    editor.value.chain().focus().toggleStrike().run()
}

// 우클릭 위치 계산 함수
const calculateMenuPositionFromClick = (event) => {
    console.log('🎯 위치 계산 시작 (body 기준)')
    
    // 🎯 viewport 기준 절대 위치 사용
    const viewportX = event.clientX
    const viewportY = event.clientY
    
    console.log('viewport 위치:', { viewportX, viewportY })
    
    // 오프셋 적용
    const offsetX = 100
    const offsetY = 20
    
    let finalTop = viewportY + offsetY
    let finalLeft = viewportX + offsetX
    
    // 🔍 화면 경계 체크 (선택사항)
    const tooltipWidth = 180
    const tooltipHeight = 45
    
    // 오른쪽 경계 체크
    if (finalLeft + tooltipWidth > window.innerWidth) {
        finalLeft = viewportX - 10
    }
    
    // 아래쪽 경계 체크  
    if (finalTop + tooltipHeight > window.innerHeight) {
        finalTop = viewportY - tooltipHeight - 10
    }
    
    console.log('최종 위치:', { finalTop, finalLeft })
    
    menuPosition.value = {
        top: finalTop,
        left: finalLeft
    }
    
    showContextMenu.value = true
}

// 문서 클릭 시 메뉴 숨김
const handleDocumentClick = (event) => {
    // 툴팁 메뉴 영역인지 확인
    const isTooltipClick = event.target.closest('.absolute.z-50.bg-white')
    
    // 툴팁 영역이 아닌 곳을 클릭하면 메뉴 숨김
    if (!isTooltipClick) {
        showContextMenu.value = false
    }
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
    document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick)
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

:deep(.editor-responsive-height) {
    min-height: 40vh;
    max-height: 800px;
    overflow-y: auto;
}

/* 태블릿/데스크톱: md 브레이크포인트 (768px) 이상 */
@media (min-width: 768px) {
    :deep(.editor-responsive-height) {
        min-height: 40vh;
        max-height: 800px;
    }
}

/* 또는 더 큰 화면용 추가 */
@media (min-width: 1024px) {
    :deep(.editor-responsive-height) {
        min-height: 45vh;
        max-height: 45vh;
    }
}
</style>