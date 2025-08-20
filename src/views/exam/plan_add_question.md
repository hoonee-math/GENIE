  📋 기존 사용 방식 (Current Implementation)

  1. 호출 방식

  - 위치: PassageLoaderPanel.vue:86-91의 openPassageModal() 함수
  - 트리거: "지문 불러오기" 버튼 클릭
  - 목적: 전체 사용자 소유 지문+문항 데이터 선택

  2. 데이터 로딩

  - API 호출: fetchPassagesWithQuestionsList() (usePassage.js:278)
  - 데이터 범위: 사용자가 소유한 모든 지문+문항 데이터
  - 로딩 함수: PassageLoaderModal.vue:220의 loadPassages()

  3. 선택 메커니즘

  - 체크박스 시스템: 전체 지문/개별 문항 선택 가능
  - 미리보기: 지문 클릭 시 미리보기 영역에 지문 내용 표시
  - 상태 관리: selectedQuestions ref로 선택된 문항 관리

  4. 데이터 전달

  - 처리 함수: handleLoadPassageAndQuestionFromStorage() (PassageLoaderModal.vue:331)
  - emit 이벤트: @loadSelectedData
  - 수신 함수: PassageLoaderPanel.vue:165의 handleLoadSelectedData()
  - 최종 저장: useGenerateExam의 addPassagesToLoaded() 함수 사용

  🆕 새로 추가될 기능 (New Feature Requirements)

  1. 호출 방식

  - 위치: PassageLoaderPanel.vue:29의 PassageBlock 컴포넌트
  - 트리거: PassageBlock의 addQuestion emit (현재는 54번째 줄의 버튼)
  - 매개변수: passage.id (문제지 내 지문 구별용)
  - 목적: 기존 지문에 추가 문항 선택

  2. 데이터 로딩 (새 분기 필요)

  - 기존 loadPassages() 재활용 + 분기 처리 추가
  - 새 API 호출: fetchPassage(passage.pasCode, {includeQuestions: true})
  - 데이터 범위: 특정 pasCode의 지문+문항 데이터만
  - 필터링: 기존 보유 queCode vs 새로 추가 가능한 queCode 구분

  3. 선택 상태 관리 (새 로직 필요)

  - 기존 문항 체크: passage.questions[i].queCode가 이미 있는 경우 → 체크됨 + 비활성화 (회색)
  - 새 문항: 선택 가능한 상태로 표시
  - 초기 상태: 기존 보유 queCode들은 미리 체크된 상태로 로딩

  4. 데이터 업데이트 (새 로직 필요)

  - 기존과 다른 처리: 새 지문 추가가 아닌 기존 지문의 questions 배열 업데이트
  - 업데이트 대상: loadedPassages에서 해당 passage.id를 찾아 questions 배열에 새 문항만 추가
  - 제외 조건: 이미 보유한 queCode는 추가하지 않음

  🔄 구현 계획

  1. PassageLoaderModal.vue 수정

  - loadPassages() 함수에 모드 분기 추가 (전체 로딩 vs 특정 지문 로딩)
  - 새 props 추가: mode, targetPassageId, existingQueCodes
  - 체크박스 상태 초기화 로직 추가
  - 기존 문항 비활성화 UI 추가

  2. PassageLoaderPanel.vue 수정

  - handleAddQuestion() 함수 수정
  - 새 함수 추가: handleAddQuestionFromModal()
  - PassageLoaderModal 호출 시 새 props 전달

  3. PassageBlock.vue 수정

  - addQuestion emit 방식 변경 또는 새 emit 추가
  - 기존 빈 문항 추가 vs 모달을 통한 문항 선택 구분

  4. useGenerateExam.js 수정

  - 기존 지문 업데이트를 위한 새 함수 추가
  - updatePassageQuestions(passageId, newQuestions) 함수 구현



# PassageLoaderModal 기능 확장 계획

구현할 새 기능

PassageBlock의 addQuestion 버튼을 통해 기존 지문에 추가 문항을 선택할 수 있는 기능 추가

주요 변경사항

1. PassageLoaderModal.vue 확장

- Props 추가: mode, targetPassageId, existingQueCodes
- loadPassages() 분기 처리: 전체 로딩 vs 특정 지문 로딩
- 초기 체크박스 상태 설정: 기존 보유 문항은 체크+비활성화
- UI 개선: 기존 문항은 회색 처리로 선택 불가 표시

2. PassageLoaderPanel.vue 수정

- handleAddQuestion() 함수 변경: 기존 빈 문항 추가 vs 모달 호출 분기
- 새 함수 추가: handleAddQuestionFromModal()
- 모달 호출 시 새 props 전달: 대상 지문 정보

3. PassageBlock.vue 조정

- addQuestion emit 동작 수정: 모달을 통한 문항 선택으로 변경
- 기존 빈 문항 추가 기능 유지 또는 제거: 요구사항에 따라 결정

4. useGenerateExam.js 확장

- 새 함수 추가: updatePassageQuestions(passageId, newQuestions)
- 기존 지문의 questions 배열 업데이트 로직

구현 순서

1. PassageLoaderModal.vue 기능 확장
2. useGenerateExam.js 새 함수 추가
3. PassageLoaderPanel.vue 로직 수정
4. PassageBlock.vue 동작 변경
5. 통합 테스트 및 빌드 확인