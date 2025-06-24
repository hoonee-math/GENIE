<template>
    <div style="flex: 1">
        <div class="bg-white rounded-xl shadow-sm p-4 h-full flex flex-col">
            <div>
                <!-- 공통 -->
                <h2 class="text-lg md:text-xl font-bold leading-7 md:leading-8">
                    문제 출제를 더 쉽고, 빠르고, 정확하게
                    <br />안녕하세요.
                    <span class="text-brand font-bold">{{
                        authStore.user?.name || "회원"
                    }}</span
                    >님
                </h2>

                <!-- 데스트탑 -->
                <p class="hidden md:block mt-1 text-base md:text-lg text-end">
                    <span class="mr-2 font-medium">현재 보유 이용권 : </span>
                    <span class="font-bold text-brand"
                        >{{ ticketCount }}회 </span
                    >/ {{ maxTicketCount }} 회
                </p>

                <div
                    class="hidden md:block h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-3"
                >
                    <div
                        class="h-full transition-all duration-700"
                        :style="{
                            width: gaugeWidth + '%',
                            backgroundColor: '#0086ff',
                        }"
                    ></div>
                </div>

                <!-- 모바일 -->
                <div class="md:hidden mt-4 p-4 bg-sky-50 rounded-2xl">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-gray-600 font-medium"
                            >현재 보유 이용권</span
                        >
                        <div class="text-right">
                            <span class="font-bold text-brand text-lg">{{
                                ticketCount
                            }}</span>
                            <span class="text-gray-500"
                                >/{{ maxTicketCount }}회</span
                            >
                        </div>
                    </div>
                    <!-- Mobile Gauge Bar -->
                    <div
                        class="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden"
                    >
                        <div
                            class="h-full transition-all duration-700"
                            :style="{
                                width: gaugeWidth + '%',
                                backgroundColor: '#0086ff',
                            }"
                        ></div>
                    </div>
                </div>
            </div>

            <!-- 데스트탑 - 빠른 시작 -->
            <div
                class="hidden md:flex flex-col md:flex-row items-stretch md:items-center gap-4 mt-6"
            >
                <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <!-- 새 지문 생성 -->
                    <router-link
                        to="/passage"
                        custom
                        v-slot="{ navigate }"
                        class="w-full sm:w-auto"
                    >
                        <button
                            class="flex items-center justify-center h-12 px-3 sm:px-4 md:px-5 rounded-lg bg-brand hover:bg-brand-90 text-white text-sm sm:text-base font-medium shadow-sm transition-all duration-300 ease-out hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:bg-[#0066CC] break-keep w-full"
                            @click="navigate"
                            data-twe-ripple-init
                            data-twe-ripple-color="light"
                            aria-label="새 지문 생성"
                        >
                            <svg
                                class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
                                width="28"
                                height="29"
                                viewBox="0 0 28 29"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M22.0625 18.7499V22.7499M22.0625 22.7499V26.7499M22.0625 22.7499H26.0625M22.0625 22.7499H18.0625"
                                    stroke="#ffffff"
                                    stroke-width="2.66667"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M4.72949 0.083252H12.7295V8.08325C12.7295 9.14412 13.1509 10.1615 13.9011 10.9117C14.6512 11.6618 15.6686 12.0833 16.7295 12.0833H24.7295V15.2046C23.1871 14.6585 21.5144 14.5984 19.9369 15.0325C18.3593 15.4666 16.9528 16.374 15.907 17.6322C14.8611 18.8905 14.2263 20.4393 14.088 22.0696C13.9497 23.6999 14.3146 25.3334 15.1335 26.7499H4.72949C3.66863 26.7499 2.65121 26.3285 1.90107 25.5783C1.15092 24.8282 0.729492 23.8108 0.729492 22.7499V4.08325C0.729492 3.02239 1.15092 2.00497 1.90107 1.25482C2.65121 0.504679 3.66863 0.083252 4.72949 0.083252ZM24.7295 9.18725V9.41659H16.7295C16.3759 9.41659 16.0367 9.27611 15.7867 9.02606C15.5366 8.77601 15.3962 8.43687 15.3962 8.08325V0.083252H15.6255C16.6858 0.083832 17.7025 0.505381 18.4522 1.25525L23.5588 6.35925C24.3085 7.10944 24.7296 8.12666 24.7295 9.18725Z"
                                    fill="#ffffff"
                                />
                            </svg>
                            <span class="hidden xl:inline truncate"
                                >새 지문 생성</span
                            >
                        </button>
                    </router-link>

                    <!-- 새 문항 생성 -->
                    <router-link
                        to="/questions"
                        custom
                        v-slot="{ navigate }"
                        class="w-full sm:w-auto"
                    >
                        <button
                            class="flex items-center justify-center h-12 px-3 sm:px-4 md:px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base font-medium shadow-sm transition-all duration-300 ease-out hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:bg-indigo-800 break-keep w-full"
                            @click="navigate"
                            data-twe-ripple-init
                            data-twe-ripple-color="light"
                            aria-label="새 문항 생성"
                        >
                            <svg
                                class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
                                width="17"
                                height="17"
                                viewBox="0 0 17 17"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M2.85449 8.62488H2.86095M2.85449 12.4999H2.86095M2.85449 4.74988H2.86095M6.08366 8.62488H14.4795M6.08366 12.4999H14.4795M6.08366 4.74988H14.4795"
                                    stroke="white"
                                    stroke-width="1.29167"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                            <span class="hidden xl:inline truncate"
                                >새 문항 생성</span
                            >
                        </button>
                    </router-link>
                </div>

                <!-- 추가 구매 -->
                <router-link
                    :to="{ name: 'my-page-wrapper', query: { tab: '이용권' } }"
                    class="w-full md:w-auto md:ml-auto"
                >
                    <button
                        data-twe-ripple-init
                        data-twe-ripple-color="light"
                        class="h-12 px-3 sm:px-4 md:px-5 rounded-lg border-2 border-blue-600 text-brand hover:bg-blue-50 text-sm sm:text-base font-medium transition-all duration-300 ease-out hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:bg-blue-100 break-keep w-full"
                    >
                        <span class="truncate">추가 구매</span>
                    </button>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const ticketCount = ref(0);
const maxTicketCount = ref(0);

import { Ripple, initTWE } from "tw-elements";

initTWE({ Ripple });

const gaugeWidth = computed(() => {
    if (!ticketCount.value || !maxTicketCount.value) return 0;
    const percentage = (ticketCount.value / maxTicketCount.value) * 100;
    return Math.min(Math.max(percentage, 0), 100);
});

onMounted(() => {
    getTicketCount();
});

function getTicketCount() {
    fetch(`/api/info/select/ticket`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    })
        .then((response) => {
            if (!response.ok) {
                if (response.status === 401) {
                    authStore.user = null;
                    authStore.isAuthenticated = false;
                    localStorage.removeItem("authUser");
                    router.push({
                        path: "/login",
                        query: { redirect: route.fullPath },
                    });
                    throw new Error("인증이 필요합니다");
                }
                return response.text().then((text) => {
                    throw new Error(text);
                });
            }
            return response.json();
        })
        .then((data) => {
            //console.log("Ticket data:", data); // 디버깅을 위한 로그 추가
            ticketCount.value = Number(data.balance) || 0;
            maxTicketCount.value = Number(data.total) || 0;
        })
        .catch((error) => {
            //console.error("Error fetching ticket data:", error);
        });
}
</script>
