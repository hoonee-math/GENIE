<template>
    <div class="relative w-full bg-white border border-black p-4 mt-8">
        <!-- 보기 제목 -->
        <div
            class="absolute left-1/2 transform -translate-x-1/2 bg-white py-1 -top-3.5 text-sm"> <!-- -top-3.5 text-sm 세트로 속성 바꿔줘야 함-->
            <  보 기  >
        </div>

        <!-- 내용 영역 (빈 공간) -->
        <div class="flex">
            <!-- 여기에 내용을 추가할 수 있습니다 -->
            <div :class=[,addClass] v-html="subPassage"></div>
        </div>
    </div>
</template>
<script setup>
const props = defineProps({
    subPassage: {
        type: String,
        default: "내용 영역",
    },
    addClass: {
        type: String,
        default: 'text-start',
    },
});
</script>
<style></style>