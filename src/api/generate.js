import { apiPost } from "@/utils/http";

/**
    * Passage Generation API 모듈
    * 이 모듈은 지문 생성 관련 API 호출을 처리합니다.
    * 각 함수는 API 엔드포인트에 POST 요청을 보내고, 결과를 반환합니다.
    * 에러 발생 시 콘솔에 로그를 남기고 에러를 다시 던집니다.
**/

// generate-single-passage
export async function generateSinglePassageAPI(requestData) {
    try {
        const response = await apiPost('/fastapi/generate-single-passage', requestData);
        // console.log('generated_passage:', response.generated_passage);
        // console.log('generated_core_point:', response.generated_core_point);
        return response;
    } catch (error) {
        console.error('단일 지문 생성 API 호출 실패:', error);
        throw error; // 에러를 다시 던져서 호출한 곳에서 처리할 수 있도록 함
    }
}

// generate-multiple-passage
export async function generateMultiplePassageAPI(requestData) {
    try {
        const response = await apiPost('/fastapi/generate-multiple-passage', requestData);
        return response;
    } catch (error) {
        console.error('다중 지문 생성 API 호출 실패:', error);
        throw error; // 에러를 다시 던져서 호출한 곳에서 처리할 수 있도록 함
    }
}

// generate-reading-passage
export async function generateReadingPassageAPI(requestData) {
    try {
        const response = await apiPost('/fastapi/generate-reading-passage', requestData);
        return response;
    } catch (error) {
        console.error('독해 지문 생성 API 호출 실패:', error);
        throw error; // 에러를 다시 던져서 호출한 곳에서 처리할 수 있도록 함
    }
}

/**
 * 문항 생성 관련 API 모듈
 * 이 모듈은 지문 기반 문항 생성 관련 API 호출을 처리합니다.
 * 각 함수는 API 엔드포인트에 POST 요청을 보내고, 결과를 반환합니다.
 * 에러 발생 시 콘솔에 로그를 남기고 에러를 다시 던집니다.
 **/

// generate-reading-passage-question
export async function generateReadingPassageQuestionAPI(requestData) {
    try {
        const response = await apiPost('/fastapi/generate-reading-passage-question', requestData);
        return response;
    } catch (error) {
        console.error('독해 지문 질문 생성 API 호출 실패:', error);
        throw error; // 에러를 다시 던져서 호출한 곳에서 처리할 수 있도록 함
    }
}

// generate-single-passage-question
export async function generateSinglePassageQuestionAPI(requestData) {
    try {
        const response = await apiPost('/fastapi/generate-single-passage-question', requestData);
        return response;
    } catch (error) {
        console.error('단일 지문 질문 생성 API 호출 실패:', error);
        throw error; // 에러를 다시 던져서 호출한 곳에서 처리할 수 있도록 함
    }
}

// generate-multiple-passage-question
export async function generateMultiplePassageQuestionAPI(requestData) {
    try {
        const response = await apiPost('/fastapi/generate-multiple-passage-question', requestData);
        return response;
    } catch (error) {
        console.error('다중 지문 질문 생성 API 호출 실패:', error);
        throw error; // 에러를 다시 던져서 호출한 곳에서 처리할 수 있도록 함
    }
}