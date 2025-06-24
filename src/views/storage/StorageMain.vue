<template>
    <div class="hidden md:block flex flex-col gap-3 mx-auto p-4 sm:p-8 w-full">
       <LikeList1></LikeList1>
       <WorkList1></WorkList1>
    </div>
    <div class="md:hidden w-full h-full overflow-scroll flex flex-col bg-[#FAFAFA]">
        <!-- Header -->
        <header class="sticky top-0 z-999 bg-white/90 backdrop-blur-md justify-center shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-4 py-3.5 flex items-center">
            <div class="flex items-center gap-2">
                <div class="flex justify-center items-center w-full">
                <router-link to="/storage" class="text-base text-center font-bold bg-[#222] bg-clip-text text-transparent">자료실</router-link>
                </div>
            </div>
        </header>
        <div class="flex flex-1 bg-white flex-col gap-6 mx-auto p-6 w-full">
            <div class="flex flex-col gap-4">
                <router-link to="/storage/likelistMain" class="group flex items-center p-5 bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-0.5">
                    <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-[#F5F3FF] group-hover:bg-[#EDE9FE] transition-colors duration-200">
                        <svg class="w-6 h-6 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <div class="ml-4">
                        <span class="text-base font-semibold text-gray-800 group-hover:text-[#7C3AED] transition-colors duration-200">좋아요</span>
                        <p class="text-sm text-gray-500 mt-0.5">저장한 자료를 확인하세요</p>
                    </div>
                </router-link>
                <router-link to="/storage/worklistMain" class="group flex items-center p-5 bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-0.5">
                    <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-[#F0FDF4] group-hover:bg-[#DCFCE7] transition-colors duration-200">
                        <svg class="w-6 h-6 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h6l5 5v11a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div class="ml-4">
                        <span class="text-base font-semibold text-gray-800 group-hover:text-[#16A34A] transition-colors duration-200">작업</span>
                        <p class="text-sm text-gray-500 mt-0.5">작업 중인 자료를 확인하세요</p>
                    </div>
                </router-link>
                <router-link to="/storage/deletedMain" class="group flex items-center p-5 bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-0.5">
                    <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-[#FEF2F2] group-hover:bg-[#FEE2E2] transition-colors duration-200">
                        <svg class="w-6 h-6 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <div class="ml-4">
                        <span class="text-base font-semibold text-gray-800 group-hover:text-[#DC2626] transition-colors duration-200">휴지통</span>
                        <p class="text-sm text-gray-500 mt-0.5">삭제된 자료를 확인하세요</p>
                    </div>
                </router-link>
            </div>
        </div>
    </div>
    
</template>

<script setup>
import LikeList1 from './LikeList1.vue';
import WorkList1 from './WorkList1.vue';
</script>

<style scoped>
.router-link-active {
    @apply bg-gray-50;
}
</style>