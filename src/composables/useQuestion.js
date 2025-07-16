import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePassageStore } from '@/stores/passage'
import { usePassage } from '@/composables/usePassage'

/**
 * 문항 생성 관련 순수 데이터 처리 composable
 * UI 상태 관리는 Vue 컴포넌트에서 담당
 */
export function useQuestion() {
  const router = useRouter()
  const passageStore = usePassageStore()
  const { passage, cacheGeneratedPassage } = usePassage()

  // ===== 데이터 검증 =====
  
  /**
   * 지문 길이 검증 (최소 500자)
   */
  const validatePassageLength = (content) => {
    const textLength = content.replace(/<[^>]*>/g, '').length
    return textLength >= 500
  }
  
  /**
   * 문항 생성 데이터 검증
   */
  const validateQuestionData = (title, content) => {
    const errors = []
    
    if (!title || title.trim().length === 0) {
      errors.push('제목을 입력해주세요.')
    }
    
    if (!content || content.trim().length === 0) {
      errors.push('내용을 입력해주세요.')
    }
    
    if (content && !validatePassageLength(content)) {
      errors.push('지문은 최소 500자 이상 입력해주세요.')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // ===== 데이터 변환 =====
  
  /**
   * 문항 생성용 임시 데이터 생성 (store에 저장)
   */
  const createTempPassageData = (title, content) => {
    const tempData = {
      pasCode: null,
      title: title,
      content: content,
      descriptions: passage.value.descriptions.length > 0 
        ? passage.value.descriptions 
        : [{ pasType: '', keyword: '', gist: '', order: 1 }],
      questions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // store에 임시 저장
    passageStore.setPassage(tempData)
    
    return tempData
  }

  // ===== API 호출 =====
  
  /**
   * 문항 생성 API 호출
   */
  const generateQuestion = async (questionData, title, content) => {
    const requestData = {
      custom_passage: content,
      type_question: questionData.pattern,
      type_question_detail: questionData.type,
      question_example: questionData.title,
    }
    
    // FastAPI 호출
    const response = await generateSinglePassageQuestionAPI(requestData);
    
    if (!response.ok) {
      throw new Error(`문항 생성 실패: ${response.status}`)
    }
    
    const result = await response.json()
    
    // 선택지 전처리 (쉼표 제거)
    const processedOptions = result.generated_option.map(option => 
      option.replace(/,/g, '').replace(/^[①②③④⑤]\s*/, '')
    )
    
    return {
      ...result,
      generated_option: processedOptions
    }
  }

  /**
   * 문항 저장 API 호출
   */
  const saveQuestion = async (questionResult, questionData, title, content) => {
    const saveRequestData = {
      type: questionResult.type_passage,
      keyword: questionResult.keyword[0],
      title: title,
      content: content,
      gist: passage.value.descriptions[0]?.gist || questionResult.generated_core_point,
      isGenerated: 0,
      questions: [{
        queQuery: questionResult.generated_question,
        queOption: questionResult.generated_option,
        queAnswer: questionResult.generated_answer,
        description: questionResult.generated_description,
      }],
    }
    
    const response = await fetch('/api/pass/ques/insert/each', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(saveRequestData),
    })
    
    if (!response.ok) {
      throw new Error(`문항 저장 실패: ${response.status}`)
    }
    
    return response.json()
  }
  
  /**
   * 전체 문항 생성 프로세스
   */
  const processQuestionGeneration = async (questionData, title, content) => {
    // 1. 데이터 검증
    const validation = validateQuestionData(title, content)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(' '))
    }
    
    // 2. 임시 데이터 생성 및 store 저장
    createTempPassageData(title, content)
    
    // 3. 문항 생성
    const questionResult = await generateQuestion(questionData, title, content)
    
    // 4. 문항 저장
    const saveResult = await saveQuestion(questionResult, questionData, title, content)
    
    // 5. 결과 페이지로 이동
    router.push({
      path: '/questions/generate',
      query: {
        pattern: questionData.pattern,
        type: questionData.type,
        queExample: questionData.title,
      },
    })
    
    return saveResult
  }

  // ===== 지문 불러오기 =====
  
  /**
   * 자료실에서 지문 불러오기 처리
   */
  const loadPassageFromStorage = (passageData) => {
    const loadedData = {
      pasCode: passageData.pasCode,
      title: passageData.title,
      content: passageData.content,
      descriptions: passageData.descriptions || [],
      questions: passageData.questions || [],
      createdAt: passageData.createdAt,
      updatedAt: passageData.updatedAt
    }
    
    // store에 저장
    passageStore.setPassage(loadedData)
    
    return loadedData
  }
  
  /**
   * 생성된 지문에서 문항 이어서 생성하기 (캐시 활용)
   */
  const continueFromGeneratedPassage = (pasCode) => {
    // 캐시에서 데이터 로드 시도
    const loaded = passageStore.loadFromCache(pasCode)
    
    if (!loaded) {
      throw new Error('캐시된 지문 데이터를 찾을 수 없습니다.')
    }
    
    return passage.value
  }

  // ===== 유틸리티 =====
  
  /**
   * store 초기화
   */
  const resetPassageData = () => {
    passageStore.clearPassage()
  }

  // ===== 반환값 =====
  return {
    // 상태 (computed)
    passage: computed(() => passage.value),
    
    // 검증 함수
    validatePassageLength,
    validateQuestionData,
    
    // 데이터 처리 함수
    createTempPassageData,
    loadPassageFromStorage,
    continueFromGeneratedPassage,
    resetPassageData,
    
    // API 함수 (메인)
    processQuestionGeneration,
    
    // API 함수 (개별)
    generateQuestion,
    saveQuestion,
  }
}