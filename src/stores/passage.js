import { defineStore } from 'pinia'

export const usePassageStore = defineStore('passage', {
  state: () => ({
    // === 현재 지문 스키마 ===
    passage: {
      pasCode: null,
      title: '',
      content: '',
      descriptions: [
        {
          pasType: '',  // 인문, 사회, 과학, 기술, 예술, 독서론
          keyword: '',  // 지문 제재
          gist: '',     // 핵심 논점
          order: null   // 순서
        }
      ],
      questions: [],    // (추가 예정)
      createdAt: null,
      updatedAt: null
    },
    
    // === 캐시 (복수 지문 저장) ===
    cache: {
      entities: {}, // { [pasCode]: passage스키마 }
      ttl: 5 * 60 * 1000
    },
    
    // === 리스트 스키마 ===
    lists: {
      storage: [],
      search: [],
      recent: []  // pasCode 배열
    },
    
    // === 전역 UI 상태만 ===
    ui: {
      isLoading: false,
      errorMessage: ''
    }
  }),

  getters: {
    // 기존 배열(descriptions)을 변환해서 새로운 배열(corePointTabs)을 반환
    corePointTabs: (state) => {
      if (!state.passage.descriptions?.length) return []
      const koreanLabels = ['가', '나', '다']
      
      return state.passage.descriptions.map((desc, index) => ({
        label: `(${koreanLabels[index]}) 지문`,  // (가), (나), (다)...
        pasType: desc.pasType,
        keyword: desc.keyword,
        gist: desc.gist
        // label은 Vue 파일에서 직접 생성
      }))
    }
  },

  actions: {
    // 파싱된 데이터를 스키마에 저장
    setPassage(parsedData) {
      this.passage = parsedData
      this.setCacheEntity(parsedData.pasCode, parsedData)
    },
    
    // 캐시 관리
    setCacheEntity(pasCode, data) {
      this.cache.entities[pasCode] = { ...data, _cached: Date.now() }
    },
    
    loadFromCache(pasCode) {
      const cached = this.cache.entities[pasCode]
      if (!cached || Date.now() - cached._cached > this.cache.ttl) {
        return false
      }
      this.passage = { ...cached }
      delete this.passage._cached
      return true
    },
    
    // 리스트 설정
    setStorageList(listData) {
      this.lists.storage = listData
    },
    
    // UI 상태
    setLoading(loading) {
      this.ui.isLoading = loading
    },
    
    // 초기화
    clearPassage() {
      this.passage = {
        pasCode: null,
        title: '',
        content: '',
        descriptions: [],
        questions: [],
        createdAt: null,
        updatedAt: null
      }
    }
  }
})
