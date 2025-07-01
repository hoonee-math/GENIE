// src/composables/useAuth.js - Vue Composition API 인증 훅
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { loginAPI, logoutAPI, APIError, getErrorMessage } from '@/utils/api';

/**
 * 인증 관련 Vue Composition API
 * - 로그인/로그아웃 로직
 * - 인증 상태 반응형 추적
 * - 에러 처리 통합
 * - 라우터 리다이렉트 자동화
 */
export function useAuth() {
    const router = useRouter();
    const authStore = useAuthStore();
    
    // ========== 반응형 상태 ==========
    const isLoading = ref(false);
    const error = ref(null);
    
    // ========== 컴퓨티드 속성 ==========
    const isLoggedIn = computed(() => authStore.isLoggedIn);
    const user = computed(() => authStore.user);
    const userTicketCount = computed(() => authStore.userTicketCount);
    const hasValidToken = computed(() => authStore.hasValidToken);
    
    // ========== 로그인 함수 ==========
    async function login(email, password, autoLogin = false) {
        if (isLoading.value) return false;
        
        isLoading.value = true;
        error.value = null;
        
        try {
            console.log('=== 보안 우선 로그인 시작 ===');
            console.log('이메일:', email);
            console.log('자동 로그인:', autoLogin);
            
            // API 호출 (httpOnly 쿠키 자동 설정)
            console.log('useAuth: loginAPI 호출 시작');
            const loginData = await loginAPI(email, password);
            console.log('useAuth: loginAPI 응답 데이터:', loginData);
            
            // 인증 스토어에 토큰 저장 (메모리에만)
            console.log('useAuth: authStore.setTokens 호출');
            authStore.setTokens(loginData);
            console.log('useAuth: authStore.setTokens 완료');
            
            // 사용자 정보 저장 (autoLogin 설정에 따라)
            authStore.saveUserInfo(autoLogin);
            
            // 자동 토큰 갱신 스케줄링
            authStore.setupTokenRefresh();
            
            console.log('로그인 성공:', loginData.name);
            return true;
            
        } catch (err) {
            console.error('로그인 실패:', err);
            error.value = getErrorMessage(err);
            return false;
        } finally {
            isLoading.value = false;
        }
    }
    
    // ========== 로그아웃 함수 ==========
    async function logout(redirectTo = '/login') {
        if (isLoading.value) return;
        
        isLoading.value = true;
        error.value = null;
        
        try {
            console.log('=== 보안 우선 로그아웃 시작 ===');
            
            // 서버 로그아웃 (httpOnly 쿠키 삭제)
            await authStore.logout();
            
            console.log('로그아웃 완료');
            
            // 로그인 페이지로 리다이렉트
            if (redirectTo) {
                await router.push(redirectTo);
            }
            
        } catch (err) {
            console.error('로그아웃 중 오류:', err);
            // 로그아웃은 실패해도 강제 진행
            authStore.forceLogout();
            
            if (redirectTo) {
                await router.push(redirectTo);
            }
        } finally {
            isLoading.value = false;
        }
    }
    
    // ========== 자동 로그인 체크 ==========
    async function checkAutoLogin() {
        if (isLoading.value) return false;
        
        isLoading.value = true;
        error.value = null;
        
        try {
            console.log('=== 자동 로그인 체크 시작 ===');
            
            // 인증 상태 초기화 (httpOnly 쿠키 토큰 갱신 포함)
            const success = await authStore.initializeAuth();
            
            if (success && authStore.isLoggedIn) {
                console.log('자동 로그인 성공:', authStore.user.name);
                return true;
            } else {
                console.log('자동 로그인 실패 - 재로그인 필요');
                return false;
            }
            
        } catch (err) {
            console.error('자동 로그인 체크 오류:', err);
            error.value = getErrorMessage(err);
            return false;
        } finally {
            isLoading.value = false;
        }
    }
    
    // ========== 토큰 수동 갱신 ==========
    async function refreshToken() {
        if (isLoading.value) return false;
        
        try {
            console.log('수동 토큰 갱신 시도');
            return await authStore.refreshToken();
        } catch (err) {
            console.error('토큰 갱신 실패:', err);
            error.value = getErrorMessage(err);
            return false;
        }
    }
    
    // ========== 티켓 정보 업데이트 ==========
    async function updateTicketCount() {
        if (!authStore.isLoggedIn) return 0;
        
        try {
            return await authStore.updateTicketCount();
        } catch (err) {
            console.error('티켓 정보 업데이트 실패:', err);
            return 0;
        }
    }
    
    // ========== 인증 필요 페이지 가드 ==========
    function requireAuth(redirectTo = '/login') {
        if (!authStore.isLoggedIn) {
            console.log('인증 필요 - 로그인 페이지로 리다이렉트');
            router.push(redirectTo);
            return false;
        }
        return true;
    }
    
    // ========== 게스트 전용 페이지 가드 ==========
    function requireGuest(redirectTo = '/home') {
        if (authStore.isLoggedIn) {
            console.log('이미 로그인됨 - 홈으로 리다이렉트');
            router.push(redirectTo);
            return false;
        }
        return true;
    }
    
    // ========== 에러 초기화 ==========
    function clearError() {
        error.value = null;
    }
    
    // ========== 로딩 상태 감시 ==========
    watch(isLoading, (newValue) => {
        if (newValue) {
            error.value = null; // 로딩 시작 시 에러 초기화
        }
    });
    
    // ========== 인증 상태 감시 ==========
    watch(
        () => authStore.isAuthenticated,
        (isAuthenticated) => {
            console.log('인증 상태 변경:', isAuthenticated);
            
            if (!isAuthenticated) {
                // 로그아웃 상태가 되면 에러 초기화
                error.value = null;
            }
        }
    );
    
    // ========== 반환 객체 ==========
    return {
        // 상태
        isLoggedIn,
        user,
        userTicketCount,
        hasValidToken,
        isLoading,
        error,
        
        // 메서드
        login,
        logout,
        checkAutoLogin,
        refreshToken,
        updateTicketCount,
        requireAuth,
        requireGuest,
        clearError,
        
        // 스토어 직접 접근 (고급 사용)
        authStore
    };
}

/**
 * 인증 상태만 필요한 경우 사용하는 경량 훅
 */
export function useAuthState() {
    const authStore = useAuthStore();
    
    return {
        isLoggedIn: computed(() => authStore.isLoggedIn),
        user: computed(() => authStore.user),
        userTicketCount: computed(() => authStore.userTicketCount),
        hasValidToken: computed(() => authStore.hasValidToken),
        isAuthenticated: computed(() => authStore.isAuthenticated)
    };
}

/**
 * 토큰 정보만 필요한 경우 사용하는 훅
 */
export function useAuthToken() {
    const authStore = useAuthStore();
    
    return {
        hasValidToken: computed(() => authStore.hasValidToken),
        tokenExpiresIn: computed(() => authStore.tokenExpiresIn),
        authHeader: computed(() => authStore.authHeader),
        refreshToken: () => authStore.refreshToken()
    };
}

/**
 * 라우터 가드용 훅
 */
export function useAuthGuard() {
    const router = useRouter();
    const authStore = useAuthStore();
    
    return {
        requireAuth: (redirectTo = '/login') => {
            if (!authStore.isLoggedIn) {
                router.push(redirectTo);
                return false;
            }
            return true;
        },
        
        requireGuest: (redirectTo = '/home') => {
            if (authStore.isLoggedIn) {
                router.push(redirectTo);
                return false;
            }
            return true;
        },
        
        checkAuth: async () => {
            return await authStore.initializeAuth();
        }
    };
}
