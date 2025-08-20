// src/composables/useGenerateExam.js - 문제지 생성 관련 Vue Composition API
import { ref, reactive, computed } from 'vue'
import { usePassage } from '@/composables/usePassage'

/**
 * 문제지 생성 관련 Vue Composition API
 * - 지문 및 문제 관리
 * - 드래그 앤 드롭 기능
 * - 접기/펴기 상태 관리
 * - 자동 번호 매기기
 */
export function useGenerateExam() {
  const { fetchPassage } = usePassage()

  // ========== 반응형 상태 ==========
  const examData = ref({
    title: '' // 문제지 제목만 유지, 헤더/푸터는 paperLayout으로 대체
  })

  // ========== 문제지 레이아웃 템플릿 시스템 ==========
  const paperLayouts = ref([
    {
      id: 'suneung-style',
      name: '수능형 레이아웃',
      description: '대학수학능력시험 모의평가 스타일',
      header: `<div class="flex justify-between items-start mb-[6px]">
        <span class="border border-black rounded-full px-[7px] py-[1.5px] text-[9.5pt] mt-[2px]">제 <span class="font-bold">1</span> 교시</span>
        <div class="text-center">
          <p class="text-[10pt] font-[600] tracking-tight">2025학년도 대학수학능력시험 모의평가 문제지</p>
          <p class="text-[24pt] font-bold leading-none mt-[2px] mb-[3px]">국 어 영 역</p>
        </div>
        <div class="text-right">
          <p class="font-bold text-[18pt] leading-none">{{pageNumber}}</p>
          <span class="inline-block bg-black text-white px-[5px] py-[1px] text-[8.5pt] font-semibold tracking-wider mt-[2px]">홀수형</span>
        </div>
      </div>
      <hr class="border-black border-t-[1.2px] mt-[4px] mb-[1px]">
      <hr class="border-black border-t-[0.6px] mb-4">`,
      top: `
      <p class="font-bold text-[18pt] leading-none">{{pageNumber}}</p>
      <hr class="border-black border-t-[1.2px] mt-[4px] mb-[1px]">
      <hr class="border-black border-t-[0.6px] mb-4">`, // @page @top-* 영역용
      footer: `<div class="text-center text-[10px]"><p class="mt-4">페이지 {{pageNumber}}/{{totalPages}}</p></div>`
    },
    {
      id: 'simple-style',
      name: '심플 레이아웃',
      description: '깔끔하고 단순한 스타일',
      header: `<div class="text-center mb-4 border-b-2 border-gray-800 pb-3">
        <h1 class="text-2xl font-bold text-gray-900 mb-1">문제지</h1>
        <p class="text-sm text-gray-600">{{title}}</p>
      </div>`,
      top: '',
      footer: '<p>{{pageNumber}}/{{totalPages}}</p>'
    },
    {
      id: 'modern-style',
      name: '모던 레이아웃',
      description: '현대적이고 세련된 스타일',
      header: `<div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 mb-6 -mx-4 -mt-4">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-xl font-bold">{{title}}</h1>
            <p class="text-blue-100 text-sm mt-1">EXAM PAPER</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold">PAGE 1</p>
          </div>
        </div>
      </div>`,
      top: '',
      footer: '<div class="text-center text-xs text-gray-500 mt-6 pt-2 border-t border-gray-200">© 2025 GENIE PLATFORM</div>'
    }
  ])

  // 선택된 레이아웃 ID
  const selectedLayoutId = ref('suneung-style')

  // ========== 페이지 형식 설정 시스템 ==========
  const pageFormats = ref([
    {
      id: 'a4',
      name: 'A4 (210×297mm)',
      displayName: 'A4',
      width: '210mm',
      height: '297mm',
      widthPx: 794, // A4 width in pixels at 96dpi (210mm = 794px)
      heightPx: 1123, // A4 height in pixels at 96dpi (297mm = 1123px)
      defaultMargins: { 
        top: '15mm', 
        right: '18mm', 
        bottom: '15mm', 
        left: '18mm' 
      }
    },
    {
      id: 'b3',
      name: 'B3 (353×500mm)',
      displayName: 'B3',
      width: '353mm',
      height: '500mm',
      widthPx: 1335, // B3 width in pixels at 96dpi
      heightPx: 1890, // B3 height in pixels at 96dpi
      defaultMargins: { 
        top: '20mm', 
        right: '25mm', 
        bottom: '20mm', 
        left: '25mm' 
      }
    },
    {
      id: 'a3',
      name: 'A3 (297×420mm)',
      displayName: 'A3',
      width: '297mm',
      height: '420mm',
      widthPx: 1123, // A3 width in pixels at 96dpi
      heightPx: 1587, // A3 height in pixels at 96dpi
      defaultMargins: { 
        top: '20mm', 
        right: '20mm', 
        bottom: '20mm', 
        left: '20mm' 
      }
    }
  ])

  // 선택된 페이지 형식 ID
  const selectedPageFormat = ref('a4')
  
  // 사용자 커스텀 여백 (null이면 기본값 사용)
  const customMargins = ref(null)

  const loadedPassages = ref([
  
  ])
  const isLoading = ref(false)
  const error = ref(null)

  // ========== HTML 포맷팅 유틸리티 ==========
  
  /**
   * HTML 콘텐츠 포맷팅 함수
   * @param {string} content - 포맷팅할 콘텐츠
   * @param {string} defaultText - 기본 텍스트
   */
  const formatHtmlContent = (content, defaultText = '내용을 입력하세요') => {
    if (!content) return `<p>${defaultText}</p>`
    
    const trimmed = content.trim()
    
    // 이미 HTML 태그가 있으면 그대로 반환
    if (trimmed.startsWith('<') && trimmed.includes('>')) {
      return trimmed
    }
    
    // HTML 태그가 없으면 <p> 태그로 감싸기
    return `<p>${trimmed}</p>`
  }

  /**
   * 지문 데이터를 loadedPassages 형식으로 변환
   * @param {Object} passageData - 원본 지문 데이터
   * @param {Object} options - 옵션 { isExpanded: boolean }
   */
  const createNewPassage = (passageData, options = {}) => {
    const { isExpanded = true } = options
    
    return {
      id: (passageData.pasCode || Date.now()) + '-' + Date.now() + Math.random(), // 고유한 ID 생성
      pasCode: passageData.pasCode,
      title: formatHtmlContent(passageData.title, '지문 제목을 입력하세요'),
      content: formatHtmlContent(passageData.content, '지문 내용을 입력하세요'),
      type: passageData.generateType || passageData.type || determinePassageType(passageData.descriptions),
      isExpanded,
      questions: (passageData.questions || []).map(q => ({
        queCode: q.queCode,
        queQuery: formatHtmlContent(
          q.content || q.text || q.queQuery || '문제의 문제문', 
          '문제를 입력하세요'
        ),
        queOption: q.options || q.queOption || [],
        queAnswer: q.answer || q.queAnswer || '',
        queDescription: q.explanation || q.queDescription || '',
        queSubpassage: q.queSubpassage || ''
      })),
      descriptions: passageData.descriptions || []
    }
  }

  // ========== 지문 관리 ==========

  /**
   * 지문을 loadedPassages에 추가
   * @param {Object|Array} passageDataOrArray - 지문 데이터 또는 지문 배열
   * @param {Object} options - 옵션 { isExpanded: boolean }
   */
  const addPassagesToLoaded = (passageDataOrArray, options = {}) => {
    const passagesArray = Array.isArray(passageDataOrArray) 
      ? passageDataOrArray 
      : [passageDataOrArray]
    
    const addedPassages = []
    
    passagesArray.forEach(passageData => {
      const newPassage = createNewPassage(passageData, options)
      loadedPassages.value.push(newPassage)
      addedPassages.push(newPassage)
    })
    
    return addedPassages
  }

  /**
   * 사용하지 않는 함수!!
   * 지문을 로드하고 문제지에 추가 (API 호출)
   * @param {number} pasCode - 지문 코드
   * @param {Object} options - 옵션 { isExpanded: boolean }
   */
  const loadPassage = async (pasCode, options = {}) => {
    if (isLoading.value) return false

    isLoading.value = true
    error.value = null

    try {
      console.log('지문 로드 시작:', pasCode)

      // usePassage composable을 통해 지문 데이터 가져오기
      const passageData = await fetchPassage(pasCode, { includeQuestions: true })

      if (!passageData) {
        throw new Error('지문 데이터를 찾을 수 없습니다.')
      }

      // 지문을 loadedPassages에 추가
      const [newPassage] = addPassagesToLoaded(passageData, options)

      console.log('지문 로드 완료:', newPassage.title)
      return true

    } catch (err) {
      console.error('지문 로드 실패:', err)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 지문 타입 결정 (descriptions 배열 기반)
   * @param {Array} descriptions - 지문 설명 배열
   */
  const determinePassageType = (descriptions) => {
    if (!descriptions || descriptions.length === 0) return '단일 지문'

    if (descriptions.length > 1) return '복합 지문'
    if (descriptions[0]?.pasType === '독서론') return '독서론'
    return '단일 지문'
  }

  /**
   * 지문 제거
   * @param {number} passageId - 지문 ID
   */
  const removePassage = (passageId) => {
    const index = loadedPassages.value.findIndex(p => p.id === passageId)
    if (index !== -1) {
      loadedPassages.value.splice(index, 1)
    }
  }

  /**
   * 지문 순서 변경
   * @param {number} oldIndex - 이전 인덱스
   * @param {number} newIndex - 새 인덱스
   */
  const reorderPassages = (oldIndex, newIndex) => {
    const passages = [...loadedPassages.value]
    const [removed] = passages.splice(oldIndex, 1)
    passages.splice(newIndex, 0, removed)
    loadedPassages.value = passages
  }

  // ========== 문제 관리 ==========

  /**
   * 문제 추가
   * @param {number} passageId - 지문 ID
   * @param {string} questionText - 문제 텍스트
   */
  const addQuestion = (passageId, questionText = '새로운 문제를 입력하세요') => {
    const passage = loadedPassages.value.find(p => p.id === passageId)
    if (passage) {
      const newQuestion = {
        queCode: Date.now(), // 새 문항의 임시 queCode (실제로는 서버에서 할당)
        queQuery: formatHtmlContent(questionText, '문제를 입력하세요'),
        queOption: '',
        queAnswer: '',
        queDescription: '',
        queSubpassage: ''
      }
      passage.questions.push(newQuestion)
    }
  }

  /**
   * 문제 삭제
   * @param {number} passageId - 지문 ID
   * @param {number} questionId - 문제 ID
   */
  const deleteQuestion = (passageId, questionId) => {
    const passage = loadedPassages.value.find(p => p.id === passageId)
    if (passage) {
      passage.questions = passage.questions.filter(q => q.queCode !== questionId)
    }
  }

  /**
   * 문제 순서 변경
   * @param {number} passageId - 지문 ID
   * @param {number} oldIndex - 이전 인덱스
   * @param {number} newIndex - 새 인덱스
   */
  const reorderQuestions = (passageId, oldIndex, newIndex) => {
    const passage = loadedPassages.value.find(p => p.id === passageId)
    if (passage) {
      const questions = [...passage.questions]
      const [removed] = questions.splice(oldIndex, 1)
      questions.splice(newIndex, 0, removed)
      passage.questions = questions
    }
  }

  /**
   * 기존 지문에 새로운 문항들을 추가 (add 모드용)
   * @param {string} passageId - 대상 지문의 ID
   * @param {Array} newQuestions - 추가할 새로운 문항 데이터 배열
   */
  const updatePassageQuestions = (passageId, newQuestions) => {
    const passage = loadedPassages.value.find(p => p.id === passageId)
    if (passage && newQuestions.length > 0) {
      // 기존 문항들의 queCode 목록
      const existingQueCodes = passage.questions.map(q => q.queCode)
      
      // 새로운 문항들만 필터링 (중복 방지)
      const questionsToAdd = newQuestions.filter(q => !existingQueCodes.includes(q.queCode))
      
      // 새로운 문항들을 기존 문항 뒤에 추가
      passage.questions.push(...questionsToAdd.map(q => ({
        queCode: q.queCode,
        queQuery: formatHtmlContent(q.queQuery || q.content || q.text, '문제를 입력하세요'),
        queOption: q.queOption || '',
        queAnswer: q.queAnswer || '',
        queDescription: q.queDescription || '',
        queSubpassage: q.queSubpassage || ''
      })))
      
      console.log(`✅ ${passage.title}에 ${questionsToAdd.length}개 문항 추가 완료`)
      return questionsToAdd.length
    }
    return 0
  }

  // ========== 접기/펴기 관리 ==========

  /**
   * 지문 접기/펴기 토글
   * @param {number} passageId - 지문 ID
   */
  const togglePassage = (passageId) => {
    const passage = loadedPassages.value.find(p => p.id === passageId)
    if (passage) {
      passage.isExpanded = !passage.isExpanded
    }
  }

  /**
   * 모든 지문 접기/펴기
   * @param {boolean} expand - true: 펴기, false: 접기
   */
  const toggleAllPassages = (expand) => {
    loadedPassages.value.forEach(passage => {
      passage.isExpanded = expand
    })
  }

  // ========== 계산된 속성 ==========

  /**
   * 전체 문제 수
   */
  const totalQuestionCount = computed(() => {
    return loadedPassages.value.reduce((total, passage) => {
      return total + passage.questions.length
    }, 0)
  })

  /**
   * 지문 개수
   */
  const passageCount = computed(() => loadedPassages.value.length)

  /**
   * 지문 타입별 개수
   */
  const passageTypeStats = computed(() => {
    const stats = {
      '단일 지문': 0,
      '복합 지문': 0,
      '독서론': 0
    }

    loadedPassages.value.forEach(passage => {
      if (stats.hasOwnProperty(passage.type)) {
        stats[passage.type]++
      }
    })

    return stats
  })

  /**
   * 문제지 유효성 검사
   */
  const isValidExam = computed(() => {
    return examData.value.title.trim() !== '' && loadedPassages.value.length > 0
  })

  /**
   * 선택된 레이아웃 객체
   */
  const selectedLayout = computed(() => {
    return paperLayouts.value.find(layout => layout.id === selectedLayoutId.value) || paperLayouts.value[0]
  })

  /**
   * 현재 선택된 페이지 형식 객체
   */
  const currentPageFormat = computed(() => {
    return pageFormats.value.find(f => f.id === selectedPageFormat.value) || pageFormats.value[0]
  })

  /**
   * 현재 사용할 여백 설정 (커스텀이 있으면 커스텀, 없으면 기본값)
   */
  const currentMargins = computed(() => {
    return customMargins.value || currentPageFormat.value.defaultMargins
  })

  /**
   * 동적 페이지 스타일 객체 (CSS 바인딩용)
   */
  const pageStyles = computed(() => ({
    width: currentPageFormat.value.width,
    minHeight: currentPageFormat.value.height,
    maxWidth: `${currentPageFormat.value.widthPx}px`, // 픽셀 기준 최대 너비
    padding: `${currentMargins.value.top} ${currentMargins.value.right} ${currentMargins.value.bottom} ${currentMargins.value.left}`
  }))

  /**
   * 실제 콘텐츠 영역 높이 (페이지 높이에서 여백 제외)
   */
  const contentAreaHeight = computed(() => {
    const format = currentPageFormat.value
    const margins = currentMargins.value
    
    // mm 단위를 픽셀로 변환 (1mm = 3.7795px at 96dpi)
    const mmToPx = (mm) => parseFloat(mm.replace('mm', '')) * 3.7795
    
    const pageHeightPx = format.heightPx
    const topMarginPx = mmToPx(margins.top)
    const bottomMarginPx = mmToPx(margins.bottom)
    
    return pageHeightPx - topMarginPx - bottomMarginPx
  })

  /**
   * 인쇄용 CSS 변수 (동적 @page 스타일용)
   */
  const printStyles = computed(() => ({
    '--page-width': currentPageFormat.value.width,
    '--page-height': currentPageFormat.value.height,
    '--page-margin-top': currentMargins.value.top,
    '--page-margin-right': currentMargins.value.right,
    '--page-margin-bottom': currentMargins.value.bottom,
    '--page-margin-left': currentMargins.value.left
  }))

  // ========== 유틸리티 함수 ==========

  /**
   * 지문 타입에 따른 CSS 클래스 반환
   * @param {string} type - 지문 타입
   */
  const getPassageTypeClass = (type) => {
    switch (type) {
      case '단일 지문':
        return 'bg-blue-100 text-blue-700'
      case '복합 지문':
        return 'bg-purple-100 text-purple-700'
      case '독서론':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  /**
   * paperLayout 레이아웃 변경
   * @param {string} layoutId - 레이아웃 ID
   */
  const changeLayout = (layoutId) => {
    if (paperLayouts.value.find(layout => layout.id === layoutId)) {
      selectedLayoutId.value = layoutId
    }
  }

  /**
   * 페이지 형식 변경
   * @param {string} formatId - 페이지 형식 ID
   */
  const changePageFormat = (formatId) => {
    if (pageFormats.value.find(format => format.id === formatId)) {
      selectedPageFormat.value = formatId
      // 페이지 형식이 변경되면 커스텀 여백을 초기화
      customMargins.value = null
    }
  }

  /**
   * 커스텀 여백 설정
   * @param {Object} margins - 여백 객체 { top, right, bottom, left }
   */
  const setCustomMargins = (margins) => {
    customMargins.value = { ...margins }
  }

  /**
   * 커스텀 여백 초기화 (기본값으로 복원)
   */
  const resetMargins = () => {
    customMargins.value = null
  }

  /**
   * 페이지 형식에 따른 기본 컬럼 수 (1단 또는 2단만)
   * @param {string} formatId - 페이지 형식 ID
   */
  const getDefaultColumnCount = (formatId = selectedPageFormat.value) => {
    const format = pageFormats.value.find(f => f.id === formatId)
    if (!format) return 2
    
    // 너비에 따른 기본 컬럼 수 (1단 또는 2단만)
    if (format.widthPx >= 800) return 2   // A4, Letter, A3, B3 등은 2단
    return 1 // 작은 페이지는 1단
  }

  /**
   * 템플릿의 변수 치환 ({{title}} 등)
   * @param {string} template - 템플릿 문자열
   * @param {Object} variables - 치환할 변수들
   */
  const renderTemplate = (template, variables = {}) => {
    let rendered = template
    
    // {{title}} 같은 변수를 실제 값으로 치환
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      rendered = rendered.replace(regex, variables[key] || '')
    })
    
    return rendered
  }

  /**
   * 현재 선택된 레이아웃의 헤더 HTML 반환 (변수 치환 적용)
   */
  const getRenderedHeader = () => {
    return renderTemplate(selectedLayout.value.header, {
      title: examData.value.title
    })
  }

  /**
   * 현재 선택된 레이아웃의 푸터 HTML 반환 (변수 치환 적용)
   */
  const getRenderedFooter = () => {
    return renderTemplate(selectedLayout.value.footer, {
      title: examData.value.title
    })
  }

  const getRenderedTop = () => {
    return renderTemplate(selectedLayout.value.top, {
      title: examData.value.title
    })
  }
  /**
   * 문제지 데이터 초기화
   */
  const resetExam = () => {
    examData.value = {
      title: ''
    }
    loadedPassages.value = []
    selectedLayoutId.value = 'suneung-style' // 기본 레이아웃으로 초기화
    error.value = null
  }

  /**
   * 문제지 데이터 내보내기 (저장용)
   */
  const exportExamData = () => {
    return {
      ...examData.value,
      passages: loadedPassages.value.map(passage => ({
        ...passage,
        questions: passage.questions.map((question, index) => ({
          ...question,
          number: index + 1
        }))
      }))
    }
  }

  /**
   * 에러 초기화
   */
  const clearError = () => {
    error.value = null
  }

  // ========== 반환 객체 ==========
  return {
    // 상태
    examData,
    loadedPassages,
    isLoading,
    error,

    // paperLayout 관련
    paperLayouts,
    selectedLayoutId,
    selectedLayout,

    // 페이지 형식 관련
    pageFormats,
    selectedPageFormat,
    customMargins,
    currentPageFormat,
    currentMargins,
    pageStyles,
    contentAreaHeight,
    printStyles,

    // 계산된 속성
    totalQuestionCount,
    passageCount,
    passageTypeStats,
    isValidExam,

    // 지문 관리
    loadPassage,
    removePassage,
    reorderPassages,
    togglePassage,
    toggleAllPassages,

    // 문제 관리
    addQuestion,
    deleteQuestion,
    reorderQuestions,
    updatePassageQuestions,

    // 유틸리티
    formatHtmlContent,
    createNewPassage,
    addPassagesToLoaded,
    getPassageTypeClass,
    resetExam,
    exportExamData,
    clearError,

    // paperLayout 관리
    changeLayout,
    renderTemplate,
    getRenderedHeader,
    getRenderedFooter,
    getRenderedTop,

    // 페이지 형식 관리
    changePageFormat,
    setCustomMargins,
    resetMargins,
    getDefaultColumnCount
  }
}

/**
 * 드래그 앤 드롭 전용 훅
 */
export function useDragAndDrop() {
  const draggedItem = ref(null)
  const draggedType = ref(null) // 'passage' | 'question'
  const draggedFrom = ref(null)

  const startDrag = (item, type, from = null) => {
    draggedItem.value = item
    draggedType.value = type
    draggedFrom.value = from
  }

  const endDrag = () => {
    draggedItem.value = null
    draggedType.value = null
    draggedFrom.value = null
  }

  const canDrop = (targetType) => {
    return draggedType.value === targetType
  }

  return {
    draggedItem,
    draggedType,
    draggedFrom,
    startDrag,
    endDrag,
    canDrop
  }
}