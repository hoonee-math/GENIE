// src/stores/auth.js - Setup Store로 전환 (보안 우선 메모리 기반 인증 시스템)
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { logoutAPI, refreshTokenAPI } from '@/api/auth'; // ✅ API 모듈에서 import
import { getUserTicketDirectAPI } from '@/api/user'; // ✅ 티켓 API 추가

/**
 * 보안 우선 인증 스토어 (Setup Store)
 * - access token: 메모리에만 저장 (XSS 완전 차단)
 * - refresh token: httpOnly 쿠키로 서버가 관리 (JavaScript 접근 불가)
 * - 사용자 정보: autoLogin 설정에 따라 선택적 localStorage 사용
 * - 페이지 새로고침 시: httpOnly 쿠키로 토큰 자동 갱신
 */
export const useAuthStore = defineStore('auth', () => {
    // ========== 상태 (ref로 변환) ==========
    
    // 사용자 정보 (localStorage 허용)
    const user = ref(null);
    const isAuthenticated = ref(false);
    
    // JWT 토큰 (메모리에만 저장)
    const accessToken = ref(null);        // 짧은 수명 (15분)
    const tokenType = ref('Bearer');      // 고정값
    const expiresAt = ref(null);          // 만료 시간
    
    // refresh token은 httpOnly 쿠키로 서버가 관리
    // 프론트엔드에서는 접근 불가 (최고 보안)
    
    // UI 상태
    const isLoading = ref(false);
    const error = ref(null);
    
    // 토큰 갱신 상태
    const isRefreshing = ref(false);      // 토큰 갱신 중 여부
    const refreshPromise = ref(null);     // 중복 갱신 방지용

    // ========== Getters (computed로 변환) ==========
    
    // 로그인 상태 확인
    const isLoggedIn = computed(() => isAuthenticated.value && user.value !== null);
    
    // 사용자 정보
    const userInfo = computed(() => user.value);
    const userTicketCount = computed(() => user.value?.ticketCount || 0);
    
    // 토큰 유효성 확인
    const hasValidToken = computed(() => {
        return !!accessToken.value && 
               expiresAt.value && 
               new Date().getTime() < expiresAt.value;
    });
    
    // Authorization 헤더 문자열
    const authHeader = computed(() => {
        return accessToken.value ? `${tokenType.value} ${accessToken.value}` : null;
    });
    
    // 토큰 만료까지 남은 시간 (ms)
    const tokenExpiresIn = computed(() => {
        if (!expiresAt.value) return 0;
        return Math.max(0, expiresAt.value - new Date().getTime());
    });

    // ========== Actions (함수로 변환) ==========
    
    // 로그인 응답 처리 (메모리에만 저장)
    function setTokens(loginResponse) {
        accessToken.value = loginResponse.accessToken;
        tokenType.value = loginResponse.tokenType || 'Bearer';
        expiresAt.value = loginResponse.expiresAt;
        
        // 사용자 정보는 선택적으로 localStorage 저장
        if (loginResponse.memberCode) {
            user.value = {
                memberCode: loginResponse.memberCode,
                name: loginResponse.name,
                email: loginResponse.email,
                ticketCount: loginResponse.ticketCount || 0
            };
            isAuthenticated.value = true;
        }
        
        error.value = null;
        // console.log('Access Token 메모리 저장됨 (보안 강화)');
    }
    
    // 사용자 정보 저장 (autoLogin 설정에 따라)
    function saveUserInfo(autoLogin = false) {
        if (autoLogin && user.value) {
            localStorage.setItem('authUser', JSON.stringify(user.value));
            localStorage.setItem('autoLogin', 'true');
            sessionStorage.removeItem('authUser');
            // console.log('자동 로그인 활성화: 사용자 정보 localStorage 저장');
        } else if (user.value) {
            sessionStorage.setItem('authUser', JSON.stringify(user.value));
            localStorage.setItem('autoLogin', 'false');
            localStorage.removeItem('authUser');
            // console.log('일반 로그인: 사용자 정보 sessionStorage 저장');
        }
    }
    
    // 페이지 새로고침 시 토큰 복원
    async function initializeAuth() {
        // console.log('=== 인증 초기화 시작 ===');
        
        // 1. 사용자 정보 복원
        const autoLogin = localStorage.getItem('autoLogin') === 'true';
        let userData = null;
        
        if (autoLogin) {
            userData = localStorage.getItem('authUser');
            // console.log('자동 로그인 모드: localStorage 복원 시도');
        } else {
            userData = sessionStorage.getItem('authUser');
            // console.log('일반 로그인 모드: sessionStorage 복원 시도');
        }
        
        if (userData) {
            try {
                user.value = JSON.parse(userData);
                isAuthenticated.value = true;
                // console.log('사용자 정보 복원 성공:', user.value.name);
            } catch (err) {
                console.error('사용자 정보 파싱 오류:', err);
                forceLogout();
                return false;
            }
        }
        
        // 2. Access Token 재발급 (사용자 정보가 있을 때만)
        if (user.value) {
            return await refreshToken();
        } else {
            console.log('저장된 사용자 정보 없음 - 로그인 필요');
            return false;
        }
    }
    
    // 토큰 갱신 (httpOnly 쿠키 사용)
    async function refreshToken() {
        // 이미 갱신 중이면 기존 Promise 반환 (중복 요청 방지)
        if (isRefreshing.value && refreshPromise.value) {
            return refreshPromise.value;
        }
        
        isRefreshing.value = true;
        
        refreshPromise.value = (async () => {
            try {
                console.log('httpOnly 쿠키로 토큰 갱신 시도...');
                
                // ✅ API 모듈 사용으로 변경
                const tokenData = await refreshTokenAPI();
                setTokens(tokenData);
                console.log('토큰 갱신 성공');
                setupTokenRefresh();
                return true;
            } catch (err) {
                console.error('토큰 갱신 오류:', err);
                
                // 401 에러일 때만 강제 로그아웃
                if (err.status === 401) {
                    forceLogout();
                }
                
                // 네트워크 오류 시에는 강제 로그아웃 하지 않음
                return false;
            } finally {
                isRefreshing.value = false;
                refreshPromise.value = null;
            }
        })();
        
        return refreshPromise.value;
    }
    
    // 자동 토큰 갱신 스케줄링
    function setupTokenRefresh() {
        if (!expiresAt.value) return;
        
        // 만료 5분 전에 갱신
        const refreshTime = expiresAt.value - new Date().getTime() - (5 * 60 * 1000);
        
        if (refreshTime > 0) {
            // console.log(`토큰 자동 갱신 예약: ${Math.round(refreshTime / 1000)}초 후`);
            
            setTimeout(async () => {
                if (isAuthenticated.value) {
                    await refreshToken();
                }
            }, refreshTime);
        }
    }
    
    // 티켓 정보 업데이트
    async function updateTicketCount() {
        if (!isAuthenticated.value || !accessToken.value) {
            console.log('인증되지 않은 상태 - 티켓 업데이트 건너뛰기');
            return 0;
        }
    
        try {
            // ✅ API 모듈 사용으로 변경
            const data = await getUserTicketDirectAPI();
            const newTicketCount = parseInt(data.balance) || 0;
    
            if (user.value) {
                user.value.ticketCount = newTicketCount;
                
                // 업데이트된 사용자 정보 저장
                const autoLogin = localStorage.getItem('autoLogin') === 'true';
                saveUserInfo(autoLogin);
            }
    
            return newTicketCount;
        } catch (err) {
            console.error('티켓 정보 업데이트 오류:', err);
            
            // 401 에러 시 자동 갱신 시도
            if (err.status === 401) {
                await refreshToken();
                return updateTicketCount(); // 재귀 호출
            }
        }
        
        return 0;
    }
    
    // 로그아웃 (httpOnly 쿠키도 삭제)
    async function logout() {
        console.log('=== 보안 우선 로그아웃 시작 ===');
        
        try {
            // 1. 토큰이 있을 때 서버 로그아웃 먼저 호출 (중요!)
            if (accessToken.value) {
                await logoutAPI();
                console.log('서버 로그아웃 성공');
            }
        } catch (err) {
            console.error('서버 로그아웃 실패:', err);
            // 서버 로그아웃 실패해도 로컬 정리는 계속 진행
        }
        
        // 2. 로컬 상태 정리 (토큰 삭제 후)
        clearAllStorageData();
        accessToken.value = null;
        user.value = null;
        isAuthenticated.value = false;
        expiresAt.value = null;
        
        console.log('로그아웃 완료');
    }
    
    // 강제 로그아웃 (메모리만 정리)
    function forceLogout() {
        accessToken.value = null;
        expiresAt.value = null;
        user.value = null;
        isAuthenticated.value = false;
        error.value = null;
        isRefreshing.value = false;
        refreshPromise.value = null;
        
        clearAllStorageData();
        
        console.log('강제 로그아웃 - 메모리 정리 완료');
    }
    
    // 모든 스토리지 데이터 정리
    function clearAllStorageData() {
        // 기존 인증 정보 정리
        localStorage.removeItem('authUser');
        localStorage.removeItem('autoLogin');
        sessionStorage.removeItem('authUser');
        
        // 기존 token 키 마이그레이션 정리
        localStorage.removeItem('token');
        sessionStorage.removeItem('authTokens');
        
        console.log('모든 스토리지 데이터 정리 완료');
    }
    
    // 사용자 정보만 설정 (세션 로그인용)
    function setUser(userData) {
        user.value = userData;
        isAuthenticated.value = true;
        error.value = null;
        // console.log('사용자 정보 설정됨:', userData.name);
    }

    // ========== 반환 객체 ==========
    return {
        // 상태 (ref로 변환)
        user,
        isAuthenticated,
        accessToken,
        tokenType,
        expiresAt,
        isLoading,
        error,
        isRefreshing,
        refreshPromise,
        
        // Getters (computed로 변환)
        isLoggedIn,
        userInfo,
        userTicketCount,
        hasValidToken,
        authHeader,
        tokenExpiresIn,
        
        // Actions (함수로 변환)
        setTokens,
        saveUserInfo,
        initializeAuth,
        refreshToken,
        setupTokenRefresh,
        updateTicketCount,
        logout,
        forceLogout,
        clearAllStorageData,
        setUser
    };
});
