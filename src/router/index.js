// @/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Frame from "@/views/layout/Frame.vue";
import ExampleView from "@/views/ExampleView.vue";
import { useAuthStore } from "@/stores/auth";

// 각 페이지의 라우트들 import
import LandingView from "@/views/landing/LandingView.vue";
import mainRoutes from "./main.routes";
import memberRoutes from "./member.routes";
import generationRoutes from "./generation.routes";
import myPageRoutes from "./mypage.routes";
import strageRoutes from "./storage.routes";
import payRoutes from "./payment.routes";

// 로그인 상태 체크 가드
const requireAuth = async (to, from, next) => {
    const authStore = useAuthStore();
    const autoLogin = localStorage.getItem("autoLogin");

    console.log("=== requireAuth 가드 실행 ===");
    console.log("현재 이동하려는 페이지:", to.path);
    console.log("autoLogin 설정:", autoLogin);
    console.log("현재 인증 상태:", authStore.isAuthenticated);

    // 이미 인증된 상태라면 바로 통과 (현재 세션 중에는 자동로그인 설정 무시)
    if (authStore.isAuthenticated) {
        console.log("이미 인증된 상태 - 접근 허용");
        next();
        return;
    }

    // 인증되지 않은 상태에서만 자동로그인 설정 확인
    // 자동로그인이 true가 아닌 경우, localStorage에서 복원하지 않음
    if (autoLogin !== "true") {
        console.log("자동로그인이 비활성화됨 - localStorage 복원 안함");

        // sessionStorage에서만 복원 시도
        const sessionUser = sessionStorage.getItem("authUser");
        if (sessionUser) {
            try {
                authStore.setUser(JSON.parse(sessionUser));
                console.log("sessionStorage에서 사용자 정보 복원");
                next();
                return;
            } catch (error) {
                console.error("sessionStorage 인증 정보 파싱 오류:", error);
            }
        }

        // sessionStorage에도 없으면 로그인 페이지로
        console.log("세션 정보 없음 - 로그인 페이지로 이동");
        next("/login");
        return;
    }

    // 자동로그인이 true인 경우 기존 로직 실행
    let authUser = localStorage.getItem("authUser");

    if (authUser) {
        // authUser가 있으면 인증된 상태로 처리
        authStore.setUser(JSON.parse(authUser));
        console.log("localStorage에서 사용자 정보 복원");
        next();
    } else {
        // authUser가 없지만 유효한 세션이 있을 수 있으므로 세션 확인
        try {
            console.log("서버 세션 유효성 확인 중...");
            // 백엔드에 세션 유효성 확인 요청
            const response = await fetch(`/api/info/select/entire`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // 쿠키를 포함하여 요청
            });

            if (response.ok) {
                // 세션이 유효하고 사용자 정보를 받아옴
                const userData = await response.json();

                // 인증 스토어와 localStorage 업데이트
                authStore.setUser(userData);
                localStorage.setItem("authUser", JSON.stringify(userData));

                // 이용권 정보도 함께 업데이트
                await authStore.updateTicketCount();

                console.log("서버 세션에서 사용자 정보 복원");
                next();
            } else {
                // 세션이 유효하지 않음
                console.log("서버 세션 만료 - 로그인 페이지로 이동");
                next("/login");
            }
        } catch (error) {
            console.log("세션 확인 중 오류 - 로그인 페이지로 이동");
            next("/login");
        }
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
