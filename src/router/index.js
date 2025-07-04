// @/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Frame from "@/views/layout/Frame.vue";
import ExampleView from "@/views/ExampleView.vue";
import { useAuthGuard } from "@/composables/useAuth";
import { useAuthStore } from "@/stores/auth"; // authStore 사용을 위해 추가

// 각 페이지의 라우트들 import
import LandingView from "@/views/landing/LandingView.vue";
import mainRoutes from "./main.routes";
import memberRoutes from "./member.routes";
import generationRoutes from "./generation.routes";
import myPageRoutes from "./mypage.routes";
import storageRoutes from "./storage.routes";
import payRoutes from "./payment.routes";
// 로그인 상태 체크 가드 - 보안 우선 인증 시스템 사용
const requireAuth = async (to, from, next) => {
    const authStore = useAuthStore(); // authStore 초기화
    
    console.log('=== 보안 우선 인증 가드 실행 requireAuth(to,from,next) ===');
    console.log('현재 이동하려는 페이지:', to.path);
    console.log('이전 페이지:', from.path);
    
    // 1차: 기본 상태 체크
    if (!authStore.isLoggedIn || !authStore.accessToken || !authStore.user) {
        console.log('❌ 기본 인증 상태 실패 - 로그인 필요');
        next('/login');
        return;
    }
    
    // 2차: 토큰 유효성 체크
    if (!authStore.hasValidToken) {
        console.log('❌ 토큰 무효 - 로그인 필요');
        next('/login');
        return;
    }
    
    // 3차: 서버 검증 (선택사항)
    try {
        // 마이그레이션 가이드에 따른 새로운 인증 체크 방식
        const { checkAuth } = useAuthGuard();
        const isAuthenticated = await checkAuth();
        // console.log('인증 상태:', isAuthenticated);
        
        if (isAuthenticated) {
            // console.log('인증 성공 - 페이지 접근 허용');
            next();
        } else {
            console.log('인증 실패 - 로그인 페이지로 리다이렉트');
            next('/login');
        }
    } catch (error) {
        console.error('인증 가드 오류:', error);
        console.log('오류 발생 - 로그인 페이지로 리다이렉트');
        next('/login');
    }
};

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        // 인증 없이 접근 가능
        { path: "/ex", name: "ex", component: ExampleView },
        { path: "/landing", name: "Landing", component: LandingView },
        ...memberRoutes,

        // Frame 컴포넌트를 부모로 하는 중첩 라우트 구조
        {
            path: "/",
            component: Frame,
            beforeEnter: requireAuth, // 인증 필요 - 모든 자식 라우트
            children: [
                ...mainRoutes,
                ...generationRoutes,
                ...myPageRoutes,
                ...strageRoutes,
                ...payRoutes,
            ],
        },
        // 존재하지 않는 페이지 처리
        { path: "/:pathMatch(.*)*", redirect: "/" },
    ],
});

export default router;
