<template>
    <div
        class="flex flex-col lg:flex-row h-screen w-full overflow-hidden text-gray-900"
    >
        <!-- 로그인 카드 -->
        <div
            class="flex items-center justify-center w-full lg:w-1/2 px-6 md:bg-[#e8f4ff] h-screen"
        >
            <main
                class="w-full max-w-md bg-white md:bg-white md:rounded-[2rem] md:shadow-xl md:border md:border-gray-100 p-10 md:p-12"
            >
                <h2
                    class="hidden md:block text-2xl md:text-3xl font-semibold mb-8 text-gray-800"
                >
                    로그인
                </h2>
                <h2
                    class="md:hidden text-3xl font-extrabold mb-8 text-[#0086FF] text-center"
                >
                    GENIE
                </h2>
                <form @submit.prevent="loginHandler" class="space-y-5">
                    <!-- 이메일 -->
                    <div>
                        <label for="email" class="sr-only">이메일</label>
                        <input
                            id="email"
                            type="email"
                            v-model="email"
                            @input="validateEmail"
                            placeholder="이메일"
                            :class="[
                                'w-full border border-gray-200 rounded-lg py-4 px-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 hover:shadow-lg hover:-translate-y-0.3 transition-all duration-300 ease-out hover:border-[var(--primary)]',
                                emailError
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-200 focus:ring-primary hover:border-primary',
                            ]"
                        />
                        <p v-if="emailError" class="mt-1 text-xs text-red-500">
                            {{ emailError }}
                        </p>
                    </div>

                    <!-- 비밀번호 -->
                    <div>
                        <label for="password" class="sr-only">비밀번호</label>
                        <input
                            id="password"
                            type="password"
                            v-model="password"
                            placeholder="비밀번호"
                            :class="[
                                'w-full border border-gray-200 rounded-lg py-4 px-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 hover:shadow-lg hover:-translate-y-0.3 transition-all duration-300 ease-out hover:border-[var(--primary)]',
                                loginFailed
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-200 focus:ring-primary hover:border-primary',
                            ]"
                        />
                        <p v-if="loginFailed" class="mt-1 text-xs text-red-500">
                            이메일 또는 비밀번호가 일치하지 않습니다.
                        </p>
                    </div>

                    <!-- 자동 로그인 -->
                    <div class="flex items-center">
                        <input
                            id="autoLogin"
                            type="checkbox"
                            v-model="autoLogin"
                            class="w-4 h-4 text-primary border-gray-300 rounded"
                        />
                        <label
                            for="autoLogin"
                            class="ml-2 text-xs text-gray-500 select-none"
                        >
                            자동 로그인
                        </label>
                    </div>

                    <!-- 로그인 버튼 -->
                    <button
                        type="submit"
                        :disabled="!canSubmit"
                        class="w-full py-4 rounded-lg text-white font-semibold bg-[var(--primary)] transition-all duration-300 ease-out hover:opacity-90 hover:shadow-xl hover:-translate-y-0.3 disabled:cursor-not-allowed"
                    >
                        로그인
                    </button>

                    <!-- OR 구분선 -->
                    <div class="flex items-center my-2">
                        <span class="flex-grow border-t border-gray-200"></span>
                        <span
                            class="px-3 text-xs text-gray-400 whitespace-nowrap"
                            >또는</span
                        >
                        <span class="flex-grow border-t border-gray-200"></span>
                    </div>

                    <!-- 구글 로그인 -->
                    <button
                        type="button"
                        @click="googleLogin"
                        class="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 hover:shadow-lg hover:-translate-y-0.3 transition-all duration-300 ease-out"
                    >
                        <Icon
                            icon="flat-color-icons:google"
                            width="20"
                            height="20"
                        />
                        구글 계정으로 로그인
                    </button>

                    <!-- 비밀번호 찾기 / 회원가입 -->
                    <div class="text-center mt-2">
                        <router-link
                            to="/passwordsearch"
                            class="text-xs text-gray-600 hover:underline"
                        >
                            비밀번호를 잊으셨나요?
                        </router-link>
                    </div>
                    <div class="text-center text-xs mt-1">
                        계정이 없으신가요?
                        <router-link
                            to="/signup"
                            class="text-primary hover:underline"
                            >가입하기</router-link
                        >
                    </div>
                </form>
            </main>
        </div>

        <!-- 소개 영역 (데스크탑) -->
        <div
            class="hidden lg:flex flex-col justify-center items-start w-1/2 p-12 bg-white"
        >
            <header class="max-w-lg text-left">
                <h1
                    class="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold leading-tight"
                >
                    문제 출제를
                    <span class="text-[var(--primary)]"
                        >더 쉽고, 빠르고, 정확하게!</span
                    >
                </h1>
                <p class="mt-4 text-[clamp(1.25rem,4vw,2rem)] font-bold">
                    <span class="text-[var(--primary)]">Genie</span>와 함께
                    새로운 차원의 문제 생성을 경험하세요.
                </p>
            </header>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Icon } from "@iconify/vue";

// 라우터 & 스토어
const router = useRouter();
const authStore = useAuthStore();

// 폼 상태
const email = ref("");
const password = ref("");
const emailError = ref("");
const loginFailed = ref(false);
const autoLogin = ref(localStorage.getItem("autoLogin") === "true");
const isLoading = ref(false);

// 이메일/비밀번호 동시 유효성 검사용
const canSubmit = computed(() => {
    const validEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(
        email.value
    );
    return validEmail && password.value.trim() !== "" && !isLoading.value;
});

// 이메일 포맷 체크
function validateEmail() {
    const valid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(
        email.value
    );
    emailError.value =
        !valid && email.value ? "이메일 형식으로 입력해 주세요" : "";
}

// 로그인 처리
async function loginHandler() {
    validateEmail();
    if (!canSubmit.value) return;

    loginFailed.value = false;
    isLoading.value = true;

    try {
        const res = await fetch("/api/auth/select/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                memEmail: email.value,
                memPassword: password.value,
            }),
        });
        if (!res.ok) throw new Error(await res.text());
        const userData = await res.json();

        authStore.setUser(userData);

        console.log("자동로그인 확인 : ", autoLogin.value);
        if (autoLogin.value) {
            console.log("자동로그인 확인 localStorage : ", autoLogin.value);
            // 자동로그인 체크 시: localStorage에 저장 (브라우저 종료해도 유지)
            localStorage.setItem("authUser", JSON.stringify(userData));
            localStorage.setItem("autoLogin", "true");
            // sessionStorage 정리
            sessionStorage.removeItem("authUser");
        } else {
            console.log("자동로그인 확인 sessionStorage : ", autoLogin.value);
            // 자동로그인 체크 안 함: sessionStorage에 저장 (브라우저 종료 시 삭제)
            sessionStorage.setItem("authUser", JSON.stringify(userData));
            localStorage.setItem("autoLogin", "false");
            // localStorage 정리
            localStorage.removeItem("authUser");
        }

        router.push("/home");
    } catch {
        loginFailed.value = true;
    } finally {
        isLoading.value = false;
    }
}

// (옵션) 구글 로그인 핸들러
function googleLogin() {
    // 여기에 Google OAuth 로직 추가
}

watch(email, validateEmail);
</script>
