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
    title: '',
    headerLeft: '',
    headerCenter: '',
    headerRight: '',
    footerLeft: '',
    footerCenter: '',
    footerRight: ''
  })

  const loadedPassages = ref([
    // 더미 데이터 - 지문 3세트
    {
      id: 1001, // 고유 ID (같은 지문을 여러번 불러와도 구분 가능)
      pasCode: 123, // 실제 DB의 지문 코드
      title: '<p>독서 이론 - 텍스트의 의미 구성</p>',
      content: '<p>독서는 단순히 글자를 읽는 행위가 아니라...</p>',
      type: '단일 지문',
      isExpanded: true,
      questions: [
        {
          queCode: 2001, // 실제 DB의 문항 코드
          queQuery: '<p>윗글의 내용 전개 방식으로 적절한 것은?</p>',
          queOption: [],
          queAnswer: '',
          queDescription: '',
          queSubpassage: ''
        },
        {
          queCode: 2002,
          queQuery: '<p>윗글을 바탕으로 [보기]를 이해한 내용으로 적절하지 <u>않은</u> 것은?</p>',
          queOption: [],
          queAnswer: '',
          queDescription: '',
          queSubpassage: ''
        },
        {
          queCode: 2003,
          queQuery: '<p>윗글에 나타난 필자의 관점에 대한 설명으로 가장 적절한 것은?</p>',
          queOption: [],
          queAnswer: '',
          queDescription: '',
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
      content: '<p>(가) 이명준은 다시 그 모든 것을 생각했다...</p><p>(나) "사람은 누구나 광장을 가져야 해..."</p>',
      type: '복합 지문',
      isExpanded: false, // 접힌 상태로 시작
      questions: [
        {
          queCode: 2004,
          queQuery: '<p>(가)와 (나)의 공통점으로 가장 적절한 것은?</p>',
          queOption: [],
          queAnswer: '',
          queDescription: '',
          queSubpassage: ''
        },
        {
          queCode: 2005,
          queQuery: '<p>윗글에 나타난 인물의 심리 변화 과정으로 적절한 것은?</p>',
          queOption: [],
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
      isExpanded: true,
      questions: [
        {
          queCode: 2006,
          queQuery: '<p>발표자의 말하기 방식에 대한 설명으로 가장 적절한 것은?</p>',
          queOption: [],
          queAnswer: '',
          queDescription: '',
          queSubpassage: ''
        },
        {
          queCode: 2007,
          queQuery: '<p>윗글의 논증 구조를 분석한 내용으로 적절하지 않은 것은?</p>',
          queOption: [],
          queAnswer: '',
          queDescription: '',
          queSubpassage: ''
        },
        {
          queCode: 2008,
          queQuery: '<p>[보기]의 상황에서 가장 효과적인 토론 전략은?</p>',
          queOption: [],
          queAnswer: '',
          queDescription: '',
          queSubpassage: ''
        },
        {
          queCode: 2009,
          queQuery: '<p>토론 과정에서 나타난 의견 조율 방식으로 적절한 것은?</p>',
          queOption: [],
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

  // ========== 지문 관리 ==========

  /**
   * 지문을 로드하고 문제지에 추가
   * @param {number} pasCode - 지문 코드
   */
  const loadPassage = async (pasCode) => {
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

      // 새 지문 객체 생성
      const newPassage = {
        id: Date.now(), // 임시 ID (실제로는 pasCode 사용)
        pasCode: passageData.pasCode,
        title: passageData.title,
        content: passageData.content,
        type: determinePassageType(passageData.descriptions),
        isExpanded: true,
        questions: passageData.questions?.map((q, index) => ({
          id: q.id || Date.now() + index,
          text: q.content || q.text || '문제 내용',
          options: q.options || [],
          answer: q.answer || '',
          explanation: q.explanation || ''
        })) || [],
        descriptions: passageData.descriptions || []
      }

      // 지문 리스트에 추가
      loadedPassages.value.push(newPassage)

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
        id: Date.now(),
        text: questionText,
        options: [],
        answer: '',
        explanation: ''
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
      passage.questions = passage.questions.filter(q => q.id !== questionId)
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
   * 문제 수정
   * @param {number} passageId - 지문 ID
   * @param {number} questionId - 문제 ID
   * @param {Object} updates - 업데이트할 필드들
   */
  const updateQuestion = (passageId, questionId, updates) => {
    const passage = loadedPassages.value.find(p => p.id === passageId)
    if (passage) {
      const question = passage.questions.find(q => q.id === questionId)
      if (question) {
        Object.assign(question, updates)
      }
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
   * 문제지 데이터 초기화
   */
  const resetExam = () => {
    examData.value = {
      title: '',
      headerLeft: '',
      headerCenter: '',
      headerRight: '',
      footerLeft: '',
      footerCenter: '',
      footerRight: ''
    }
    loadedPassages.value = []
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
    updateQuestion,

    // 유틸리티
    getPassageTypeClass,
    resetExam,
    exportExamData,
    clearError
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