import LoginView from "@/views/member/LoginView.vue";
import SingUpPage from "@/views/member/SingUpPage.vue";
import PasswordSearch from "@/views/member/PasswordSearch.vue";
import TempPasswordNotice from "@/views/member/TempPasswordNotice.vue";
import { useAuthGuard } from "@/composables/useAuth";
import { useAuthStore } from "@/stores/auth";

// 게스트 전용 가드 (인증된 사용자 차단)
const requireGuest = async (to, from, next) => {
    const authStore = useAuthStore();
    
    console.log('=== 게스트 전용 가드 실행 ===');
    console.log('현재 페이지:', to.path);
    
    try {
        // 인증 상태 확인
        const { checkAuth } = useAuthGuard();
        const isAuthenticated = await checkAuth();
        
        if (isAuthenticated) {
            console.log('이미 인증됨 - 홈으로 리다이렉트');
            next('/home');
        } else {
            console.log('게스트 상태 - 페이지 접근 허용');
            next();
        }
    } catch (error) {
        console.error('게스트 가드 오류:', error);
        next(); // 오류 시 접근 허용
    }
};

const authRoutes = [
  { path: "/login", name: "login", component: LoginView, beforeEnter: requireGuest },
  { path: "/signup", name: "signup", component: SingUpPage },
  {
    path: "/passwordsearch",
    name: "passwordsearch",
    component: PasswordSearch,
  },
  {
    path: "/temppasswordnotice",
    name: "temppasswordnotice",
    component: TempPasswordNotice,
  },
];

export default authRoutes;