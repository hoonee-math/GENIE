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
            const loginData = await loginAPI(email, password);
            
            // 인증 스토어에 토큰 저장 (메모리에만)
            authStore.setTokens(loginData);
            
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
    
    // ========== 자동 로그인 체크 ==========\n    async function checkAutoLogin() {\n        if (isLoading.value) return false;\n        \n        isLoading.value = true;\n        error.value = null;\n        \n        try {\n            console.log('=== 자동 로그인 체크 시작 ===');\n            \n            // 인증 상태 초기화 (httpOnly 쿠키 토큰 갱신 포함)\n            const success = await authStore.initializeAuth();\n            \n            if (success && authStore.isLoggedIn) {\n                console.log('자동 로그인 성공:', authStore.user.name);\n                return true;\n            } else {\n                console.log('자동 로그인 실패 - 재로그인 필요');\n                return false;\n            }\n            \n        } catch (err) {\n            console.error('자동 로그인 체크 오류:', err);\n            error.value = getErrorMessage(err);\n            return false;\n        } finally {\n            isLoading.value = false;\n        }\n    }\n    \n    // ========== 토큰 수동 갱신 ==========\n    async function refreshToken() {\n        if (isLoading.value) return false;\n        \n        try {\n            console.log('수동 토큰 갱신 시도');\n            return await authStore.refreshToken();\n        } catch (err) {\n            console.error('토큰 갱신 실패:', err);\n            error.value = getErrorMessage(err);\n            return false;\n        }\n    }\n    \n    // ========== 티켓 정보 업데이트 ==========\n    async function updateTicketCount() {\n        if (!authStore.isLoggedIn) return 0;\n        \n        try {\n            return await authStore.updateTicketCount();\n        } catch (err) {\n            console.error('티켓 정보 업데이트 실패:', err);\n            return 0;\n        }\n    }\n    \n    // ========== 인증 필요 페이지 가드 ==========\n    function requireAuth(redirectTo = '/login') {\n        if (!authStore.isLoggedIn) {\n            console.log('인증 필요 - 로그인 페이지로 리다이렉트');\n            router.push(redirectTo);\n            return false;\n        }\n        return true;\n    }\n    \n    // ========== 게스트 전용 페이지 가드 ==========\n    function requireGuest(redirectTo = '/home') {\n        if (authStore.isLoggedIn) {\n            console.log('이미 로그인됨 - 홈으로 리다이렉트');\n            router.push(redirectTo);\n            return false;\n        }\n        return true;\n    }\n    \n    // ========== 에러 초기화 ==========\n    function clearError() {\n        error.value = null;\n    }\n    \n    // ========== 로딩 상태 감시 ==========\n    watch(isLoading, (newValue) => {\n        if (newValue) {\n            error.value = null; // 로딩 시작 시 에러 초기화\n        }\n    });\n    \n    // ========== 인증 상태 감시 ==========\n    watch(\n        () => authStore.isAuthenticated,\n        (isAuthenticated) => {\n            console.log('인증 상태 변경:', isAuthenticated);\n            \n            if (!isAuthenticated) {\n                // 로그아웃 상태가 되면 에러 초기화\n                error.value = null;\n            }\n        }\n    );\n    \n    // ========== 반환 객체 ==========\n    return {\n        // 상태\n        isLoggedIn,\n        user,\n        userTicketCount,\n        hasValidToken,\n        isLoading,\n        error,\n        \n        // 메서드\n        login,\n        logout,\n        checkAutoLogin,\n        refreshToken,\n        updateTicketCount,\n        requireAuth,\n        requireGuest,\n        clearError,\n        \n        // 스토어 직접 접근 (고급 사용)\n        authStore\n    };\n}\n\n/**\n * 인증 상태만 필요한 경우 사용하는 경량 훅\n */\nexport function useAuthState() {\n    const authStore = useAuthStore();\n    \n    return {\n        isLoggedIn: computed(() => authStore.isLoggedIn),\n        user: computed(() => authStore.user),\n        userTicketCount: computed(() => authStore.userTicketCount),\n        hasValidToken: computed(() => authStore.hasValidToken),\n        isAuthenticated: computed(() => authStore.isAuthenticated)\n    };\n}\n\n/**\n * 토큰 정보만 필요한 경우 사용하는 훅\n */\nexport function useAuthToken() {\n    const authStore = useAuthStore();\n    \n    return {\n        hasValidToken: computed(() => authStore.hasValidToken),\n        tokenExpiresIn: computed(() => authStore.tokenExpiresIn),\n        authHeader: computed(() => authStore.authHeader),\n        refreshToken: () => authStore.refreshToken()\n    };\n}\n\n/**\n * 라우터 가드용 훅\n */\nexport function useAuthGuard() {\n    const router = useRouter();\n    const authStore = useAuthStore();\n    \n    return {\n        requireAuth: (redirectTo = '/login') => {\n            if (!authStore.isLoggedIn) {\n                router.push(redirectTo);\n                return false;\n            }\n            return true;\n        },\n        \n        requireGuest: (redirectTo = '/home') => {\n            if (authStore.isLoggedIn) {\n                router.push(redirectTo);\n                return false;\n            }\n            return true;\n        },\n        \n        checkAuth: async () => {\n            return await authStore.initializeAuth();\n        }\n    };\n}