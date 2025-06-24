<template>
    <transition name="fade">
        <div
            v-if="isOpen"
            class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
        >
            <!-- 모바일: 흰 카드 / 데스크톱: 투명 -->
            <div
                class="w-[90%] max-w-md mx-4 p-6 rounded-lg bg-white md:bg-transparent md:p-0 md:rounded-none md:shadow-none"
            >
                <div class="flex flex-col items-center text-center space-y-6">
                    <!-- 스피너 (데스크톱에서 약간 확대) -->
                    <div
                        class="animate-spin rounded-full mx-auto h-12 w-12 border-b-2 border-[#0086ff] md:h-16 md:w-16 md:border-b-4 md:border-[#0086ff]"
                    ></div>

                    <!-- 메시지 색상 분기: 모바일은 짙은 회색, 데스크톱은 흰색 -->
                    <p
                        class="whitespace-pre-line text-[#16252d] md:text-white md:text-lg md:leading-relaxed"
                    >
                        {{ message }}
                    </p>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
defineProps({
    isOpen: Boolean,
    message: String,
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
