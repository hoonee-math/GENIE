// api/user.js - 사용자 정보 관련 API
import { apiGet, apiPatch, apiPut } from '@/utils/http';

/**
 * 사용자 전체 정보 조회
 */
export async function getUserInfoAPI() {
    return await apiGet('/api/info/select/entire');
}

/**
 * 사용자 티켓 정보 조회 (순수 API 호출)
 * ✅ Store에서 사용할 순수 API 함수
 */
export async function getUserTicketDirectAPI() {
    const response = await fetch('/api/info/select/ticket', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`티켓 정보 조회 실패: ${response.status}`);
    }
    
    return await response.json();
}

/**
 * 사용자 티켓 정보 조회 (apiGet 사용 - Composable용)
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

// 통합 객체로 내보내기
export const userAPI = {
    getInfo: getUserInfoAPI,
    getTicket: getUserTicketAPI,
    getTicketDirect: getUserTicketDirectAPI, // Store용
    updateName: updateUserNameAPI,
    updateType: updateUserTypeAPI,
    updatePassword: updatePasswordAPI
};
