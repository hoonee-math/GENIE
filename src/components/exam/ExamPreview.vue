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
            <button @click="refreshPreview"
                class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

    <!-- vue-print-preview 영역 -->
    <div class="flex-1 overflow-auto bg-gray-100 p-6">
        <!-- 빈 상태 표시 -->
        <div v-if="loadedPassages.length === 0" class="text-center py-20 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <p class="text-base">왼쪽에서 지문을 불러오면</p>
            <p class="text-base">여기에 문제가 표시됩니다.</p>
        </div>
        
        <!-- vue-print-preview 컴포넌트 -->
        <PreviewPages 
            v-else
            ref="printPreviewRef"
            :key="previewKey"
            :preset="getPresetFromFormat()"
            :content="passagesHtmlContent"
            :header="getRenderedHeader()"
            :page-top="getRenderedTop()"
            :footer="getRenderedFooter()"
            :custom-margins="customMarginsConfig"
        />
    </div>
</template>

<script setup>
import { ref, computed, watch, inject, nextTick } from 'vue'
import { PreviewPages } from 'vue-print-preview'

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
  getRenderedTop,
  // 페이지 형식 관련
  pageFormats,
  selectedPageFormat,
  currentPageFormat,
  currentMargins,
  printStyles,
  changePageFormat,
} = inject('generateExam')

// 컴포넌트 상태
const includeAnswers = ref(false) // 답안지 포함 여부
const columnMode = ref(2) // 1단 또는 2단 컬럼
const previewKey = ref(0) // 강제 업데이트를 위한 키
const printPreviewRef = ref() // vue-print-preview 컴포넌트 ref

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

// 단일 문항 HTML 생성
const generateQuestionHtml = (passage, question, questionIndex, passageIndex) => {
  const questionNumber = getQuestionNumber(passageIndex, questionIndex)
  
  let html = `<div class="question-item mb-[10px] text-justify" style="break-inside: avoid; page-break-inside: avoid;">
    <div class="question-header flex mb-[10px]">
      <span class="question-number mr-1 font-medium">${questionNumber}.</span> 
      <div class="question-text">${question.queQuery}</div>
    </div>`
  
  // 보기 박스 (queSubpassage가 있는 경우)
  if (question.queSubpassage) {
    html += `<div class="question-subpassage border border-gray-600 p-2 mb-2">
      <div class="text-center font-medium">&lt;보 기&gt;</div>
      <div class="subpassage-content">${question.queSubpassage}</div>
    </div>`
  }
  
  // 선택지
  if (question.queOption) {
    html += `<div class="question-choices pl-0.5 mb-4" style="line-height: 1.45;">
      <div class="choices-content">${question.queOption}</div>
    </div>`
  }

  // 답안지 포함 시 정답 및 해설
  if (includeAnswers.value && (question.queAnswer || question.queDescription)) {
    html += `<div class="answer-section bg-gray-50 p-2 mt-2 rounded" style="break-inside: avoid;">`
    if (question.queAnswer) {
      html += `<div class="answer mb-1"><span class="font-bold text-blue-600">정답:</span> ${question.queAnswer}</div>`
    }
    if (question.queDescription) {
      html += `<div class="description text-sm text-gray-700">${question.queDescription}</div>`
    }
    html += `</div>`
  }
  
  html += `</div>`
  return html
}

// 전체 passages 콘텐츠를 HTML 문자열로 생성 (순수한 데이터만, 레이아웃은 라이브러리가 관리)
const passagesHtmlContent = computed(() => {
  let html = ''
  
  // 각 지문 및 문항 렌더링
  loadedPassages.value.forEach((passage, passageIndex) => {
    // 지문 전체 컨테이너 (범위 + 내용을 함께 묶어서 분리 방지)
    html += `<div class="passage-container mb-4" style="page-break-inside: avoid;">
      <!-- 지문 범위 표시 -->
      <div class="passage-range mb-2 font-medium">
        [${getPassageQuestionRange(passageIndex)}] 다음 글을 읽고 물음에 답하시오.
      </div>
      
      <!-- 지문 내용 -->
      <div class="passage-content border border-gray-600 p-2 text-justify mb-3">
        <div>${passage.content}</div>
      </div>
    </div>`

    // 문항들을 그룹으로 묶기
    html += `<div class="questions-group">`
    passage.questions.forEach((question, questionIndex) => {
      html += generateQuestionHtml(passage, question, questionIndex, passageIndex)
    })
    html += `</div>`
  })

  console.log("=======================================")
  console.log("=======================================")
  console.log(html)
  console.log("=======================================")
  console.log("=======================================")
  
  return html
})

// 페이지 형식을 vue-print-preview preset으로 변환
const getPresetFromFormat = () => {
  const formatMap = {
    'a4': 'A4',
    'a3': 'A3', 
    'b3': 'B3',
    'letter': 'LETTER'
  }
  return formatMap[selectedPageFormat.value] || 'A4'
}

// vue-print-preview용 커스텀 여백 설정
const customMarginsConfig = computed(() => {
  const margins = currentMargins.value
  
  // mm 단위 문자열을 숫자로 변환
  const parseMargin = (margin) => {
    return parseFloat(margin.replace('mm', ''))
  }
  
  return {
    top: 8,//parseMargin(margins.top),
    right: 8,//parseMargin(margins.right),
    bottom: 8,//parseMargin(margins.bottom),
    left: 8,//parseMargin(margins.left),
    columns: columnMode.value,
    columnGap: 8 // mm
  }
})

// 레이아웃 변경 핸들러
const handleLayoutChange = () => {
  changeLayout(selectedLayoutId.value)
}

// 페이지 형식 변경 핸들러
const handlePageFormatChange = () => {
  changePageFormat(selectedPageFormat.value)
  console.log('페이지 형식 변경됨:', selectedPageFormat.value)
}

// 컬럼 모드 변경
const setColumnMode = (mode) => {
  columnMode.value = mode
  // 강제 리렌더링 (vue-print-preview 컴포넌트 업데이트)
  previewKey.value++
}

// 미리보기 새로고침
const refreshPreview = () => {
  console.log('미리보기 강제 새로고침')
  previewKey.value++
}

// 인쇄/PDF 내보내기 - vue-print-preview 컴포넌트의 printPreview 함수 사용
const printExam = () => {
  if (printPreviewRef.value && printPreviewRef.value.printPreview) {
    console.log('🚀 vue-print-preview 컴포넌트 인쇄 함수 호출')
    printPreviewRef.value.printPreview()
  } else {
    console.warn('⚠️ vue-print-preview 컴포넌트를 찾을 수 없습니다. 기본 인쇄로 대체')
    window.print()
  }
}

// 반응형 데이터 변경 감지 및 자동 업데이트
watch(loadedPassages, () => {
  console.log('loadedPassages changed - updating preview')
  previewKey.value++
}, { deep: true })

watch(includeAnswers, () => {
  console.log('includeAnswers changed - updating preview')
  previewKey.value++
})

watch(selectedLayoutId, () => {
  console.log('selectedLayoutId changed - updating preview')
  previewKey.value++
})

watch(() => examData.value?.title, () => {
  console.log('examData.title changed - updating preview')
  previewKey.value++
})

watch(columnMode, () => {
  console.log('columnMode changed - updating preview')
  previewKey.value++
})

watch(selectedPageFormat, () => {
  console.log('pageFormat changed - updating preview')
  previewKey.value++
})

// customMarginsConfig 변경 감지
watch(customMarginsConfig, (newConfig) => {
  console.log('🔧 customMarginsConfig changed:', newConfig)
}, { deep: true })
</script>

<style>
/* 선택지 스타일 */
.question-block .choices {
  padding-left: 12px;
  line-height: 1.45;
}

.question-block .choices p {
  margin-bottom: 2px;
}

/* 답안지 영역 스타일 */
.answer-section {
  font-size: 8.5pt;
  margin-top: 8px;
  padding: 6px;
  background-color: #f8f9fa;
  border-left: 4px solid #3b82f6;
  break-inside: avoid;
}

.answer-section .answer {
  font-weight: 500;
  margin-bottom: 4px;
}

.answer-section .description {
  font-size: 8pt;
  line-height: 1.4;
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

</style>