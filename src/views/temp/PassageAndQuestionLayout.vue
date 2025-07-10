<template>
    <div class="flex flex-col items-start gap-4 w-full md:mt-0 bg-white md:bg-[#f9fafb] dev-border">
      
        <!-- 헤더 -->
        <div v-if="$slots.title">
            <div class="flex items-center max-w-screen-2xl mx-auto">
                <div class="text-3xl font-semibold text-gray-900"><slot name="title" /></div>
                <button class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg width="25" height="34" viewBox="0 -3 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.631 23.4322L24.3548 12.7084C22.5507 11.9547 20.9122 10.8542 19.5322 9.4692C18.1466 8.08892 17.0455 6.44991 16.2916 4.64523L5.56779 15.369C4.73117 16.2057 4.31214 16.6247 3.95255 17.0858C3.52829 17.6302 3.16416 18.2189 2.86654 18.8417C2.6157 19.3694 2.42866 19.932 2.05457 21.0543L0.0797406 26.9744C-0.0111512 27.2455 -0.0246363 27.5365 0.0408006 27.8148C0.106237 28.0931 0.248003 28.3477 0.450161 28.5498C0.652319 28.752 0.906857 28.8938 1.18516 28.9592C1.46347 29.0246 1.75451 29.0112 2.02557 28.9203L7.94571 26.9454C9.06942 26.5713 9.63055 26.3843 10.1583 26.1335C10.7837 25.8357 11.369 25.4737 11.9142 25.0474C12.3753 24.6879 12.7943 24.2688 13.631 23.4322ZM27.3301 9.7331C28.3993 8.66385 29 7.21365 29 5.70152C29 4.18938 28.3993 2.73918 27.3301 1.66994C26.2608 0.600694 24.8106 1.12663e-08 23.2985 0C21.7863 -1.12663e-08 20.3361 0.600694 19.2669 1.66994L17.9808 2.95604L18.0359 3.11698C18.6695 4.93055 19.7067 6.57654 21.0692 7.93081C22.4639 9.33409 24.1676 10.3917 26.044 11.0192L27.3301 9.7331Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
        </div>

        <div class="flex w-full h-full min-h-[500px] border border-gray-300 bg-white rounded-2xl">
            <!-- 왼쪽 영역 (편집 도구, 지문 출력) -->
            <div class="min-w-0 m-7 dev-border" :class="`flex-[${leftRatio}]`">
                <div class="flex flex-col gap-10 h-full">
                    <slot name="left" />
                </div>
            </div>
            
            <!-- 가운데 구분선 -->
            <div class="w-px my-7 border-[1px] border-[#D9D9D9] flex-shrink-0"></div>

            <!-- 오른쪽 영역 (지문 분석) -->
            <div class="min-w-0 m-7 dev-border" :class="`flex-[${rightRatio}]`">
                <div class="flex flex-col gap-10 h-full">
                    <slot name="right" />
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
// Props 정의
const props = defineProps({
    leftRatio: {
        type: [Number, String],
        default: 2
    },
    rightRatio: {
        type: [Number, String],
        default: 1
    }
})
</script>
<style scoped>
.dev-border {
    /* border: solid; */
    border-color: pink;
}
.dev-border .dev-border:nth-child(1){
    border-color: red;
}
.dev-border .dev-border:nth-child(2){
    border-color: blue;
}
</style>