<template>
    <!-- 상단 컨트롤 UI -->
    <div class="p-4 border-b border-gray-200 bg-white flex items-center justify-between gap-4 flex-wrap">
        <!-- 왼쪽: 레이아웃 선택 및 기본 옵션 -->
        <div class="flex items-center gap-4 flex-wrap">
            <!-- paperLayout 선택 드롭다운 -->
            <div class="flex items-center gap-2">
                <label class="text-sm font-medium text-gray-700">레이아웃:</label>
                <select v-model="selectedLayoutId" @change="handleLayoutChange"
                    class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option v-for="layout in paperLayouts" :key="layout.id" :value="layout.id">
                        {{ layout.name }}
                    </option>
                </select>
            </div>

            <!-- 답안지 포함 체크박스 -->
            <div class="flex items-center gap-2">
                <input type="checkbox" id="include-answers" v-model="includeAnswers"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2">
                <label for="include-answers" class="text-sm font-medium text-gray-700">답안지 포함</label>
            </div>
        </div>

        <!-- 오른쪽: 컬럼 및 액션 버튼들 -->
        <div class="flex items-center gap-3">
            <!-- 컬럼 토글 버튼 -->
            <div class="flex items-center gap-1 border border-gray-300 rounded-md">
                <button @click="setColumnMode(1)" 
                    :class="columnMode === 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'"
                    class="px-3 py-1.5 text-sm font-medium rounded-l-md hover:bg-blue-50 transition">
                    1단
                </button>
                <button @click="setColumnMode(2)"
                    :class="columnMode === 2 ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'"
                    class="px-3 py-1.5 text-sm font-medium rounded-r-md hover:bg-blue-50 transition">
                    2단
                </button>
            </div>

            <!-- 새로고침 버튼 -->
            <button @click="refreshPreview" :disabled="isRendering"
                class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition">
                <svg class="w-4 h-4" :class="{ 'animate-spin': isRendering }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>

            <!-- 인쇄/PDF 버튼 -->
            <button @click="printExam"
                class="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 transition flex items-center gap-2">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                인쇄/PDF
            </button>
        </div>
    </div>

    <!-- Paged.js 미리보기 영역 -->
    <div class="flex-1 overflow-auto bg-gray-100 p-6" ref="previewContainer">
        <!-- 원본 콘텐츠 (Paged.js가 이를 페이지로 변환) -->
        <div id="content-for-pagedjs" ref="contentForPagedjs" class="hidden">
            <header class="pagedjs-ignore" v-html="getRenderedHeader()"></header>
            <main :class="columnMode === 1 ? 'one-column' : 'two-column'">
                <!-- 문제지 제목 영역 -->
                <div v-if="examData.title" class="exam-title mb-4">
                    <p class="text-center font-bold text-lg">{{ examData.title }}</p>
                </div>

                <!-- 지문 및 문항 렌더링 -->
                <div v-if="loadedPassages.length > 0" class="passages-container">
                    <template v-for="(passage, passageIndex) in loadedPassages" :key="passage.id">
                        <!-- 지문 범위 표시 -->
                        <div class="passage-range text-[9.5pt] font-medium mb-2">
                            [{{ getPassageQuestionRange(passageIndex) }}] 다음 글을 읽고 물음에 답하시오.
                        </div>
                        
                        <!-- 지문 내용 -->
                        <div class="passage-block-preview">
                            <div v-html="passage.content"></div>
                        </div>

                        <!-- 문항들 -->
                        <template v-for="(question, questionIndex) in passage.questions" :key="question.queCode">
                            <div class="question-block">
                                <p><span class="font-bold">{{ getQuestionNumber(passageIndex, questionIndex) }}.</span> <span v-html="question.queQuery"></span></p>
                                
                                <!-- 보기 박스 (queSubpassage가 있는 경우) -->
                                <div v-if="question.queSubpassage" class="보기-box">
                                    <div class="보기-title">&lt;보 기&gt;</div>
                                    <div v-html="question.queSubpassage"></div>
                                </div>
                                
                                <!-- 선택지 -->
                                <div v-if="question.queOption && question.queOption.length > 0" class="choices">
                                    <div v-for="option in question.queOption" :key="option" v-html="option"></div>
                                </div>

                                <!-- 답안지 포함 시 정답 및 해설 -->
                                <div v-if="includeAnswers && (question.queAnswer || question.queDescription)" class="answer-section mt-3 p-2 bg-gray-50 border-l-4 border-blue-500">
                                    <div v-if="question.queAnswer" class="answer mb-2">
                                        <span class="font-bold">정답:</span> {{ question.queAnswer }}
                                    </div>
                                    <div v-if="question.queDescription" class="description" v-html="question.queDescription"></div>
                                </div>
                            </div>
                        </template>
                    </template>
                </div>

                <!-- 빈 상태 -->
                <div v-else class="empty-state text-center py-20 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <p class="text-base">왼쪽에서 지문을 불러오면</p>
                    <p class="text-base">여기에 문제가 표시됩니다.</p>
                </div>
            </main>
            <footer v-if="getRenderedFooter()" v-html="getRenderedFooter()"></footer>
        </div>

        <!-- Paged.js가 렌더링한 페이지들이 여기에 표시됨 -->
        <div id="pagedjs-pages-container"></div>
    </div>
</template>
<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useGenerateExam } from '@/composables/useGenerateExam'

// useGenerateExam composable 사용
const {
  examData,
  loadedPassages,
  paperLayouts,
  selectedLayoutId,
  selectedLayout,
  changeLayout,
  getRenderedHeader,
  getRenderedFooter
} = useGenerateExam()

// 컴포넌트 상태
const includeAnswers = ref(false) // 답안지 포함 여부
const columnMode = ref(2) // 1단 또는 2단 컬럼
const isRendering = ref(false) // Paged.js 렌더링 상태

// DOM 참조
const previewContainer = ref(null)
const contentForPagedjs = ref(null)

// Paged.js 관련
let pagedPreviewer = null

// 문항 번호 계산
const getQuestionNumber = (passageIndex, questionIndex) => {
  let totalQuestions = 0
  for (let i = 0; i < passageIndex; i++) {
    totalQuestions += loadedPassages.value[i].questions.length
  }
  return totalQuestions + questionIndex + 1
}

// 지문별 문항 범위 표시
const getPassageQuestionRange = (passageIndex) => {
  const startNumber = getQuestionNumber(passageIndex, 0)
  const endNumber = getQuestionNumber(passageIndex, loadedPassages.value[passageIndex].questions.length - 1)
  
  if (startNumber === endNumber) {
    return startNumber.toString()
  }
  return `${startNumber}~${endNumber}`
}

// 레이아웃 변경 핸들러
const handleLayoutChange = () => {
  changeLayout(selectedLayoutId.value)
  renderWithPagedJs()
}

// 컬럼 모드 변경
const setColumnMode = (mode) => {
  columnMode.value = mode
  renderWithPagedJs()
}

// Debounce 타이머
let renderDebounceTimer = null

// CSS 기반 렌더링 (debounced)
const renderWithPagedJs = async () => {
  if (isRendering.value) return
  
  // 기존 타이머 클리어
  if (renderDebounceTimer) {
    clearTimeout(renderDebounceTimer)
  }
  
  // 300ms 지연 후 실행 (빠른 연속 변경 시 불필요한 렌더링 방지)
  renderDebounceTimer = setTimeout(async () => {
    await renderWithCssPagedMedia()
  }, 300)
}

// 미리보기 새로고침 (즉시 실행)
const refreshPreview = () => {
  // debounce 타이머를 무시하고 즉시 렌더링
  if (renderDebounceTimer) {
    clearTimeout(renderDebounceTimer)
    renderDebounceTimer = null
  }
  renderWithCssPagedMedia()
}

// 인쇄/PDF 내보내기
const printExam = () => {
  window.print()
}

// 반응형 업데이트 - loadedPassages 변경 감지
watch(loadedPassages, () => {
  renderWithPagedJs()
}, { deep: true })

// 답안지 포함 옵션 변경 시 재렌더링
watch(includeAnswers, () => {
  renderWithPagedJs()
})

// 동적으로 Google Fonts 로드
const loadGoogleFonts = () => {
  // 이미 로드되어 있는지 확인
  if (document.querySelector('link[href*="fonts.googleapis.com"][href*="Noto+Serif+KR"]')) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    // preconnect 링크들 추가
    const preconnect1 = document.createElement('link')
    preconnect1.rel = 'preconnect'
    preconnect1.href = 'https://fonts.googleapis.com'
    document.head.appendChild(preconnect1)

    const preconnect2 = document.createElement('link')
    preconnect2.rel = 'preconnect'
    preconnect2.href = 'https://fonts.gstatic.com'
    preconnect2.crossOrigin = 'anonymous'
    document.head.appendChild(preconnect2)

    // 폰트 스타일시트 로드
    const fontLink = document.createElement('link')
    fontLink.rel = 'stylesheet'
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&display=swap'
    fontLink.onload = () => {
      console.log('Google Fonts loaded for ExamTextEditor')
      resolve()
    }
    fontLink.onerror = () => {
      console.warn('Failed to load Google Fonts, using fallback')
      resolve() // 실패해도 계속 진행
    }
    document.head.appendChild(fontLink)
  })
}

// CSS 기반 A4 페이지네이션 (Paged.js 대신 사용)
const renderWithCssPagedMedia = async () => {
  if (isRendering.value) return
  
  isRendering.value = true
  
  try {
    // 기존 페이지들 제거
    const existingPages = document.querySelectorAll('.css-page')
    existingPages.forEach(el => el.remove())
    
    await nextTick()
    
    if (!contentForPagedjs.value || !previewContainer.value) {
      console.warn('Content element not found')
      return
    }
    
    // 콘텐츠를 A4 페이지로 분할하여 표시
    const content = contentForPagedjs.value.innerHTML.trim()
    if (!content) {
      console.log('No content to render')
      return
    }
    
    // A4 페이지 크기로 분할하여 표시
    const pageContainer = document.createElement('div')
    pageContainer.className = 'css-pages-container'
    
    // 컬럼 모드 클래스 적용
    const columnClass = columnMode.value === 1 ? 'one-column' : 'two-column'
    const updatedContent = content.replace(
      /<main[^>]*>/g, 
      `<main class="${columnClass}">`
    )
    
    pageContainer.innerHTML = `
      <div class="css-page">
        ${updatedContent}
      </div>
    `
    
    previewContainer.value.appendChild(pageContainer)
    
    console.log('CSS-based pagination complete')
    
  } catch (error) {
    console.error('CSS pagination error:', error)
  } finally {
    isRendering.value = false
  }
}

// 컴포넌트 마운트 시 필요한 외부 라이브러리들 로드
onMounted(async () => {
  try {
    // Google Fonts만 로드 (Paged.js는 사용하지 않음)
    await loadGoogleFonts()

    // DOM 업데이트 대기
    await nextTick()
    
    // 약간의 지연 후 CSS 기반 렌더링
    setTimeout(() => {
      renderWithCssPagedMedia()
    }, 300)
    
  } catch (error) {
    console.error('Failed to load external dependencies:', error)
    // 실패해도 기본 렌더링은 시도
    setTimeout(() => {
      renderWithCssPagedMedia()
    }, 300)
  }
})

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  // debounce 타이머 정리
  if (renderDebounceTimer) {
    clearTimeout(renderDebounceTimer)
    renderDebounceTimer = null
  }

  // CSS 페이지 요소들 정리
  const cssPages = document.querySelectorAll('.css-page, .css-pages-container')
  cssPages.forEach(el => el.remove())
})
</script>
<style>
/* CSS 기반 A4 페이지 스타일 */
.css-pages-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.css-page {
  width: 210mm;
  min-height: 297mm;
  max-width: 794px; /* A4 width in pixels at 96dpi */
  background-color: white;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  padding: 15mm 18mm;
  margin-bottom: 20px;
  font-family: 'Noto Serif KR', '나눔명조', 'Nanum Myeongjo', 'Times New Roman', serif;
  color: black;
  font-size: 9.5pt;
  line-height: 1.5;
  position: relative;
  page-break-after: always;
}

/* 문제지 콘텐츠 영역 스타일 (숨김) */
#content-for-pagedjs {
  display: none;
}

/* 2단 컬럼 설정 */
.css-page main.two-column {
  column-count: 2;
  column-gap: 8mm;
  column-rule: 0.5px solid #ccc;
}

/* 1단 컬럼 설정 */
.css-page main.one-column {
  column-count: 1;
  column-rule: none;
}

/* 문제지 내 특정 요소 스타일 */
.css-page .passage-block-preview, 
.css-page .question-block {
  break-inside: avoid-column;
  margin-bottom: 10px;
  text-align: justify;
  font-size: 9.5pt;
}

.css-page .passage-block-preview {
  border: 1px solid black;
  padding: 7px;
  line-height: 1.5;
}

.css-page .passage-range {
  font-weight: 500;
  margin-bottom: 8px;
}

.css-page .question-block p:first-child {
  margin-bottom: 4px;
}

.css-page .question-block .choices {
  padding-left: 12px;
  line-height: 1.45;
}

.css-page .question-block .choices p {
  margin-bottom: 2px;
}

.css-page .question-block .choices div {
  margin-bottom: 2px;
}

/* 보기 박스 스타일 */
.css-page .question-block .보기-box {
  border: 1px solid black;
  padding: 6px;
  margin-top: 5px;
  margin-bottom: 5px;
  font-size: 9pt;
  line-height: 1.45;
}

.css-page .question-block .보기-box .보기-title {
  text-align: center;
  font-weight: 600;
  margin-bottom: 3px;
}

/* 답안지 영역 스타일 */
.css-page .answer-section {
  font-size: 8.5pt;
  break-inside: avoid;
}

.css-page .answer-section .answer {
  font-weight: 500;
}

.css-page .answer-section .description {
  font-size: 8pt;
  line-height: 1.4;
}

/* 빈 상태 스타일 */
.css-page .empty-state {
  break-inside: avoid-column;
}

/* 문제지 제목 */
.css-page .exam-title {
  text-align: center;
  font-size: 14pt;
  margin-bottom: 15px;
}

/* 인쇄 시 스타일 */
@media print {
  body > *:not(.css-pages-container) {
    display: none !important;
  }
  
  .css-page {
    margin: 0 !important;
    box-shadow: none !important;
    break-after: page;
  }
  
  /* 답안지 영역 인쇄 시 배경색 제거 */
  .css-page .answer-section {
    background-color: transparent !important;
    border-left-color: #666 !important;
  }
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .css-page {
    max-width: 95vw;
    width: auto;
    padding: 10mm;
  }
  
  .css-page main.two-column {
    column-count: 1;
    column-rule: none;
  }
}

/* 로딩 애니메이션 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 컨트롤 버튼 스타일 개선 */
button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

select:focus,
input[type="checkbox"]:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* 지문 및 문항 간격 조정 */
.css-page .passages-container > *:not(:last-child) {
  margin-bottom: 15px;
}

.css-page .passage-block-preview + .question-block {
  margin-top: 8px;
}

.css-page .question-block + .question-block {
  margin-top: 6px;
}
</style>