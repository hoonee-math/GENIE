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
      footer: `<div class="text-center"><p>페이지 {{pageNumber}}/{{totalPages}}</p></div>`
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
      id: 'letter',
      name: 'Letter (216×279mm)',
      displayName: 'Letter',
      width: '216mm',
      height: '279mm',
      widthPx: 816, // Letter width in pixels at 96dpi
      heightPx: 1056, // Letter height in pixels at 96dpi
      defaultMargins: { 
        top: '25.4mm', 
        right: '25.4mm', 
        bottom: '25.4mm', 
        left: '25.4mm' 
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
    // 더미 데이터 - 지문 3세트
    {
      id: 1001, // 고유 ID (같은 지문을 여러번 불러와도 구분 가능)
      pasCode: 123, // 실제 DB의 지문 코드
      title: '<p>독서 이론 - 텍스트의 의미 구성 문장 길이 늘리기</p>',
      content: '<p>독서는 단순히 글자를 읽는 행위가 아니라...</p><p>지문 content는 내용이 엄청 길 수 있음.</p>',
      type: '단일 지문',
      isExpanded: false,
      questions: [
        {
          queCode: 2001, // 실제 DB의 문항 코드
          queQuery: '<p>윗글의 내용 전개 방식으로 적절한 것은?</p>',
          queOption: '<p>① 우주의 나이는 빛의 속도에 따라 결정되겠군.</p><p>② 입자 지평선은 우주가 팽창하여 생겨난 경계이겠군.</p><p>③ 관측 가능한 우주 바깥에는 우리와 다른 물리 법칙이 존재하겠군.</p><p>④ 우주 급팽창 이론은 우주가 무한하다는 것을 입증하는 이론이겠군.</p><p>⑤ 우주의 평균 밀도가 임계 밀도보다 높다고 밝혀진다면, 전체 우주의 크기는 유한하다고 결론 내릴 수 있겠군.</p>',
          queAnswer: '②',
          queDescription: '<p>[정답해설]</p><p>4문단에서 우주의 평균 밀도가 특정 임계 밀도보다 높으면 우주는 양(+)의 곡률을 가지며 닫힌 구의 표면처럼 유한한 크기를 갖게 된다고 설명하고 있다. 따라서 우주의 평균 밀도가 임계 밀도보다 높다는 사실이 밝혀진다면, 이를 근거로 전체 우주의 크기가 유한하다고 결론 내릴 수 있다는 반응은 적절하다.</p><p>[오답피하기]</p><p>① 2문단에 따르면, 우주의 유한한 나이와 빛의 유한한 속도는 우리가 관측할 수 있는 거리의 한계를 설정하는 요인이다.</p><p>② 2문단에 따르면, 입자 지평선은 우주의 유한한 나이로 인해 빛이 우리에게 도달할 시간이 충분하지 않아 생기는 경계이다.  우주가 무한하다는 것을 ‘입증’하는 이론이라는 반응은 적절하지 않다.</p>',
          queSubpassage: '<p>현대의 문화 콘텐츠는 한 개인의 사상이나 감정의 순수한 발현물이라기보다는, 정교한 기획과 자본, 기술이 결합된 총체적 산물이다. 콘텐츠의 가치는 창작 행위 자체뿐만 아니라, 그것을 둘러싼 전략적 브랜딩, 플랫폼 활용, 그리고 다양한 전문가들의 협업을 통해 창출된다.</p><p>따라서 창작의 기여도를 평가할 때는 단순히 최종 결과물을 만들어 낸 행위자를 넘어, 콘텐츠의 성공을 가능하게 한 시스템 전반의 역할을 종합적으로 고려해야 한다.</p>'
        },
        {
          queCode: 2002,
          queQuery: '<p>윗글을 바탕으로 [보기]를 이해한 내용으로 적절하지 <u>않은</u> 것은?</p>',
          queOption: '<p>① 선지1 5개의 예시 선지를 보여줍니다.</p><p>② 선지2, 쉼표를 포함한 예</p><p>③ 선지3 <u>태그</u>를 포함한 예</p><p>④ 선지4 줄바꿈 기호를 포함한 예</p><p>⑤ 선지5, <u>전부</u> 포함한 예</p>',
          queAnswer: '②',
          queDescription: '<p>[정답해설]</p><p>2문단에 따르면~~.</p><p>[오답피하기]</p><p>① 2문단에 따르면, 우주의 유한한 나이와 빛의 유한한 속도는 우리가 관측할 수 있는 거리의 한계를 설정하는 요인이다. 우주의 나이가 빛의 속도에 따라 결정된다는 내용은 확인할 수 없다.</p>',
          queSubpassage: ''
        },
        {
          queCode: 2003,
          queQuery: '<p>윗글에 나타난 필자의 관점에 대한 설명으로 가장 적절한 것은?</p>', // 태그가 없을 수 있음.. 그런때는 useGenerateExam 의 formatHtmlContent 함수를 이용하면 됨!
          queOption: '<p>① 1번선택지.</p><p>② 2번선택지</p><p>③ 3번선택지</p><p>④ 4번선택지</p><p>⑤ 5번선택지</p>',
          queAnswer: '②',
          queDescription: '[정답해설]2문단에 따르면~~.[오답피하기]이런식으로 태그가 없는 경우가 발생할 수도있음. 이걸 주의해야함.',
          queSubpassage: ''
        }
      ],
      descriptions: [
        {
          pasType: '독서론',
          keyword: '텍스트 이해',
          gist: '독서의 의미 구성 과정',
          order: 1
        }
      ]
    },
    {
      id: 1002,
      pasCode: 456,
      title: '<p>현대 소설 - 광장 (최인훈)',
      content: '<p>(가) 이명준은 다시 그 모든 것을 생각했다...</p><p>이명준이...</p><p>그렇게 이명준은...</p><p>(나) "사람은 누구나 광장을 가져야 해..."</p><p>광장이란...지문 content는 내용이 엄청 길 수 있음.</p>',
      type: '복합 지문',
      isExpanded: false, // 접힌 상태로 시작
      questions: [
        {
          queCode: 2004,
          queQuery: '<p>(가)와 (나)의 공통점으로 가장 적절한 것은?</p>',
          queOption: '',
          queAnswer: '',
          queDescription: '',
          queSubpassage: ''
        },
        {
          queCode: 2005,
          queQuery: '<p>윗글에 나타난 인물의 심리 변화 과정으로 적절한 것은?</p>',
          queOption: '',
          queAnswer: '',
          queDescription: '',
          queSubpassage: ''
        }
      ],
      descriptions: [
        {
          pasType: '현대 소설',
          keyword: '실존 의식',
          gist: '개인과 사회의 갈등',
          order: 1
        },
        {
          pasType: '현대 소설',
          keyword: '광장과 밀실',
          gist: '공적 영역과 사적 영역',
          order: 2
        }
      ]
    },
    {
      id: 1003,
      pasCode: 789,
      title: '<p>화법과 작문 - 토론의 전략</p>',
      content: '<p>효과적인 토론을 위해서는 논증의 구조를 명확히 해야 한다...</p>',
      type: '단일 지문',
      isExpanded: false,
      questions: [
        {
          queCode: 2006,
          queQuery: '<p>발표자의 말하기 방식에 대한 설명으로 가장 적절한 것은?</p>',
          queOption: '',
          queAnswer: '',
          queDescription: '',
          queSubpassage: ''
        },
        {
          queCode: 2007,
          queQuery: '<p>윗글의 논증 구조를 분석한 내용으로 적절하지 않은 것은?</p>',
          queOption: '',
          queAnswer: '',
          queDescription: '',
          queSubpassage: ''
        },
        {
          queCode: 2008,
          queQuery: '<p>[보기]의 상황에서 가장 효과적인 토론 전략은?</p>',
          queOption: '',
          queAnswer: '',
          queDescription: '',
          queSubpassage: ''
        },
        {
          queCode: 2009,
          queQuery: '<p>토론 과정에서 나타난 의견 조율 방식으로 적절한 것은?</p>',
          queOption: '',
          queAnswer: '',
          queDescription: '',
          queSubpassage: ''
        }
      ],
      descriptions: [
        {
          pasType: '화법',
          keyword: '토론 전략',
          gist: '효과적인 논증 방법',
          order: 1
        }
      ]
    }
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