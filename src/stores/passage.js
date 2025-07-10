import { defineStore } from 'pinia'

export const usePassageStore = defineStore('passage', {
  state: () => ({
    // 요청 데이터
    requestData: null,
    // 응답 데이터 (DB 구조 기반)
    responseData: null,
    // 지문 타입 ('single', 'multiple', 'reading')
    passageType: null,
    // 로딩 상태
    isLoading: false
  }),

  getters: {
    // 단일 지문 여부
    isSinglePassage: (state) => state.passageType === 'single',
    
    // 복수 지문 여부
    isMultiplePassage: (state) => state.passageType === 'multiple',
    
    // 독서 지문 여부
    isReadingPassage: (state) => state.passageType === 'reading',
    
    // 지문 분석 데이터가 여러 개인지 확인 (DB의 description 배열 길이 기준)
    hasMultipleCorePoints: (state) => {
      return state.responseData?.description?.length > 1
    },
    
    // 탭별 데이터 구성 (DB 구조 기반)
    corePointTabs: (state) => {
      if (!state.responseData?.description) return []
      
      if (state.passageType === 'multiple' && state.responseData.description.length > 1) {
        return [
          {
            label: '(가) 지문',
            type_passage: state.responseData.description[0].type_passage,
            keyword: state.requestData?.first_keyword || '',
            core_point: state.responseData.description[0].core_point
          },
          {
            label: '(나) 지문', 
            type_passage: state.responseData.description[1].type_passage,
            keyword: state.requestData?.second_keyword || '',
            core_point: state.responseData.description[1].core_point
          }
        ]
      } else {
        return [
          {
            label: '지문 분석',
            type_passage: state.responseData.description[0]?.type_passage || '',
            keyword: state.requestData?.keyword || '',
            core_point: state.responseData.description[0]?.core_point || ''
          }
        ]
      }
    },
    
    // 전체 지문 분야 (화면 헤더용)
    passageSubject: (state) => {
      if (!state.responseData?.description) return ''
      
      if (state.passageType === 'multiple' && state.responseData.description.length > 1) {
        return `${state.responseData.description[0].type_passage}, ${state.responseData.description[1].type_passage}`
      } else {
        return state.responseData.description[0]?.type_passage || ''
      }
    },
    
    // 전체 지문 제재 (화면 헤더용)
    passageKeyword: (state) => {
      if (!state.requestData) return ''
      
      if (state.passageType === 'single') {
        return state.requestData.keyword
      } else if (state.passageType === 'multiple') {
        return `${state.requestData.first_keyword}, ${state.requestData.second_keyword}`
      } else if (state.passageType === 'reading') {
        return state.requestData.keyword
      }
      return ''
    }
  },

  actions: {
    // 지문 생성 요청 데이터 저장
    setRequestData(data, type) {
      this.requestData = data
      this.passageType = type
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
      this.passageType = null
      this.isLoading = false
    }
  }
})
