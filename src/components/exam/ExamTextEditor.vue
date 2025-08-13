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

    <!-- A4 미리보기 영역 (CSS 기반) -->
    <div class="flex-1 overflow-auto bg-gray-100 p-6">
        <!-- 로딩 상태 표시 -->
        <div v-if="isRendering" class="text-center py-20">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">문제지를 업데이트하는 중...</p>
        </div>
        
        <!-- A4 페이지 컨테이너 -->
        <div v-else class="a4-pages-container" :key="forceUpdateKey">
            <div class="a4-page">
                <!-- 헤더 -->
                <header v-html="getRenderedHeader()"></header>
                
                <!-- 메인 콘텐츠 -->
                <main class="page-content" :class="columnMode === 1 ? 'single-column' : 'dual-column'">
                    <!-- 문제지 제목 -->
                    <div v-if="examData.title" class="exam-title">
                        <p class="text-center font-bold text-lg">{{ examData.title }}</p>
                    </div>

                    <!-- 지문 및 문항 렌더링 -->
                    <div v-if="loadedPassages.length > 0" class="passages-content">
                        <template v-for="(passage, passageIndex) in loadedPassages" :key="passage.id">
                            <!-- 지문 범위 표시 -->
                            <div class="passage-range">
                                [{{ getPassageQuestionRange(passageIndex) }}] 다음 글을 읽고 물음에 답하시오.
                            </div>
                            
                            <!-- 지문 내용 -->
                            <div class="passage-block-preview">
                                <div v-html="passage.content"></div>
                            </div>

                            <!-- 문항들 -->
                            <template v-for="(question, questionIndex) in passage.questions" :key="question.queCode">
                                <div class="question-block">
                                    <p>
                                        <span class="font-bold">{{ getQuestionNumber(passageIndex, questionIndex) }}.</span> 
                                        <span v-html="question.queQuery"></span>
                                    </p>
                                    
                                    <!-- 보기 박스 (queSubpassage가 있는 경우) -->
                                    <div v-if="question.queSubpassage" class="보기-box">
                                        <div class="보기-title">&lt;보 기&gt;</div>
                                        <div v-html="question.queSubpassage"></div>
                                    </div>
                                    
                                    <!-- 선택지 -->
                                    <div v-if="question.queOption" class="choices">
                                        <div v-html="question.queOption"></div>
                                    </div>

                                    <!-- 답안지 포함 시 정답 및 해설 -->
                                    <div v-if="includeAnswers && (question.queAnswer || question.queDescription)" 
                                         class="answer-section">
                                        <div v-if="question.queAnswer" class="answer">
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
                
                <!-- 푸터 -->
                <footer v-if="getRenderedFooter()" v-html="getRenderedFooter()"></footer>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, inject } from 'vue'

// 부모 컴포넌트에서 제공하는 공유 composable 인스턴스 사용
const {
  examData,
  loadedPassages,
  paperLayouts,
  selectedLayoutId,
  selectedLayout,
  changeLayout,
  getRenderedHeader,
  getRenderedFooter
} = inject('generateExam')

// 컴포넌트 상태
const includeAnswers = ref(false) // 답안지 포함 여부
const columnMode = ref(2) // 1단 또는 2단 컬럼
const isRendering = ref(false) // 렌더링 상태 (템플릿에서 사용)
const forceUpdateKey = ref(0) // 강제 업데이트를 위한 키

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
  // Vue의 반응성에 의해 자동으로 업데이트됨
}

// 컬럼 모드 변경
const setColumnMode = (mode) => {
  columnMode.value = mode
  // Vue의 반응성에 의해 자동으로 업데이트됨
}

// 미리보기 새로고침
const refreshPreview = async () => {
  console.log('미리보기 강제 새로고침')
  forceUpdateKey.value++
  isRendering.value = true
  await nextTick()
  setTimeout(() => {
    isRendering.value = false
  }, 100)
}

// 인쇄/PDF 내보내기
const printExam = () => {
  window.print()
}

// 반응형 데이터 변경 감지
watch(loadedPassages, () => {
  console.log('loadedPassages changed - updating preview')
  forceUpdateKey.value++
}, { deep: true })

watch(includeAnswers, () => {
  console.log('includeAnswers changed - updating preview')
})

watch(selectedLayoutId, () => {
  console.log('selectedLayoutId changed - updating preview')
})

watch(() => examData.value.title, () => {
  console.log('examData.title changed - updating preview')
})

watch(columnMode, () => {
  console.log('columnMode changed - updating preview')
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

// 컴포넌트 마운트 시 초기화
onMounted(async () => {
  try {
    await loadGoogleFonts()
    console.log('ExamTextEditor mounted successfully')
  } catch (error) {
    console.error('Failed to initialize ExamTextEditor:', error)
  }
})
</script>
<style>
/* A4 페이지 컨테이너 */
.a4-pages-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px; /* 페이지 간격 4px */
  padding: 20px;
}

/* A4 페이지 스타일 */
.a4-page {
  width: 210mm;
  min-height: 297mm;
  max-width: 794px; /* A4 width in pixels at 96dpi */
  background-color: white;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  padding: 15mm 18mm;
  font-family: 'Noto Serif KR', '나눔명조', 'Nanum Myeongjo', 'Times New Roman', serif;
  color: black;
  font-size: 9.5pt;
  line-height: 1.5;
  position: relative;
}

/* 헤더 스타일 */
.a4-page header {
  margin-bottom: 12px;
}

/* 푸터 스타일 */
.a4-page footer {
  margin-top: 12px;
}

/* 페이지 콘텐츠 영역 */
.page-content {
  text-align: justify;
}

/* 2단 컬럼 설정 */
.page-content.dual-column {
  column-count: 2;
  column-gap: 8mm;
  column-rule: 0.5px solid #ccc;
}

/* 1단 컬럼 설정 */
.page-content.single-column {
  column-count: 1;
  column-rule: none;
}

/* 문제지 제목 */
.exam-title {
  text-align: center;
  font-size: 14pt;
  margin-bottom: 15px;
  column-span: all; /* 컬럼을 가로질러 표시 */
}

/* 지문 콘텐츠 영역 */
.passages-content {
  /* 컬럼 내에서 자연스럽게 배치 */
}

/* 지문 범위 표시 */
.passage-range {
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 9.5pt;
  break-inside: avoid-column;
}

/* 지문 내용 박스 */
.passage-block-preview {
  border: 1px solid black;
  padding: 7px;
  line-height: 1.5;
  margin-bottom: 10px;
  text-align: justify;
  break-inside: avoid-column;
}

/* 문항 블록 */
.question-block {
  margin-bottom: 10px;
  text-align: justify;
  font-size: 9.5pt;
  break-inside: avoid-column;
}

.question-block p:first-child {
  margin-bottom: 4px;
}

/* 선택지 스타일 */
.question-block .choices {
  padding-left: 12px;
  line-height: 1.45;
}

.question-block .choices p {
  margin-bottom: 2px;
}

.question-block .choices div {
  margin-bottom: 2px;
}

/* 보기 박스 스타일 */
.question-block .보기-box {
  border: 1px solid black;
  padding: 6px;
  margin-top: 5px;
  margin-bottom: 5px;
  font-size: 9pt;
  line-height: 1.45;
  break-inside: avoid-column;
}

.question-block .보기-box .보기-title {
  text-align: center;
  font-weight: 600;
  margin-bottom: 3px;
}

/* 답안지 영역 스타일 */
.answer-section {
  font-size: 8.5pt;
  margin-top: 8px;
  padding: 6px;
  background-color: #f8f9fa;
  border-left: 4px solid #3b82f6;
  break-inside: avoid-column;
}

.answer-section .answer {
  font-weight: 500;
  margin-bottom: 4px;
}

.answer-section .description {
  font-size: 8pt;
  line-height: 1.4;
}

/* 빈 상태 스타일 */
.empty-state {
  break-inside: avoid-column;
  column-span: all; /* 컬럼을 가로질러 표시 */
}

/* 지문 및 문항 간격 조정 */
.passages-content > *:not(:last-child) {
  margin-bottom: 15px;
}

.passage-block-preview + .question-block {
  margin-top: 8px;
}

.question-block + .question-block {
  margin-top: 6px;
}

/* 인쇄 시 스타일 */
@media print {
  @page {
    size: A4;
    margin: 15mm 18mm;
  }
  
  /* 다른 모든 요소 숨기기 */
  body * {
    visibility: hidden;
  }
  
  /* A4 페이지와 하위 요소들만 보이기 */
  .a4-pages-container,
  .a4-pages-container *,
  .a4-page,
  .a4-page * {
    visibility: visible;
  }
  
  /* A4 페이지 컨테이너를 전체 페이지로 확장 */
  .a4-pages-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: block !important;
    padding: 0 !important;
    margin: 0 !important;
    gap: 0 !important;
  }
  
  .a4-page {
    width: 100% !important;
    height: 100vh !important;
    margin: 0 !important;
    padding: 20mm !important;
    box-shadow: none !important;
    page-break-after: always;
    display: block;
  }
  
  /* 답안지 영역 인쇄 시 배경색 제거 */
  .answer-section {
    background-color: transparent !important;
    border-left: 2px solid #666 !important;
  }
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .a4-page {
    max-width: 95vw;
    width: auto;
    padding: 10mm;
  }
  
  .page-content.dual-column {
    column-count: 1;
    column-rule: none;
  }
  
  .a4-pages-container {
    padding: 10px;
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

/* 컬럼 브레이크 방지 */
.passage-range,
.question-block,
.보기-box {
  break-inside: avoid-column;
}
</style>