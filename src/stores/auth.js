// src/stores/auth.js - 보안 우선 메모리 기반 인증 시스템
import { defineStore } from "pinia";

/**
 * 보안 우선 인증 스토어
 * - access token: 메모리에만 저장 (XSS 완전 차단)
 * - refresh token: httpOnly 쿠키로 서버가 관리 (JavaScript 접근 불가)
 * - 사용자 정보: autoLogin 설정에 따라 선택적 localStorage 사용
 * - 페이지 새로고침 시: httpOnly 쿠키로 토큰 자동 갱신
 */
export const useAuthStore = defineStore("auth", {
    state: () => ({
        // ========== 사용자 정보 (localStorage 허용) ==========
        user: null,
        isAuthenticated: false,
        
        // ========== JWT 토큰 (메모리에만 저장) ==========
        accessToken: null,        // 짧은 수명 (15분)
        tokenType: 'Bearer',      // 고정값
        expiresAt: null,          // 만료 시간
        
        // refresh token은 httpOnly 쿠키로 서버가 관리
        // 프론트엔드에서는 접근 불가 (최고 보안)
        
        // ========== UI 상태 ==========
        isLoading: false,
        error: null,
        
        // ========== 토큰 갱신 상태 ==========
        isRefreshing: false,      // 토큰 갱신 중 여부
        refreshPromise: null,     // 중복 갱신 방지용
    }),

    getters: {
        // 로그인 상태 확인
        isLoggedIn: (state) => state.isAuthenticated && state.user !== null,
        
        // 사용자 정보
        userInfo: (state) => state.user,
        userTicketCount: (state) => state.user?.ticketCount || 0,
        
        // 토큰 유효성 확인
        hasValidToken: (state) => {
            return !!state.accessToken && 
                   state.expiresAt && 
                   new Date().getTime() < state.expiresAt;
        },
        
        // Authorization 헤더 문자열
        authHeader: (state) => {
            return state.accessToken ? `${state.tokenType} ${state.accessToken}` : null;
        },
        
        // 토큰 만료까지 남은 시간 (ms)
        tokenExpiresIn: (state) => {
            if (!state.expiresAt) return 0;
            return Math.max(0, state.expiresAt - new Date().getTime());
        },
    },

    actions: {
        // ========== 로그인 응답 처리 (메모리에만 저장) ==========
        setTokens(loginResponse) {
            this.accessToken = loginResponse.accessToken;
            this.tokenType = loginResponse.tokenType || 'Bearer';
            this.expiresAt = loginResponse.expiresAt;
            
            // 사용자 정보는 선택적으로 localStorage 저장
            if (loginResponse.memberCode) {
                this.user = {
                    memberCode: loginResponse.memberCode,
                    name: loginResponse.name,
                    email: loginResponse.email,
                    ticketCount: loginResponse.ticketCount || 0
                };
                this.isAuthenticated = true;
            }
            
            this.error = null;
            // console.log('Access Token 메모리 저장됨 (보안 강화)');
        },
        
        // ========== 사용자 정보 저장 (autoLogin 설정에 따라) ==========
        saveUserInfo(autoLogin = false) {
            if (autoLogin && this.user) {
                localStorage.setItem('authUser', JSON.stringify(this.user));
                localStorage.setItem('autoLogin', 'true');
                sessionStorage.removeItem('authUser');
                // console.log('자동 로그인 활성화: 사용자 정보 localStorage 저장');
            } else if (this.user) {
                sessionStorage.setItem('authUser', JSON.stringify(this.user));
                localStorage.setItem('autoLogin', 'false');
                localStorage.removeItem('authUser');
                // console.log('일반 로그인: 사용자 정보 sessionStorage 저장');
            }
        },
        
        // ========== 페이지 새로고침 시 토큰 복원 ==========
        async initializeAuth() {
            // console.log('=== 보안 우선 인증 초기화 initializeAuth() ===');
            
            // 기존 데이터 마이그레이션 먼저 실행
            this.migrateOldData();
            
            // 1. 사용자 정보 복원 (localStorage 또는 sessionStorage에서)
            const autoLogin = localStorage.getItem('autoLogin') === 'true';
            let userData = null;
            
            if (autoLogin) {
                userData = localStorage.getItem('authUser');
                console.log('자동 로그인 모드: localStorage에서 사용자 정보 복원 시도');
            } else {
                userData = sessionStorage.getItem('authUser');
                console.log('일반 로그인 모드: sessionStorage에서 사용자 정보 복원 시도');
            }
            
            if (userData) {
                try {
                    this.user = JSON.parse(userData);
                    this.isAuthenticated = true;
                    console.log('사용자 정보 복원 성공:', this.user.name);
                } catch (error) {
                    console.error('사용자 정보 파싱 오류:', error);
                    this.forceLogout();
                    return false;
                }
            }
            
            // 2. Access Token 재발급 (httpOnly 쿠키의 refresh token 사용)
            return await this.refreshToken();
        },
        
        // ========== 토큰 갱신 (httpOnly 쿠키 사용) ==========
        async refreshToken() {
            // 이미 갱신 중이면 기존 Promise 반환 (중복 요청 방지)
            if (this.isRefreshing && this.refreshPromise) {
                return this.refreshPromise;
            }
            
            this.isRefreshing = true;
            
            this.refreshPromise = (async () => {
                try {
                    console.log('httpOnly 쿠키로 토큰 갱신 시도...');
                    
                    const response = await fetch('/api/auth/refresh', {
                        method: 'POST',
                        credentials: 'include', // httpOnly 쿠키 포함
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        const tokenData = await response.json();
                        
                        // 로그인과 동일한 방식으로 토큰 및 사용자 정보 업데이트
                        this.setTokens(tokenData);
                        
                        console.log('httpOnly 쿠키로 토큰 및 사용자 정보 갱신 성공');
                        
                        // 자동 갱신 스케줄링 (만료 5분 전)
                        this.setupTokenRefresh();
                        
                        return true;
                    } else {
                        console.log('토큰 갱신 실패 - 재로그인 필요');
                        this.forceLogout();
                        return false;
                    }
                } catch (error) {
                    console.error('토큰 갱신 중 오류:', error);
                    this.forceLogout();
                    return false;
                } finally {
                    this.isRefreshing = false;
                    this.refreshPromise = null;
                }
            })();
            
            return this.refreshPromise;
        },
        
        // ========== 자동 토큰 갱신 스케줄링 ==========
        setupTokenRefresh() {
            if (!this.expiresAt) return;
            
            // 만료 5분 전에 갱신
            const refreshTime = this.expiresAt - new Date().getTime() - (5 * 60 * 1000);
            
            if (refreshTime > 0) {
                // console.log(`토큰 자동 갱신 예약: ${Math.round(refreshTime / 1000)}초 후`);
                
                setTimeout(async () => {
                    if (this.isAuthenticated) {
                        await this.refreshToken();
                    }
                }, refreshTime);
            }
        },
        
        // ========== API 요청용 헤더 (메모리 토큰 사용) ==========
        getApiHeaders(additionalHeaders = {}) {
            const headers = {
                'Content-Type': 'application/json',
                ...additionalHeaders
            };
            
            if (this.accessToken) {
                headers.Authorization = `${this.tokenType} ${this.accessToken}`;
            }
            
            return headers;
        },
        
        // ========== 티켓 정보 업데이트 ==========
        async updateTicketCount() {
            if (!this.isAuthenticated || !this.accessToken) {
                console.log('인증되지 않은 상태 - 티켓 업데이트 건너뜀');
                return 0;
            }

            try {
                const response = await fetch('/api/info/select/ticket', {
                    method: 'GET',
                    headers: this.getApiHeaders(),
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    const newTicketCount = parseInt(data.balance) || 0;

                    if (this.user) {
                        this.user.ticketCount = newTicketCount;
                        
                        // 업데이트된 사용자 정보 저장
                        const autoLogin = localStorage.getItem('autoLogin') === 'true';
                        this.saveUserInfo(autoLogin);
                    }

                    return newTicketCount;
                } else if (response.status === 401) {
                    // 토큰 만료 시 자동 갱신 시도
                    await this.refreshToken();
                    return this.updateTicketCount(); // 재귀 호출
                }
            } catch (error) {
                console.error('티켓 정보 업데이트 오류:', error);
            }
            
            return 0;
        },
        
        // ========== 로그아웃 (httpOnly 쿠키도 삭제) ==========
        async logout() {
            this.isLoading = true;
            
            try {
                // 서버에 로그아웃 요청 (httpOnly 쿠키 삭제)
                await fetch('/api/auth/select/logout', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                console.error('서버 로그아웃 오류:', error);
            }
            
            // 로컬 상태 초기화
            this.accessToken = null;
            this.expiresAt = null;
            this.user = null;
            this.isAuthenticated = false;
            this.error = null;
            
            // localStorage/sessionStorage 정리
            this.clearAllStorageData();
            
            // console.log('로그아웃 완료 (httpOnly 쿠키 포함)');
            this.isLoading = false;
        },
        
        // ========== 강제 로그아웃 (메모리만 정리) ==========
        forceLogout() {
            this.accessToken = null;
            this.expiresAt = null;
            this.user = null;
            this.isAuthenticated = false;
            this.error = null;
            this.isRefreshing = false;
            this.refreshPromise = null;
            
            this.clearAllStorageData();
            
            console.log('강제 로그아웃 - 메모리 정리 완료');
        },
        
        // ========== 모든 스토리지 데이터 정리 ==========
        clearAllStorageData() {
            // 기존 인증 정보 정리
            localStorage.removeItem('authUser');
            localStorage.removeItem('autoLogin');
            sessionStorage.removeItem('authUser');
            
            // 기존 token 키 마이그레이션 정리
            localStorage.removeItem('token');
            sessionStorage.removeItem('authTokens');
            
            console.log('모든 스토리지 데이터 정리 완료');
        },
        
        // ========== 기존 데이터 마이그레이션 ==========
        migrateOldData() {
            // console.log('기존 localStorage 데이터 마이그레이션 시작...');
            
            // 기존 'token' 키 제거
            const oldToken = localStorage.getItem('token');
            if (oldToken) {
                localStorage.removeItem('token');
                console.log('기존 token 키 삭제 완료');
            }
            
            // 기존 'authTokens' 키 제거 (보안상 위험)
            const oldTokens = localStorage.getItem('authTokens');
            if (oldTokens) {
                localStorage.removeItem('authTokens');
                console.log('기존 authTokens 키 삭제 완료 (보안 강화)');
            }
            
            sessionStorage.removeItem('authTokens');
            // console.log('마이그레이션 완료');
        },
        
        // ========== 사용자 정보만 설정 (세션 로그인용) ==========
        setUser(userData) {
            this.user = userData;
            this.isAuthenticated = true;
            this.error = null;
            console.log('사용자 정보 설정됨:', userData.name);
        },
    },
});
