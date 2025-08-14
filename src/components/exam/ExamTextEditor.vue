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

            <!-- 페이지 형식 선택 드롭다운 -->
            <div class="flex items-center gap-2">
                <label class="text-sm font-medium text-gray-700">페이지:</label>
                <select v-model="selectedPageFormat" @change="handlePageFormatChange"
                    class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option v-for="format in pageFormats" :key="format.id" :value="format.id">
                        {{ format.displayName }}
                    </option>
                </select>
                <!-- 현재 페이지 정보 표시 -->
                <span class="text-xs text-gray-500" :title="currentPageFormat.name">
                    {{ currentPageFormat.width }} × {{ currentPageFormat.height }}
                </span>
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
            <div class="flex items-center border border-gray-300 rounded-md">
                <button @click="setColumnMode(1)" 
                    :class="columnMode === 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'"
                    class="px-3 py-1.5 text-sm font-medium rounded-l-md transition">
                    1단
                </button>
                <button @click="setColumnMode(2)"
                    :class="columnMode === 2 ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'"
                    class="px-3 py-1.5 text-sm font-medium rounded-r-md transition">
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
        <div v-else class="a4-pages-container" :key="forceUpdateKey" :style="printStyles">
            <!-- 페이지 정보 표시 -->
            <div v-if="paginatedContent.length > 1" class="page-info text-center mb-4 text-sm text-gray-600">
                총 {{ paginatedContent.length }}페이지 | {{ currentPageFormat.displayName }} | {{ columnMode }}단 레이아웃
            </div>

            <!-- 다중 페이지 렌더링 -->
            <template v-for="(page, pageIndex) in paginatedContent" :key="`page-${page.pageNumber}`">
                <div class="a4-page" :style="pageStyles">
                    <!-- 헤더 -->
                    <header v-html="getRenderedHeader()"></header>
                    
                    <!-- 메인 콘텐츠 -->
                    <main class="page-content" :class="{
                        'single-column': columnMode === 1,
                        'dual-column': columnMode === 2
                    }">
                        <!-- 문제지 제목 (첫 페이지에만) -->
                        <div v-if="examData.title && pageIndex === 0" class="exam-title">
                            <p class="text-center font-bold text-lg">{{ examData.title }}</p>
                        </div>

                        <!-- 페이지별 지문 및 문항 렌더링 -->
                        <div v-if="page.passages.length > 0" class="passages-content">
                            <template v-for="(passage, passageIndex) in page.passages" :key="passage.id">
                                <!-- 지문 범위 표시 -->
                                <div class="passage-range">
                                    [{{ getPassageQuestionRangeForPage(passage, pageIndex) }}] 다음 글을 읽고 물음에 답하시오.
                                </div>
                                
                                <!-- 지문 내용 -->
                                <div class="passage-block-preview">
                                    <div v-html="passage.content"></div>
                                </div>

                                <!-- 문항들 -->
                                <template v-for="(question, questionIndex) in passage.questions" :key="question.queCode">
                                    <div class="question-block">
                                        <p>
                                            <span class="font-bold">{{ getQuestionNumberForPage(passage, questionIndex) }}.</span> 
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

                        <!-- 빈 상태 (모든 페이지가 비어있을 때만) -->
                        <div v-else-if="paginatedContent.length === 1" class="empty-state text-center py-20 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                            <p class="text-base">왼쪽에서 지문을 불러오면</p>
                            <p class="text-base">여기에 문제가 표시됩니다.</p>
                        </div>
                    </main>
                    
                    <!-- 푸터 (페이지 번호 포함) -->
                    <footer class="page-footer">
                        <div v-if="getRenderedFooter()" v-html="getRenderedFooter()"></div>
                        <div v-if="paginatedContent.length > 1" class="page-number text-center text-xs text-gray-500 mt-2">
                            - {{ page.pageNumber }} -
                        </div>
                    </footer>
                </div>
            </template>
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
  getRenderedFooter,
  // 페이지 형식 관련
  pageFormats,
  selectedPageFormat,
  currentPageFormat,
  currentMargins,
  pageStyles,
  printStyles,
  changePageFormat,
  getDefaultColumnCount,
  contentAreaHeight
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

// 페이지별 지문 문항 범위 표시
const getPassageQuestionRangeForPage = (passage) => {
  // 전체 loadedPassages에서 해당 passage의 인덱스 찾기
  const passageIndex = loadedPassages.value.findIndex(p => p.id === passage.id)
  if (passageIndex === -1) return '1'
  
  return getPassageQuestionRange(passageIndex)
}

// 페이지별 문항 번호 계산
const getQuestionNumberForPage = (passage, questionIndex) => {
  // 전체 loadedPassages에서 해당 passage의 인덱스 찾기
  const passageIndex = loadedPassages.value.findIndex(p => p.id === passage.id)
  if (passageIndex === -1) return questionIndex + 1
  
  return getQuestionNumber(passageIndex, questionIndex)
}

// 레이아웃 변경 핸들러
const handleLayoutChange = () => {
  changeLayout(selectedLayoutId.value)
  // Vue의 반응성에 의해 자동으로 업데이트됨
}

// 페이지 형식 변경 핸들러
const handlePageFormatChange = () => {
  changePageFormat(selectedPageFormat.value)
  console.log('페이지 형식 변경됨:', selectedPageFormat.value)
}

// 컬럼 모드 변경
const setColumnMode = (mode) => {
  columnMode.value = mode
  // Vue의 반응성에 의해 자동으로 업데이트됨
}


// 미리보기 새로고침
const refreshPreview = async () => {
  console.log('미리보기 강제 새로고침')
  isRendering.value = true
  forceUpdateKey.value++
  
  await nextTick()
  await paginateContent()
  
  setTimeout(() => {
    isRendering.value = false
  }, 100)
}

// 인쇄/PDF 내보내기
const printExam = () => {
  window.print()
}

// ========== 콘텐츠 높이 측정 및 페이지 분할 ==========

// 측정용 임시 컨테이너 요소
const measureContainer = ref(null)

// 현재 콘텐츠 높이
const currentContentHeight = ref(0)

// 필요한 페이지 수
const requiredPages = computed(() => {
  if (currentContentHeight.value === 0) return 1
  return Math.ceil(currentContentHeight.value / contentAreaHeight.value)
})

// 페이지별로 분할된 콘텐츠 (초기값: 빈 페이지 1개)
const paginatedContent = ref([{
  pageNumber: 1,
  passages: []
}])

/**
 * DOM 요소의 실제 높이 측정
 * @param {HTMLElement} element - 측정할 요소
 * @returns {number} 높이 (픽셀)
 */
const measureElementHeight = (element) => {
  if (!element) return 0
  
  const rect = element.getBoundingClientRect()
  const styles = window.getComputedStyle(element)
  const marginTop = parseFloat(styles.marginTop) || 0
  const marginBottom = parseFloat(styles.marginBottom) || 0
  
  return rect.height + marginTop + marginBottom
}

/**
 * 콘텐츠 전체 높이 측정
 */
const measureContentHeight = async () => {
  await nextTick()
  
  const contentElement = document.querySelector('.passages-content')
  if (!contentElement) {
    currentContentHeight.value = 0
    return
  }
  
  let totalHeight = 0
  
  // 헤더 높이 측정
  const headerElement = document.querySelector('.a4-page header')
  if (headerElement) {
    totalHeight += measureElementHeight(headerElement)
  }
  
  // 제목 높이 측정
  const titleElement = document.querySelector('.exam-title')
  if (titleElement) {
    totalHeight += measureElementHeight(titleElement)
  }
  
  // 모든 지문과 문항 높이 측정
  const passages = contentElement.children
  for (let i = 0; i < passages.length; i++) {
    totalHeight += measureElementHeight(passages[i])
  }
  
  // 푸터 높이 측정
  const footerElement = document.querySelector('.a4-page footer')
  if (footerElement) {
    totalHeight += measureElementHeight(footerElement)
  }
  
  currentContentHeight.value = totalHeight
  console.log(`전체 콘텐츠 높이: ${totalHeight}px, 페이지당: ${contentAreaHeight.value}px, 필요 페이지: ${requiredPages.value}`)
}

/**
 * 콘텐츠를 페이지별로 분할
 */
const paginateContent = async () => {
  await measureContentHeight()
  
  if (requiredPages.value <= 1) {
    // 단일 페이지인 경우
    paginatedContent.value = [{
      pageNumber: 1,
      passages: loadedPassages.value
    }]
    return
  }
  
  // 다중 페이지인 경우 분할 로직
  const pages = []
  let currentPageHeight = 0
  let currentPagePassages = []
  let pageNumber = 1
  
  // 헤더와 제목 높이 계산
  const fixedHeaderHeight = 100 // 대략적인 헤더 높이
  const pageCapacity = contentAreaHeight.value - fixedHeaderHeight
  
  for (const passage of loadedPassages.value) {
    // 지문 요소의 예상 높이 계산 (대략적)
    const estimatedPassageHeight = estimatePassageHeight(passage)
    
    // 현재 페이지에 추가할 수 있는지 확인
    if (currentPageHeight + estimatedPassageHeight > pageCapacity && currentPagePassages.length > 0) {
      // 새 페이지 시작
      pages.push({
        pageNumber: pageNumber++,
        passages: [...currentPagePassages]
      })
      currentPagePassages = [passage]
      currentPageHeight = estimatedPassageHeight
    } else {
      // 현재 페이지에 추가
      currentPagePassages.push(passage)
      currentPageHeight += estimatedPassageHeight
    }
  }
  
  // 마지막 페이지 추가
  if (currentPagePassages.length > 0) {
    pages.push({
      pageNumber: pageNumber,
      passages: currentPagePassages
    })
  }
  
  paginatedContent.value = pages
  console.log(`${pages.length}개 페이지로 분할 완료`)
}

/**
 * 지문의 예상 높이 계산 (HTML 콘텐츠 기반)
 * @param {Object} passage - 지문 객체
 * @returns {number} 예상 높이 (픽셀)
 */
const estimatePassageHeight = (passage) => {
  let height = 0
  
  // 지문 범위 표시 (~20px)
  height += 25
  
  // 지문 내용 (글자 수 기반 대략 계산)
  const contentLength = passage.content.replace(/<[^>]*>/g, '').length
  height += Math.ceil(contentLength / 100) * 20 // 대략 100자당 20px
  
  // 문항들
  passage.questions.forEach(question => {
    height += 30 // 문항 제목
    
    if (question.queSubpassage) {
      const subLength = question.queSubpassage.replace(/<[^>]*>/g, '').length
      height += Math.ceil(subLength / 80) * 18 + 40 // 보기 박스
    }
    
    if (question.queOption) {
      const optionLength = question.queOption.replace(/<[^>]*>/g, '').length
      height += Math.ceil(optionLength / 60) * 16 // 선택지
    }
    
    if (includeAnswers.value && (question.queAnswer || question.queDescription)) {
      height += 50 // 답안 영역
    }
  })
  
  return height
}

// 반응형 데이터 변경 감지 및 자동 페이지 분할
watch(loadedPassages, async () => {
  console.log('loadedPassages changed - updating preview and paginating')
  forceUpdateKey.value++
  await nextTick()
  await paginateContent()
}, { deep: true })

watch(includeAnswers, async () => {
  console.log('includeAnswers changed - re-paginating')
  await nextTick()
  await paginateContent()
})

watch(selectedLayoutId, async () => {
  console.log('selectedLayoutId changed - updating preview')
  await nextTick()
  await paginateContent()
})

watch(() => examData.value?.title, async () => {
  console.log('examData.title changed - updating preview')
  await nextTick()
  await paginateContent()
})

watch(columnMode, async () => {
  console.log('columnMode changed - re-paginating')
  await nextTick()
  await paginateContent()
})

watch(selectedPageFormat, async () => {
  console.log('pageFormat changed - re-paginating')
  await nextTick()
  await paginateContent()
})

// 페이지 형식이나 여백이 변경될 때도 재분할
watch(contentAreaHeight, async () => {
  console.log('contentAreaHeight changed - re-paginating')
  await nextTick()
  await paginateContent()
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
    
    // 초기 페이지 분할 실행
    setTimeout(async () => {
      await paginateContent()
    }, 500) // 폰트 로딩 후 약간의 지연
    
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

/* A4 페이지 스타일 (크기와 여백은 동적으로 설정됨) */
.a4-page {
  background-color: white;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  font-family: 'Noto Serif KR', '나눔명조', 'Nanum Myeongjo', 'Times New Roman', serif;
  color: black;
  font-size: 9.5pt;
  line-height: 1.5;
  position: relative;
  /* width, height, padding은 :style로 동적 바인딩됨 */
}

/* 헤더 스타일 */
.a4-page header {
  margin-bottom: 12px;
}

/* 푸터 스타일 */
.a4-page footer {
  margin-top: 12px;
}

/* 페이지 번호 스타일 */
.page-number {
  font-family: 'Times New Roman', serif;
  margin-top: 8px;
}

/* 페이지 정보 스타일 */
.page-info {
  background-color: rgba(59, 130, 246, 0.1);
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  font-weight: 500;
}

/* 페이지 콘텐츠 영역 */
.page-content {
  text-align: justify;
}

/* 1단 컬럼 설정 */
.page-content.single-column {
  column-count: 1;
  column-rule: none;
}

/* 2단 컬럼 설정 */
.page-content.dual-column {
  column-count: 2;
  column-gap: 8mm;
  column-rule: 0.5px solid #ccc;
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

/* 인쇄 시 스타일 (동적 CSS 변수 사용) */
@media print {
  @page {
    size: var(--page-width, A4) var(--page-height, 297mm);
    margin: var(--page-margin-top, 15mm) var(--page-margin-right, 18mm) 
            var(--page-margin-bottom, 15mm) var(--page-margin-left, 18mm);
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
    padding: var(--page-margin-top, 20mm) var(--page-margin-right, 20mm) 
             var(--page-margin-bottom, 20mm) var(--page-margin-left, 20mm) !important;
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
    max-width: 95vw !important;
    width: auto !important;
    padding: 10mm !important;
  }
  
  /* 모바일에서는 모든 컬럼을 1단으로 */
  .page-content.dual-column {
    column-count: 1 !important;
    column-rule: none !important;
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