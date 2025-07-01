// src/utils/api.js - 보안 우선 API 요청 시스템
import { useAuthStore } from '@/stores/auth';

/**
 * 보안 우선 API 요청 함수
 * - 자동 토큰 갱신 (401 에러 시)
 * - Authorization 헤더 자동 설정
 * - httpOnly 쿠키 자동 포함
 * - 중복 토큰 갱신 방지
 * - 에러 처리 통합
 */

// ========== 커스텀 에러 클래스 ==========
export class APIError extends Error {
    constructor(message, status = 0, data = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

// ========== 기본 API 요청 함수 ==========
export async function apiRequest(url, options = {}) {
    const authStore = useAuthStore();
    
    // 기본 설정
    const defaultOptions = {
        credentials: 'include', // httpOnly 쿠키 자동 포함
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    // Authorization 헤더 자동 설정
    if (authStore.accessToken) {
        defaultOptions.headers.Authorization = authStore.authHeader;
    }
    
    try {
        console.log(`API 요청: ${options.method || 'GET'} ${url}`);
        
        const response = await fetch(url, defaultOptions);
        
        // 401 에러 처리 (토큰 만료)
        if (response.status === 401) {
            console.log('401 에러 발생 - 토큰 갱신 시도');
            
            // 토큰 갱신 시도
            const refreshSuccess = await authStore.refreshToken();
            
            if (refreshSuccess) {
                console.log('토큰 갱신 성공 - API 재시도');
                
                // 새로운 토큰으로 헤더 업데이트
                defaultOptions.headers.Authorization = authStore.authHeader;
                
                // API 재시도 및 새로운 응답 반환
                const retryResponse = await fetch(url, defaultOptions);
                console.log(`API 재시도 완료: ${retryResponse.status}`);
                return retryResponse;
            } else {
                console.log('토큰 갱신 실패 - 로그인 페이지로 리다이렉트 필요');
                throw new APIError('인증이 만료되었습니다. 다시 로그인해주세요.', 401);
            }
        }
        console.log("정상 응답 수신:", {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
        });
        
        // 정상 응답 반환 (401이 아닌 경우)
        return response;
    } catch (error) {
        console.error(`API 요청 오류 (${url}):`, error);
        
        if (error instanceof APIError) {
            throw error;
        }
        
        throw new APIError(`네트워크 오류가 발생했습니다: ${error.message}`, 0);
    }
}

// ========== HTTP 메서드별 편의 함수 ==========


 export async function apiGet(url, options = {}) {
     console.log(`apiGet 시작: ${url}`);
     
     const response = await apiRequest(url, {
         method: 'GET',
         ...options
     });
     
     console.log(`apiGet 응답 받음:`, {
         url,
         status: response.status,
         ok: response.ok,
         contentType: response.headers.get('content-type'),
         bodyUsed: response.bodyUsed, // 중요: body가 이미 사용되었는지 확인
         redirected: response.redirected
     });
     if (!response.ok) {
         const errorData = await response.text();
         console.error(`apiGet 에러:`, { url, status: response.status, errorData });
         throw new APIError(`GET ${url} 실패: ${errorData}`, response.status);
     }
     
     console.log(`apiGet JSON 파싱 시도: ${url}`);
     console.log(`JSON 파싱 전 bodyUsed 상태:`, response.bodyUsed);
     
     // Response를 미리 clone해두기 (에러 시 대안 방법용)
     const responseClone = response.clone();
     
     try {
         // Response가 이미 사용되었다면 clone을 사용
         const responseToUse = response.bodyUsed ? responseClone : response;
         
         // 타임아웃 추가 (10초로 단축)
         const timeoutPromise = new Promise((_, reject) => 
             setTimeout(() => reject(new Error('JSON 파싱 타임아웃')), 10000)
         );
         
         const jsonPromise = responseToUse.json();
         
         const jsonData = await Promise.race([jsonPromise, timeoutPromise]);
         console.log(`apiGet JSON 파싱 성공:`, { url, data: jsonData });
         return jsonData;
     } catch (jsonError) {
         console.error(`apiGet JSON 파싱 실패:`, { url, error: jsonError.message });
         
         // 대안: 텍스트로 읽어서 직접 파싱
         try {
             console.log(`대안 방법: 텍스트로 읽기 시도...`);
             const responseText = await response.clone().text();
             console.log(`응답 텍스트:`, responseText);
             
             const parsedData = JSON.parse(responseText);
             console.log(`대안 방법 성공:`, { url, data: parsedData });
             return parsedData;
         } catch (textError) {
             console.error(`대안 방법도 실패:`, textError.message);
         }
         
         throw new APIError(`JSON 파싱 실패: ${jsonError.message}`, response.status);
    }
}


/**
 * POST 요청
 */
export async function apiPost(url, data = null, options = {}) {
    const response = await apiRequest(url, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
        ...options
    });
    
    if (!response.ok) {
        const errorData = await response.text();
        throw new APIError(`POST ${url} 실패: ${errorData}`, response.status);
    }
    
    return await response.json();
}

/**
 * PUT 요청
 */
export async function apiPut(url, data = null, options = {}) {
    const response = await apiRequest(url, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
        ...options
    });
    
    if (!response.ok) {
        const errorData = await response.text();
        throw new APIError(`PUT ${url} 실패: ${errorData}`, response.status);
    }
    
    return await response.json();
}

/**
 * PATCH 요청
 */
export async function apiPatch(url, data = null, options = {}) {
    const response = await apiRequest(url, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
        ...options
    });
    
    if (!response.ok) {
        const errorData = await response.text();
        throw new APIError(`PATCH ${url} 실패: ${errorData}`, response.status);
    }
    
    return await response.json();
}

/**
 * DELETE 요청
 */
export async function apiDelete(url, options = {}) {
    const response = await apiRequest(url, {
        method: 'DELETE',
        ...options
    });
    
    if (!response.ok) {
        const errorData = await response.text();
        throw new APIError(`DELETE ${url} 실패: ${errorData}`, response.status);
    }
    
    return await response.json();
}

// ========== 인증 관련 특수 API ==========

/**
 * 로그인 API (httpOnly 쿠키 방식)
 * refresh token은 자동으로 httpOnly 쿠키에 저장됨
 */
export async function loginAPI(email, password) {
    console.log('보안 우선 로그인 API 호출');
    
    const response = await fetch('/api/auth/select/login', {
        method: 'POST',
        credentials: 'include', // httpOnly 쿠키 수신
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            memEmail: email,
            memPassword: password
        })
    });
    
    if (!response.ok) {
        const errorData = await response.text();
        throw new APIError(`로그인 실패: ${errorData}`, response.status);
    }
    
    const loginData = await response.json();
    console.log('로그인 성공 - refresh token은 httpOnly 쿠키에 자동 저장됨');
    
    return loginData;
}

/**
 * 토큰 갱신 API (httpOnly 쿠키 사용)
 * 별도 호출하지 말고 apiRequest가 자동으로 처리
 */
export async function refreshTokenAPI() {
    console.log('토큰 갱신 API 호출 (httpOnly 쿠키 사용)');
    
    const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // httpOnly 쿠키 포함
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new APIError('토큰 갱신 실패', response.status);
    }
    
    return await response.json();
}

/**
 * 로그아웃 API (httpOnly 쿠키 삭제)
 */
export async function logoutAPI() {
    console.log('로그아웃 API 호출 (httpOnly 쿠키 삭제)');
    
    const response = await fetch('/api/auth/select/logout', {
        method: 'POST',
        credentials: 'include', // httpOnly 쿠키 삭제
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        console.warn('로그아웃 API 실패 - 로컬 정리는 계속 진행');
    }
    
    return response.ok;
}

// ========== 사용자 정보 API ==========

/**
 * 사용자 전체 정보 조회
 */
export async function getUserInfoAPI() {
    return await apiGet('/api/info/select/entire');
}

/**
 * 사용자 티켓 정보 조회
 */
export async function getUserTicketAPI() {
    return await apiGet('/api/info/select/ticket');
}

/**
 * 회원 이름 수정
 */
export async function updateUserNameAPI(newName) {
    return await apiPatch('/api/info/update/name', { memName: newName });
}

/**
 * 회원 소속 수정
 */
export async function updateUserTypeAPI(newType) {
    return await apiPatch('/api/info/update/type', { memType: newType });
}

/**
 * 비밀번호 변경
 */
export async function updatePasswordAPI(currentPassword, newPassword, confirmPassword) {
    return await apiPatch('/api/info/update/password', {
        currentPassword,
        newPassword,
        confirmPassword
    });
}

// ========== 회원가입 및 계정 관련 API ==========

/**
 * 회원가입
 */
export async function signUpAPI(userData) {
    const response = await fetch('/api/auth/insert/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
        const errorData = await response.text();
        throw new APIError(`회원가입 실패: ${errorData}`, response.status);
    }
    
    return await response.text(); // 성공 메시지
}

/**
 * 이메일 중복 확인 (비밀번호 찾기용)
 */
export async function checkEmailAPI(email) {
    const response = await fetch(`/api/auth/select/email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    return {
        exists: response.ok,
        message: await response.text()
    };
}

/**
 * 임시 비밀번호 설정
 */
export async function resetPasswordAPI(email, tempPassword) {
    const response = await fetch('/api/auth/update/temporal', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            memEmail: email,
            tempPassword: tempPassword
        })
    });
    
    if (!response.ok) {
        const errorData = await response.text();
        throw new APIError(`비밀번호 재설정 실패: ${errorData}`, response.status);
    }
    
    return await response.text();
}

/**
 * 회원탈퇴
 */
export async function withdrawAPI(email) {
    return await apiPut('/api/auth/remove/withdrawal', { memEmail: email });
}

// ========== 유틸리티 함수 ==========

/**
 * API 에러를 사용자 친화적 메시지로 변환
 */
export function getErrorMessage(error) {
    if (error instanceof APIError) {
        switch (error.status) {
            case 400:
                return '잘못된 요청입니다. 입력 정보를 확인해주세요.';
            case 401:
                return '인증이 만료되었습니다. 다시 로그인해주세요.';
            case 403:
                return '접근 권한이 없습니다.';
            case 404:
                return '요청한 정보를 찾을 수 없습니다.';
            case 409:
                return '중복된 정보입니다.';
            case 500:
                return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            default:
                return error.message || '알 수 없는 오류가 발생했습니다.';
        }
    }
    
    return '네트워크 연결을 확인해주세요.';
}

/**
 * 디버그 모드에서만 API 로그 출력
 */
export function debugLog(message, data = null) {
    if (import.meta.env.DEV) {
        console.log(`[API Debug] ${message}`, data);
    }
}

// ========== 타입 검증 유틸리티 ==========

/**
 * 이메일 형식 검증
 */
export function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
}

/**
 * 비밀번호 강도 검증
 */
export function validatePassword(password) {
    // 최소 8자, 영문, 숫자 포함
    const minLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return {
        isValid: minLength && hasLetter && hasNumber,
        minLength,
        hasLetter,
        hasNumber
    };
}