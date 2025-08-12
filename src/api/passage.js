import { apiGet, apiPost, apiPut, apiPatch } from "@/utils/http";

/**
 * Passage Storage API 모듈
 * 이 모듈은 백엔드 지문 및 문항 저장 관련 API 호출을 처리합니다.
 * Java Spring Boot 기반의 백엔드와 통신합니다.
 * 지문과 문항 관련 api endpoint 는 백엔드 서버의 PassageController.java에 정의되어 있습니다.
 * '@/utils/http'를 이용하여 JWT 토큰 기반 인증을 사용합니다.
 */

// 지문 개별 저장 (/api/pass/insert/each)
export async function savePassageToDatabase(passageData) {
  try {
    // console.log('💾 [DB SAVE] 지문 저장 요청:', passageData);
    const response = await apiPost("/api/pass/insert/each", passageData);
    // console.log('💾 [DB SAVE] 지문 저장 성공:', response);
    return response;
  } catch (error) {
    console.error("💾 [DB SAVE] 지문 저장 실패:", error);
    throw error;
  }
}

// 지문 개별 조회 (/api/pass/select/{pasCode})
export async function getPassageFromDatabase(pasCode) {
  try {
    // console.log('📖 [DB GET] 지문 조회 요청:', pasCode);
    const response = await apiGet(`/api/pass/select/${pasCode}`);
    // console.log('📖 [DB GET] 지문 조회 성공:', response);
    return response;
  } catch (error) {
    console.error("📖 [DB GET] 지문 조회 실패:", error);
    throw error;
  }
}

// 지문 수정 (/api/pass/update/each)
export async function updatePassageInDatabase(passageData) {
  try {
    // console.log('✏️ [DB UPDATE] 지문 수정 요청:', passageData);
    const response = await apiPost("/api/pass/update/each", passageData);
    // console.log('✏️ [DB UPDATE] 지문 수정 성공:', response);
    return response;
  } catch (error) {
    console.error("✏️ [DB UPDATE] 지문 수정 실패:", error);
    throw error;
  }
}

// 지문 데이터 수정 (/api/pass/{pasCode}) - updates 추가 가능한 key 목록: title, content, isFavorite 수정 가능 (null 이면 수정안함)
export async function updatePassagePartial(pasCode, updates) {
  try {
    console.log('🔄 [PATCH] 지문 부분 수정 요청:', { pasCode, updates });
    const response = await apiPatch(`/api/pass/${pasCode}`, updates);
    console.log('✅ [PATCH] 지문 부분 수정 성공:', response);
    return response;
  } catch (error) {
    console.error('❌ [PATCH] 지문 부분 수정 실패:', error);
    throw error;
  }
}

// 문항 생성 페이지에서 최근 자료실 지문 호출 (/api/pass/select/prevlist) // DB에서 isGenerated = 1 인 값만 조회함
export async function getPrevPassageListInDatabase() {
  try {
    // console.log('📖 [DB GET] 최근 생성한 지문 리스트 조회 요청');
    const response = await apiGet("/api/pass/select/prevlist");
    // console.log('📖 [DB GET] 최근 생성한 지문 리스트 조회 성공:', response);
    return response;
  } catch (error) {
    console.error("📖 [DB GET] 최근 생성한 지문 리스트 조회 실패:");
    throw error;
  }
}

// 지문 + 문항 저장 (/api/pass/ques/insert/each)
// 이 API는 처음 문항을 생성할 때, 지문을 함께 저장합니다.
// 문항 추가히가를 이용해서 문항을 추가할 때의 endpoint 확인이 필요합니다.
export async function savePassageWithQuestionsToDatabase(saveRequestData) {
  try {
    // console.log('💾 [DB SAVE] 문항 저장 요청:', saveRequestData);
    const response = await apiPost(
      "/api/pass/ques/insert/each",
      saveRequestData
    );
    // console.log('💾 [DB SAVE] 문항 저장 성공:', response);
    return response;
  } catch (error) {
    console.error("💾 [DB SAVE] 문항 저장 실패:", error);
    throw error;
  }
}

// 문항 추가하기 요청
export async function addQuestionToExistingPassageInDatabase(
  pasCode,
  questionData
) {
  try {
    console.log("📝 [DB ADD] 문항 추가 요청:", pasCode, questionData);
    const response = await apiPost(
      `/api/pass/ques/add/${pasCode}`,
      questionData
    );
    console.log("📝 [DB ADD] 문항 추가 성공:", response);
    return response;
  } catch (error) {
    console.error("📝 [DB ADD] 문항 추가 실패:", error);
    throw error;
  }
}

// 지문 + 문항 조회 (/api/pass/ques/select/{pasCode})
export async function getPassageWithQuestionsFromDatabase(pasCode) {
  try {
    // console.log('📖 [DB GET] 문항 조회 요청:', pasCode);
    const response = await apiGet(`/api/pass/ques/select/${pasCode}`);
    // console.log('📖 [DB GET] 문항 조회 성공:', response);
    return response;
  } catch (error) {
    console.error("📖 [DB GET] 문항 조회 실패:", error);
    throw error;
  }
}

// 지문 + 문항 수정 (/api/pass/ques/update/{pasCode})
export async function updatePassageWithQuestionsInDatabase(
  pasCode,
  passageData
) {
  try {
    // console.log('✏️ [DB UPDATE] 문항 수정 요청:', pasCode, passageData);
    const response = await apiPut(
      `/api/pass/ques/update/${pasCode}`,
      passageData
    );
    // console.log('✏️ [DB UPDATE] 문항 수정 성공:', response);
    return response;
  } catch (error) {
    console.error("✏️ [DB UPDATE] 문항 수정 실패:", error);
    throw error;
  }
}

// 문항 수정 (/api/pass/{pasCode}/ques/{queCode}) - updates 추가 가능한 key 목록: queDescription, queAnswer, queOption, queQuery, queSubpassage 수정 가능 (null 이면 수정안함)
export async function updateQuestionPartial(pasCode, queCode, updates) {
  try {
    console.log('🔄 [PATCH] 문항 부분 수정 요청:', { queCode, updates });
    const response = await apiPatch(`/api/pass/${pasCode}/ques/${queCode}`, updates);
    console.log('✅ [PATCH] 문항 부분 수정 성공:', response);
    return response;
  } catch (error) {
    console.error('❌ [PATCH] 문항 부분 수정 실패:', error);
    throw error;
  }
}

// 문항이 있는 지문 목록 조회 (/api/pass/list/withquestions) 
export async function getPassagesWithQuestionsListFromDatabase() {
  try {
    console.log('📖 [DB GET] 문항이 있는 지문 목록 조회 요청');
    
    const response = await apiGet("/api/pass/list/withquestions");
    
    console.log('📖 [DB GET] 문항이 있는 지문 목록 조회 성공:', response.length, '개');
    return response;
  } catch (error) {
    console.error("📖 [DB GET] 문항이 있는 지문 목록 조회 실패:", error);
    throw error;
  }
}