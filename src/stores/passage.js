import { defineStore } from 'pinia'

export const usePassageStore = defineStore('passage', {
  state: () => ({
    // 요청 데이터
    requestData: null,
    // 응답 데이터 (DB 구조 기반)
    responseData: null,
    // 지문 타입 ('single', 'multiple', 'reading')
    generateType: null,
    // 로딩 상태
    isLoading: false
  }),

  getters: {
    // 단일 지문 여부
    isSinglePassage: (state) => state.generateType === 'single',
    
    // 복합 지문 여부
    isMultiplePassage: (state) => state.generateType === 'multiple',
    
    // 독서 지문 여부
    isReadingPassage: (state) => state.generateType === 'reading',
    
    // 지문 분석 데이터가 여러 개인지 확인 (DB의 descriptions 배열 길이 기준)
    hasMultipleCorePoints: (state) => {
      return state.responseData?.descriptions?.length > 1
    },
    
    // 탭별 데이터 구성 (DB 구조 기반)
    corePointTabs: (state) => {
        if (!state.responseData?.descriptions) return []
  
        const descriptions = state.responseData.descriptions
        
        // descriptions 길이로만 분기 처리
        if (descriptions.length > 1) {
            // 복합 지문 (2개 이상)
            return descriptions.map((desc, index) => ({
            label: `(${String.fromCharCode(65 + index)}) 지문`,  // (가), (나), (다)...
            pasType: desc.pasType,
            keyword: desc.keyword,
            gist: desc.gist
            }))
        } else {
            // 단일 지문 (1개)
            return [{
            label: '지문 분석',
            pasType: descriptions[0]?.pasType || '',
            keyword: descriptions[0]?.keyword || '',
            gist: descriptions[0]?.gist || ''
            }]
        }
    }
  },

  actions: {
    // 지문 생성 요청 데이터 저장
    setRequestData(data, type) {
      this.requestData = data
      this.generateType = type
    },
    
    // 지문 생성 응답 데이터 저장 (DB 구조 기반)
    setResponseData(data) {
      this.responseData = data
      this.isLoading = false
    },
    
    // 로딩 상태 설정
    setLoading(loading) {
      this.isLoading = loading
    },
    
    // 데이터 초기화
    clearData() {
      this.requestData = null
      this.responseData = null
      this.generateType = null
      this.isLoading = false
    }
  }
})
