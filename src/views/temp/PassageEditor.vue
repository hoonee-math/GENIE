<template>
  <div class="box-border bg-white border border-[#E5E7EB] rounded-xl">
    <!-- 편집 도구 섹션 -->
    <div class="flex flex-col items-start p-4 sm:p-[2%_3%] gap-2">
      <p class="font-bold text-xl sm:text-2xl leading-[150%] tracking-[-0.02em] text-[#16252d]">
        편집 도구
      </p>
      
      <!-- 편집 도구 박스 -->
      <div class="relative box-border min-h-[73px] bg-white border border-[#757575] rounded-xl w-full flex flex-col sm:flex-row gap-4 items-center px-4 sm:px-10 py-3 sm:py-0">
        <!-- 단어·문장 기호 섹션 -->
        <div class="flex flex-row items-center gap-3 sm:gap-4 w-full">
          <p class="font-normal text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black whitespace-nowrap">
            단어·문장 기호
          </p>
          <div class="flex flex-row items-center gap-2 sm:gap-3 overflow-x-auto w-full sm:w-auto">
            <ul class="flex flex-row items-center gap-2 sm:gap-3 list-none">
              <li
                v-for="symbol in mainSymbols"
                :key="symbol.type"
                :data-symbol="symbol.type"
                @click="showSymbolTooltip(symbol.type)"
                class="text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-brand"
              >
                {{ symbol.display }}
              </li>
            </ul>
          </div>
        </div>

        <!-- 에디터 섹션 -->
        <div class="flex flex-row items-center gap-3 sm:gap-4 w-full">
          <p class="font-normal text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black whitespace-nowrap">
            에디터
          </p>
          <div class="flex flex-row items-center gap-2 sm:gap-3">
            <ul class="flex flex-row items-center gap-2 sm:gap-3 list-none">
              <li
                @click="editor?.chain().focus().toggleBold().run()"
                :class="{ 'text-brand': editor?.isActive('bold') }"
                class="text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-brand"
              >
                <b>B</b>
              </li>
              <li
                @click="editor?.chain().focus().toggleUnderline().run()"
                :class="{ 'text-brand': editor?.isActive('underline') }"
                class="text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-brand"
              >
                <u>U</u>
              </li>
              <li
                @click="editor?.chain().focus().toggleStrike().run()"
                :class="{ 'text-brand': editor?.isActive('strike') }"
                class="text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-brand"
              >
                <s>S</s>
              </li>
            </ul>
          </div>
        </div>

        <!-- 심볼 툴팁 -->
        <div
          v-if="showTooltip"
          class="absolute top-[75px] left-[166px] bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50"
        >
          <div class="flex flex-nowrap gap-1 max-w-[200px]">
            <button
              v-for="symbol in symbolList"
              :key="symbol"
              @click="insertSymbol(symbol)"
              class="px-2 py-1 hover:bg-blue-50 hover:text-brand rounded text-lg min-w-[32px] transition-colors"
            >
              {{ symbol }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 지문 섹션 -->
    <div class="p-[2%_3%] relative">
      <div class="flex flex-col sm:flex-row items-start gap-4">
        <p class="font-bold text-lg leading-[150%] tracking-[-0.02em] text-[#16252d]">
          다음 글을 읽고 물음에 답하시오
        </p>
        <div class="w-fit h-6 text-right font-medium text-base leading-[150%] tracking-[-0.02em] text-[#bdbdbd] mt-2 sm:mt-0 sm:ml-auto">
          <span class="text-brand">{{ textLength }}</span>/5000
        </div>
      </div>

      <!-- TipTap 에디터 -->
      <div class="box-border flex flex-row justify-center items-center p-8 gap-2 bg-white border border-brand rounded-xl mt-4">
        <editor-content 
          :editor="editor" 
          class="w-full h-[398px] min-h-[398px] font-normal text-base leading-7 tracking-[-0.02em] text-[#303030] outline-none overflow-y-auto text-left"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'

// Props
const props = defineProps({
  initialContent: {
    type: String,
    default: '',
  }
})

// 상수 정의
const MAX_LENGTH = 5000

// Emits
const emit = defineEmits(['content-changed'])

// 반응형 상태
const content = ref(props.initialContent || '')
const textLength = ref(0)
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

// TipTap 에디터 설정
const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
  ],
  content: props.initialContent,
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      style: 'min-height: 398px; max-height: 398px; overflow-y: auto;'
    },
    handleKeyDown: (view, event) => {
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

// 심볼 툴팁 표시
const showSymbolTooltip = (symbolType) => {
  if (showTooltip.value && currentSymbolType.value === symbolType) {
    showTooltip.value = false
    return
  }
  
  currentSymbolType.value = symbolType
  symbolList.value = symbolSeries[symbolType] || []
  showTooltip.value = true
}

// 심볼 삽입
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

// 외부에서 내용 설정
const setContent = (newContent) => {
  if (editor.value && newContent !== editor.value.getHTML()) {
    editor.value.commands.setContent(newContent)
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

// 외부 클릭 시 툴팁 닫기
const handleClickOutside = (event) => {
  // 툴팁 영역이나 심볼 버튼을 클릭한 경우가 아니라면 툴팁 닫기
  const isTooltipClick = event.target.closest('.absolute') || 
                        event.target.closest('li[data-symbol]')
  if (!isTooltipClick && showTooltip.value) {
    showTooltip.value = false
  }
}

// Props 변경 감지
watch(() => props.initialContent, (newContent) => {
  if (newContent !== content.value) {
    setContent(newContent)
  }
})

// 마운트/언마운트 처리
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
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
/* TipTap 에디터 커스텀 스타일 */
:deep(.ProseMirror) {
  outline: none;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  min-height: 398px;
  max-height: 398px;
  overflow-y: auto;
}

:deep(.ProseMirror p) {
  margin: 0 0 1em 0;
}

:deep(.ProseMirror:empty:before) {
  content: "본문을 입력해주세요.";
  color: #9CA3AF;
  float: left;
  height: 0;
  pointer-events: none;
}

/* 선택된 텍스트 스타일 */
:deep(.ProseMirror ::selection) {
  background: #0086ff33;
}

/* 포커스 스타일 */
:deep(.ProseMirror:focus) {
  outline: none;
}

/* 스크롤바 스타일링 */
:deep(.ProseMirror)::-webkit-scrollbar {
  width: 6px;
}

:deep(.ProseMirror)::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

:deep(.ProseMirror)::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

:deep(.ProseMirror)::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.boxed {
border: 1px solid #000;
padding: 2px 4px;
border-radius: 4px;
background-color: #f5f5f5;
}

</style>