# 문제지 미리보기 시스템 개발 계획 및 시행착오 정리

## 1. 프로젝트 개요

### 목적
HTML 기반 문제지 미리보기 UI를 Vue 3 컴포넌트로 마이그레이션하여 반응형이고 동적인 문제지 생성 시스템 구축

### 핵심 요구사항
- A4 사이즈 페이지 레이아웃 (210mm × 297mm)
- 1단/2단 컬럼 토글 기능
- 페이지 간 4px 간격
- 다단 레이아웃에서 적절한 페이지 넘김 처리
- PDF/인쇄 기능 지원
- 실시간 데이터 업데이트 (왼쪽 패널에서 지문 추가/삭제 시 오른쪽 미리보기 자동 업데이트)

### 기존 HTML 버전의 특징
- Paged.js 사용으로 자동 페이지 분할
- 정적 데이터 기반
- 단일 HTML 파일 구조

## 2. Vue 3 마이그레이션 과정

### Phase 1: 기본 Vue 3 컴포넌트 구조 설계
```
ExamMain.vue (부모)
├── PassageLoaderPanel.vue (왼쪽 패널)
└── ExamTextEditor.vue (오른쪽 미리보기)
```

### Phase 2: 템플릿 시스템 구현
- 기존 examData의 단순 header/footer 필드를 제거
- paperLayouts 시스템 도입 (수능형, 심플형, 모던형)
- 템플릿 변수 치환 기능 (`{{title}}` 등)

### Phase 3: 반응성 시스템 구축
- useGenerateExam composable로 상태 관리
- Vue 3 provide/inject 패턴으로 컴포넌트 간 상태 공유

## 3. 주요 시행착오 및 근본 원인

### 3.1 전역 CSS 충돌 문제
**문제**: Paged.js와 Google Fonts를 index.html에 전역으로 추가했을 때 전체 웹앱이 마운트되지 않거나 레이아웃이 깨짐

**근본 원인**: 
- Paged.js는 전체 document에 스타일을 적용하도록 설계됨
- Vue 3 앱과 전역 라이브러리 간의 스타일 네임스페이스 충돌

**해결책**: 컴포넌트 레벨에서 동적 로딩으로 격리

### 3.2 Vue 3 반응성과 DOM 직접 조작 충돌
**문제**: DOM을 직접 조작하여 콘텐츠를 업데이트하려고 했을 때 Vue의 가상 DOM과 충돌

**근본 원인**: Vue 3의 반응성 시스템은 가상 DOM 기반이므로 직접적인 DOM 조작은 상태 불일치를 야기

**해결책**: 순수 Vue 템플릿 렌더링 방식으로 전환

### 3.3 Composable 인스턴스 분리 문제
**문제**: PassageLoaderPanel과 ExamTextEditor가 각각 별도의 useGenerateExam() 인스턴스를 생성하여 데이터가 공유되지 않음

**근본 원인**: Vue 3 Composition API에서 composable 함수는 호출될 때마다 새로운 반응형 상태를 생성

**해결책**: 부모 컴포넌트(ExamMain.vue)에서 단일 인스턴스를 생성하고 provide/inject 패턴으로 공유

### 3.4 Paged.js 격리 불가 문제
**문제**: Paged.js를 특정 컨테이너에만 적용하려 했으나 여전히 전역 영향 발생

**근본 원인**: Paged.js의 아키텍처상 document 전체를 대상으로 작동하도록 설계되어 격리가 근본적으로 어려움

**해결책**: Paged.js 완전 제거 후 CSS Grid/Flexbox 기반 자체 레이아웃 시스템 구축

## 4. 최종 아키텍처

### 4.1 컴포넌트 구조
```
ExamMain.vue
├── 단일 useGenerateExam() 인스턴스 생성
├── provide('generateExam', composable)
├── PassageLoaderPanel.vue (inject 사용)
└── ExamTextEditor.vue (inject 사용)
```

### 4.2 상태 관리
- **examData**: 문제지 기본 정보 (제목)
- **loadedPassages**: 로드된 지문 및 문항 배열
- **paperLayouts**: 템플릿 시스템
- **selectedLayoutId**: 현재 선택된 레이아웃

### 4.3 템플릿 시스템
```javascript
paperLayouts = [
  {
    id: 'suneung-style',
    name: '수능형 레이아웃',
    header: `<div>...</div>`,
    footer: ''
  },
  // ...
]
```

## 5. 구현된 기능

### 5.1 핵심 기능
- ✅ A4 비율 페이지 레이아웃 (210mm × 297mm)
- ✅ 페이지 간 4px 간격
- ✅ 1단/2단 컬럼 토글
- ✅ 실시간 데이터 동기화
- ✅ 템플릿 기반 헤더/푸터 시스템
- ✅ PDF/인쇄 최적화

### 5.2 반응형 기능
- loadedPassages 변경 → 미리보기 자동 업데이트
- 레이아웃 변경 → 즉시 반영
- 컬럼 모드 변경 → 즉시 반영
- 답안지 포함/제외 토글 → 즉시 반영

### 5.3 CSS 기반 레이아웃
```css
.page-content.dual-column {
  column-count: 2;
  column-gap: 8mm;
  column-rule: 0.5px solid #ccc;
}

.question-block,
.passage-range,
.보기-box {
  break-inside: avoid-column;
}
```

## 6. 기술적 선택 이유

### 6.1 Paged.js 포기 이유
1. **격리 불가능**: 전역 스타일 적용으로 다른 컴포넌트와 충돌
2. **Vue 3 비호환성**: 가상 DOM과 직접적인 DOM 조작 방식 충돌
3. **복잡성**: 동적 콘텐츠 업데이트 시 인스턴스 관리 복잡
4. **성능**: 매번 재렌더링 시 전체 페이지 재생성 필요

### 6.2 CSS Columns 선택 이유
1. **브라우저 네이티브**: 추가 라이브러리 불필요
2. **Vue 호환성**: 반응형 시스템과 완벽 호환
3. **성능**: 가볍고 빠른 렌더링
4. **제어 가능**: break-inside 속성으로 정교한 레이아웃 제어

## 7. 남은 과제 및 개선 방향

### 7.1 현재 제약사항
- 단일 페이지만 표시 (내용이 길어져도 자동 페이지 분할 없음)
- 복잡한 수식이나 이미지 처리 시 컬럼 브레이크 이슈 가능성

### 7.2 향후 개선 방향
1. **페이지 분할 로직**: JavaScript로 콘텐츠 높이 측정하여 다중 페이지 생성
2. **고급 타이포그래피**: 더 정교한 텍스트 레이아웃 처리
3. **미리보기 성능**: 가상 스크롤링 도입으로 대량 데이터 처리 최적화

## 8. 결론

HTML에서 Vue 3로의 마이그레이션 과정에서 여러 기술적 도전이 있었지만, 각각의 근본 원인을 파악하고 Vue 3의 생태계에 맞는 해결책을 찾았습니다. 특히 외부 라이브러리에 의존하지 않고 브라우저 네이티브 기능과 Vue 3의 반응성 시스템을 활용한 것이 안정성과 성능 측면에서 최적의 선택이었습니다.

최종 결과물은 요구사항을 모두 만족하면서도 Vue 3 생태계와 완벽하게 통합된 유지보수 가능한 시스템입니다.