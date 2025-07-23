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
// 개선된 인증 가드 - 토큰 갱신을 먼저 시도
const requireAuth = async (to, from, next) => {
    const authStore = useAuthStore();
    
    try {
        // ✅ 1. 이미 유효한 토큰이 있으면 바로 통과
        if (authStore.isLoggedIn && authStore.hasValidToken) {
            console.log('✅ 유효한 토큰 존재 - 페이지 접근 허용');
            next();
            return;
        }
        
        // ✅ 2. 토큰이 없거나 만료된 경우만 갱신 시도
        console.log('🔄 토큰 갱신 필요 - initializeAuth 호출');
        const authSuccess = await authStore.initializeAuth();
        
        if (authSuccess && authStore.isLoggedIn) {
            console.log('✅ 토큰 갱신 성공 - 페이지 접근 허용');
            next();
        } else {
            console.log('❌ 토큰 갱신 실패 - 로그인 필요');
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
                ...storageRoutes,
                ...payRoutes,
            ],
        },
        // 존재하지 않는 페이지 처리
        { path: "/:pathMatch(.*)*", redirect: "/" },
    ],
});

export default router;
