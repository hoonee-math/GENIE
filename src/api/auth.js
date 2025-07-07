// api/auth.js - 인증 관련 API만
import { APIError } from '@/utils/http';

/**
 * 인증 관련 API 호출 함수들
 * - 로그인/로그아웃
 * - 회원가입  
 * - 토큰 갱신
 * - 비밀번호 관련
 */

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
 * ✅ Store에서 사용할 순수 API 함수
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

/**
 * 회원가입 API
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
 * 회원탈퇴 API
 */
export async function withdrawAPI(email) {
    const response = await fetch('/api/auth/remove/withdrawal', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ memEmail: email })
    });
    
    if (!response.ok) {
        const errorData = await response.text();
        throw new APIError(`회원탈퇴 실패: ${errorData}`, response.status);
    }
    
    return await response.json();
}

// 통합 객체로 내보내기 (선택사항)
export const authAPI = {
    login: loginAPI,
    logout: logoutAPI,
    signUp: signUpAPI,
    checkEmail: checkEmailAPI,
    resetPassword: resetPasswordAPI,
    withdraw: withdrawAPI,
    refreshToken: refreshTokenAPI
};
