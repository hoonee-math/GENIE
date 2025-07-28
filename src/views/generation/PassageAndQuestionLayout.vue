<template>
    <!-- PassageAndQuestionLayout.vue -->
    <div class="flex flex-col items-start gap-4 w-full h-full md:mt-0 bg-white md:bg-[#f9fafb] dev-border">

        <!-- 헤더 -->
        <div v-if="$slots.title">
            <div class="flex items-center max-w-screen-2xl mx-auto">
                <div class="text-3xl font-semibold text-gray-900">
                    <slot name="title" />
                </div>
                <!-- <EditButton /> -->
            </div>
        </div>

        <!-- 메인 영역 #pagination(GeneratedQuestionView.vue 에서만 사용됨), #left, #right -->
        <div class="flex flex-col w-full h-full min-h-[500px] border border-gray-300 bg-white rounded-2xl">
            <div v-if="$slots.pagination" class="flex  flex-1 w-full h-full min-w-0 m-7 mb-0">
                <slot name="pagination" />
            </div>
            <div class="flex w-full h-full ">
                <!-- 왼쪽 영역 (편집 도구, 지문 출력) -->
                <div class="min-w-0 m-7 dev-border" :class="`flex-[${leftRatio}]`">
                    <div class="flex flex-col gap-5 h-full">
                        <slot name="left" />
                    </div>
                </div>

                <!-- 가운데 구분선 -->
                <div v-if="$slots.right" class="w-px my-7 border-[1px] border-[#D9D9D9] flex-shrink-0"></div>

                <!-- 오른쪽 영역 (지문 분석) -->
                <div v-if="$slots.right" class="min-w-0 max-h-[100vh] m-7 dev-border overflow-hidden" :class="`flex-[${rightRatio}]`">
                    <div class="flex flex-col h-full max-h-full overflow-hidden">
                        <slot name="right" />
                    </div>
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

.dev-border .dev-border:nth-child(1) {
    border-color: red;
}

.dev-border .dev-border:nth-child(2) {
    border-color: blue;
}
</style>