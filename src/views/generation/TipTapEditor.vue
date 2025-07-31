<template>
    <!-- 고정 툴바 (PassageEditor 호환) -->
    <div v-if="showFixedToolbar" class="flex flex-col items-start gap-2 mb-4">
        <p class="font-bold text-xl sm:text-2xl leading-[150%] tracking-[-0.02em] text-[#16252d]">
            편집 도구
        </p>

        <!-- 편집 도구 박스 -->
        <div
            class="relative box-border min-h-[73px] bg-white border border-[#757575] rounded-xl w-full flex flex-col sm:flex-row gap-4 items-center px-4 sm:px-10 py-3 sm:py-0">
            <!-- 단어·문장 기호 섹션 -->
            <div class="flex flex-row items-center gap-3 sm:gap-4 w-full">
                <p
                    class="font-normal text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black whitespace-nowrap">
                    단어·문장 기호
                </p>
                <div class="flex flex-row items-center gap-2 sm:gap-3 overflow-x-auto w-full sm:w-auto">
                    <ul class="flex flex-row items-center gap-2 sm:gap-3 list-none">
                        <li v-for="symbol in mainSymbols" :key="symbol.type" :data-symbol="symbol.type"
                            @click="showSymbolTooltip(symbol.type)"
                            class="text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-brand">
                            {{ symbol.display }}
                        </li>
                    </ul>
                </div>
            </div>

            <!-- 에디터 섹션 -->
            <div class="flex flex-row items-center gap-3 sm:gap-4 w-full">
                <p
                    class="font-normal text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black whitespace-nowrap">
                    에디터
                </p>
                <div class="flex flex-row items-center gap-2 sm:gap-3">
                    <ul class="flex flex-row items-center gap-2 sm:gap-3 list-none">
                        <li @click="editor?.chain().focus().toggleBold().run()"
                            :class="{ 'text-brand': editor?.isActive('bold') }"
                            class="text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-brand">
                            <b>B</b>
                        </li>
                        <li @click="editor?.chain().focus().toggleUnderline().run()"
                            :class="{ 'text-brand': editor?.isActive('underline') }"
                            class="text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-brand">
                            <u>U</u>
                        </li>
                        <li @click="editor?.chain().focus().toggleStrike().run()"
                            :class="{ 'text-brand': editor?.isActive('strike') }"
                            class="text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-brand">
                            <s>S</s>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- 심볼 툴팁 -->
            <div v-if="showTooltip"
                class="absolute top-[75px] left-[166px] bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50">
                <div class="flex flex-nowrap gap-1 max-w-[200px]">
                    <button v-for="symbol in symbolList" :key="symbol" @click="insertSymbol(symbol)"
                        class="px-2 py-1 hover:bg-blue-50 hover:text-brand rounded text-lg min-w-[32px] transition-colors">
                        {{ symbol }}
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- 지문 섹션 -->
    <div v-if="showFixedToolbar">
        <p class="mb-4 font-bold text-lg leading-[150%] tracking-[-0.02em] text-[#16252d]">
            다음 글을 읽고 물음에 답하시오
        </p>
    </div>

    <!-- TipTap 에디터 -->
    <div :class="['box-border pt-[1px] relative', isEditable ? ' border border-[#757575] ' : '']">
        <editor-content :editor="editor" :class="['text-[#303030] text-left ', addClass]" />
    </div>
    <!-- 🆕 툴팁을 body에 텔레포트 (잘림 방지) -->
    <!-- 컨텍스트 메뉴 툴팁 -->
    <Teleport to="body">
        <div v-if="showContextMenu && isEditable" :style="{
            position: 'fixed',
            top: menuPosition.top + 'px',
            left: menuPosition.left + 'px',
            transform: 'translateX(-50%)',
            zIndex: 9999
        }" class="bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1 flex gap-1 pointer-events-auto">
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
        </div>
    </Teleport>

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
    },
    showFixedToolbar: {
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

// 심볼 관련 상태 (showFixedToolbar 모드용)
const showTooltip = ref(false)
const currentSymbolType = ref('㉠')
const symbolList = ref([])

// 메인 심볼 목록
const mainSymbols = [
    { type: '㉠', display: '㉠' },
    { type: 'ⓐ', display: 'ⓐ' },
    { type: '㉮', display: '㉮' },
    { type: '①', display: '①' }
]

// 심볼 시리즈 정의
const symbolSeries = {
    '㉠': ['㉠', '㉡', '㉢', '㉣', '㉤'],
    '㉮': ['㉮', '㉯', '㉰', '㉱', '㉲'],
    'ⓐ': ['ⓐ', 'ⓑ', 'ⓒ', 'ⓓ', 'ⓔ'],
    '①': ['①', '②', '③', '④', '⑤']
}

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

// 심볼 툴팁 표시 (showFixedToolbar 모드용)
const showSymbolTooltip = (symbolType) => {
    if (showTooltip.value && currentSymbolType.value === symbolType) {
        showTooltip.value = false
        return
    }

    currentSymbolType.value = symbolType
    symbolList.value = symbolSeries[symbolType] || []
    showTooltip.value = true
}

// 심볼 삽입 (showFixedToolbar 모드용)
const insertSymbol = (symbol) => {
    if (editor.value) {
        // 에디터에 포커스를 먼저 설정
        editor.value.view.focus()

        // 커서 위치에 심볼 삽입
        editor.value.chain().focus().insertContent(symbol).run()

        // 삽입 후 포커스 유지
        setTimeout(() => {
            editor.value.view.focus()
        }, 50)
    }
    showTooltip.value = false
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
    // 컨텍스트 메뉴 툴팁 영역인지 확인
    const isContextMenuClick = event.target.closest('.absolute.z-50.bg-white')

    // 심볼 툴팁 영역인지 확인
    const isSymbolTooltipClick = event.target.closest('.absolute.top-\\[75px\\]') ||
        event.target.closest('li[data-symbol]')

    // 컨텍스트 메뉴 숨김
    if (!isContextMenuClick) {
        showContextMenu.value = false
    }

    // 심볼 툴팁 숨김 (showFixedToolbar 모드에서만)
    if (props.showFixedToolbar && !isSymbolTooltipClick && showTooltip.value) {
        showTooltip.value = false
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
/* PassageEditor 호환성을 위한 추가 스타일 */
:deep(.ProseMirror) {
    overflow-y: auto;
}

:deep(.ProseMirror p) {
    margin: 0 0 1em 0;
}

:deep(.ProseMirror:empty:before) {
    content: "내용을 입력해주세요.";
    color: #9CA3AF;
    float: left;
    pointer-events: none;
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