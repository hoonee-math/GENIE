import { computed } from 'vue'
import { usePassageStore } from '@/stores/passage'
import { getPassageFromDatabase } from '@/api/passage'

export function usePassage() {
  const store = usePassageStore()
  
  // 지문 조회 (캐시 우선 + API 호출 + 파싱)
  const fetchPassage = async (pasCode, options = {}) => {
    const numPasCode = Number(pasCode)
    
    // 캐시 확인
    if (!options.force && store.loadFromCache(numPasCode)) {
      console.log('⭐ 캐시에서 로드:', numPasCode, '(API 호출 없음)')
      return store.passage
    }
    
    console.log('🌐 API 호출 시작:', numPasCode, '(캐시 없음)')
    
    // API 호출 + 파싱
    store.setLoading(true)
    try {
      const apiResponse = await getPassageFromDatabase(numPasCode)
      
      // 단순 파싱 (API → Store 스키마)
      const parsed = {
        pasCode: apiResponse.pasCode,
        title: apiResponse.title,
        content: apiResponse.content, // DB에서 이미 <p> 태그로 저장되어 있음
        descriptions: apiResponse.descriptions, // 백엔드 구조 그대로
        questions: apiResponse.questions || [],
        createdAt: apiResponse.createdAt,
        updatedAt: apiResponse.updatedAt
      }
      
      store.setPassage(parsed)
      console.log('✅ API 호출 완료 및 캐시 저장:', numPasCode)
      return store.passage
    } catch (error) {
      console.error('지문 조회 실패:', error)
      store.setLoading(false)
      throw error
    } finally {
      store.setLoading(false)
    }
  }
  
  // 생성 후 캐싱 (FastAPI 데이터 재활용)
  const cacheGeneratedPassage = (pasCode, fastApiData, dbData) => {
    const combined = {
      pasCode: Number(pasCode),
      title: dbData.title,
      content: dbData.content, // DB에 저장된 데이터 사용 (이미 <p> 태그)
      descriptions: dbData.descriptions,
      questions: [],
      createdAt: dbData.createdAt,
      updatedAt: dbData.updatedAt
    }
    
    store.setPassage(combined)
    console.log('생성된 지문 캐싱 완료:', pasCode)
  }
  
  // 보관함 리스트 (미래 구현 예정)
  const fetchStorageList = async (options = {}) => {
    if (!options.force && store.lists.storage.length > 0) {
      return store.lists.storage
    }
    
    // TODO: 보관함 API 구현 후 추가
    return store.lists.storage
  }
  
  return {
    // Store 데이터를 computed로 감싸서 반환
    passage: computed(() => store.passage),
    corePointTabs: computed(() => store.corePointTabs),
    isLoading: computed(() => store.ui.isLoading),
    errorMessage: computed(() => store.ui.errorMessage),
    storageList: computed(() => store.lists.storage),
    
    // Actions
    fetchPassage,
    cacheGeneratedPassage,
    fetchStorageList,
    
    // Store actions 직접 노출
    clearPassage: store.clearPassage,
    setLoading: store.setLoading
  }
}
