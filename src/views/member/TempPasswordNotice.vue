<template>
    <!-- 모바일에서는 배경 없음, 데스크탑에서는 그라데이션 배경 -->
    <div
        class="flex justify-center items-center w-full min-h-screen p-5 bg-white md:bg-gradient-to-b md:from-[#E8F4FF] md:to-white"
    >
        <!-- 모바일에서는 그림자/테두리 없음, 데스크탑에서는 카드 스타일 -->
        <div
            class="flex flex-col items-center justify-center w-full max-w-[480px] p-10 gap-6 bg-white md:rounded-[20px] md:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]"
        >
            <h2
                class="w-full text-2xl font-bold leading-[150%] text-center tracking-[-0.02em] text-[#303030] m-0 mb-2"
            >
                임시 비밀번호가 발송되었습니다
            </h2>

            <div class="w-full mb-4 text-center text-[#3a3a3a]">
                <label class="break-all">
                    고객님의 이메일 주소로 임시 비밀번호를 발송했습니다.
                    <br />메일함을 확인하시고, 안내된 비밀번호로 로그인해
                    주세요.
                </label>
            </div>

            <!-- 이메일 표시 컨테이너 (주석 처리된 부분) -->
            <!-- <div class="flex items-start p-0 w-[380.22px] h-10 border border-[#e0e0e0] rounded overflow-hidden mx-auto my-5">
                <div class="flex items-center justify-center bg-[#333] text-white h-full w-1/5 text-xs whitespace-nowrap">이메일 주소</div>
                <div class="flex items-center px-2 flex-grow h-full bg-white text-xs text-[#333]">{{ userEmail }}</div>
            </div> -->

            <router-link to="/login" custom v-slot="{ navigate }">
                <button
                    class="w-full h-12 bg-[#0086FF] text-white border-none rounded-lg text-base font-semibold leading-[150%] tracking-[-0.02em] cursor-pointer transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-0.3 hover:scale-[1.02] hover:bg-blue-600 hover:opacity-90"
                    @click="navigate"
                >
                    로그인 페이지로 이동
                </button>
            </router-link>

            <router-link
                to="/passwordsearch"
                class="text-[#0086FF] no-underline transition-all duration-300 ease-out hover:underline hover:opacity-80 hover:-translate-y-0.5"
            >
                메일이 도착하지 않았나요? 재전송하기
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const userEmail = ref("");

// 컴포넌트가 마운트 될 때 이메일 값을 가져옴
onMounted(() => {
    if (route.query.email) {
        userEmail.value = route.query.email;
    }
});
</script>
