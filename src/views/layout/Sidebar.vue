<template>
    <div>
        <!-- Toggle Button -->
        <header
            class="w-full fixed z-50 lg:hidden p-2 bg-[rgba(249,250,251,0.7)] backdrop-blur-sm hover:bg-[rgba(249,250,251,0.9)]"
        >
            <button
                @click="toggleSidebar"
                class="top-4 left-4 z-50 lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
                <svg
                    class="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        v-if="!isOpen"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                    <path
                        v-else
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </header>

        <!-- Sidebar -->
        <aside
            class="fixed top-0 left-0 w-[200px] h-screen min-h-full bg-white text-gray-800 shadow-md py-5 flex flex-col justify-between gap-6 z-40 transition-transform duration-300 ease-in-out lg:translate-x-0"
            :class="{
                '-translate-x-full': !isOpen,
                'translate-x-0': isOpen,
            }"
        >
            <div class="flex justify-center items-center">
                <router-link to="/" class="text-2xl font-extrabold text-brand"
                    >Genie</router-link
                >
            </div>
            <nav class="p-4 flex flex-col gap-2">
                <router-link
                    to="/passage"
                    class="flex items-center justify-center gap-2 h-10 px-3 text-base font-semibold no-underline rounded-md transition-all duration-300 hover:bg-gray-100"
                    :class="{
                        'bg-brand text-white hover:bg-[#004499] hover:text-white':
                            isActive('/passage'),
                    }"
                    @click="closeSidebar"
                >
                    <svg
                        class="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h6l5 5v11a2 2 0 01-2 2z"
                        />
                    </svg>
                    지문 생성
                </router-link>
                <router-link
                    to="/questions"
                    class="flex items-center justify-center gap-2 h-10 px-3 text-base font-semibold no-underline rounded-md transition-all duration-300 hover:bg-gray-100"
                    :class="{
                        'bg-brand text-white hover:bg-[#004499] hover:text-white':
                            isActive('/questions'),
                    }"
                    @click="
                        clearPassageData;
                        closeSidebar();
                    "
                >
                    <svg
                        class="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 10h16M4 14h8"
                        />
                    </svg>
                    문항 생성
                </router-link>
                <div class="flex flex-col">
                    <div
                        @click="toggleStorageMenu"
                        class="flex items-center justify-center gap-2 h-10 px-3 text-base font-semibold no-underline rounded-md transition-all duration-300 hover:bg-gray-100"
                        :class="{
                            'bg-brand text-white hover:bg-[#004499] hover:text-white':
                                isActive('/storage'),
                        }"
                    >
                        <div class="flex items-center gap-2">
                            <svg
                                class="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M5 5v14l7-7 7 7V5z"
                                />
                            </svg>
                            자료실
                        </div>
                        <svg
                            class="w-4 h-4 transition-transform duration-300"
                            :class="{ 'rotate-180': isStorageMenuOpen }"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                    <div
                        v-show="isStorageMenuOpen"
                        class="flex flex-col pl-8 mt-1 space-y-1 w-full"
                    >
                        <router-link
                            to="/storage/recent"
                            class="flex items-center h-8 px-3 text-sm font-medium no-underline rounded-md transition-all duration-300 hover:bg-gray-100 w-full"
                            :class="{
                                'text-brand': isActive('/storage/recent'),
                            }"
                            @click="closeSidebar"
                        >
                            최근문서함
                        </router-link>
                        <router-link
                            to="/storage/favorites"
                            class="flex items-center h-8 px-3 text-sm font-medium no-underline rounded-md transition-all duration-300 hover:bg-gray-100 w-full"
                            :class="{
                                'text-brand': isActive('/storage/favorites'),
                            }"
                            @click="closeSidebar"
                        >
                            즐겨찾기
                        </router-link>
                        <router-link
                            to="/storage/trash"
                            class="flex items-center h-8 px-3 text-sm font-medium no-underline rounded-md transition-all duration-300 hover:bg-gray-100 w-full"
                            :class="{
                                'text-brand': isActive('/storage/trash'),
                            }"
                            @click="closeSidebar"
                        >
                            휴지통
                        </router-link>
                    </div>
                </div>
            </nav>

            <div class="mt-auto p-4 flex flex-col gap-2">
                <router-link
                    to="/guide"
                    class="flex items-center justify-center gap-2 h-10 px-3 text-base font-semibold text-black no-underline rounded-md transition-all duration-300 hover:bg-gray-100"
                    :class="{ 'text-brand bg-gray-100': isActive('/guide') }"
                    @click="closeSidebar"
                >
                    <svg
                        class="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 6c-1.657 0-3 .895-3 2v10c0 1.105 1.343 2 3 2s3-.895 3-2V8c0-1.105-1.343-2-3-2zM3 6c-1.105 0-2 .672-2 1.5v10c0 .828.895 1.5 2 1.5s2-.672 2-1.5V7.5C5 6.672 4.105 6 3 6zm18 0c-1.105 0-2 .672-2 1.5v10c0 .828.895 1.5 2 1.5s2-.672 2-1.5V7.5c0-.828-.895-1.5-2-1.5z"
                        />
                    </svg>
                    이용가이드
                </router-link>
                <router-link
                    to="/payment"
                    class="flex items-center justify-center gap-2 h-10 px-3 text-base font-semibold text-black no-underline rounded-md transition-all duration-300 hover:bg-gray-100"
                    :class="{ 'text-brand bg-gray-100': isActive('/payment') }"
                    @click="closeSidebar"
                >
                    <svg
                        class="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v2m14 0v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9m14 0h2a2 2 0 012 2v6a2 2 0 01-2 2h-2"
                        />
                    </svg>
                    결제
                </router-link>
                <router-link
                    to="/mypage"
                    class="flex items-center justify-center gap-2 h-10 px-3 text-base font-semibold text-black no-underline rounded-md transition-all duration-300 hover:bg-gray-100"
                    :class="{ 'text-brand bg-gray-100': isActive('/mypage') }"
                    @click="closeSidebar"
                >
                    <svg
                        class="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5.121 17.804A9.004 9.004 0 0112 15c2.003 0 3.847.66 5.243 1.765M15 11a3 3 0 11-6 0 3 3 0 016 0zm7 1a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    마이페이지
                </router-link>
            </div>
        </aside>

        <!-- Main Content Wrapper -->
        <main class="lg:ml-[200px] min-h-screen transition-all duration-300">
            <slot></slot>
        </main>

        <!-- Overlay for mobile -->
        <div
            v-if="isOpen"
            class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            @click="closeSidebar"
        ></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isOpen = ref(false);
const isStorageMenuOpen = ref(false);

const toggleSidebar = () => {
    isOpen.value = !isOpen.value;
};

const toggleStorageMenu = () => {
    isStorageMenuOpen.value = !isStorageMenuOpen.value;
};

const closeSidebar = () => {
    isOpen.value = false;
};

const handleResize = () => {
    if (window.innerWidth >= 1024) {
        isOpen.value = true;
    } else {
        isOpen.value = false;
    }
};

onMounted(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
});

const isActive = (path) => {
    if (path === "/") {
        return route.path === "/home" || route.path === "";
    }
    return route.path.startsWith(path);
};

const clearPassageData = () => {
    localStorage.removeItem("genieq-passage-data");
    localStorage.removeItem("genieq-passage-for-question");
    localStorage.removeItem("generateQuestionPassageData");
};
</script>
