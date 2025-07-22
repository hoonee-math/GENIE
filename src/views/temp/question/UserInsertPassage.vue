<template>
    <textarea
        id="user-passage-text"
        v-model="userInput"
        placeholder="지문을 입력해주세요."
        class="hover:border-[#0086ff] hover:shadow-md flex-1 box-border w-full h-full p-4 bg-white border border-[#E5E7EB] rounded-xl resize-none font-pretendard text-base text-[#303030] placeholder:text-[#757575] placeholder:font-medium placeholder:leading-[150%] placeholder:tracking-[-0.02em] focus:outline-none focus:ring-2 focus:ring-[#0086ff] focus:ring-opacity-50 focus:border-[#0086ff] transition-all duration-200"
    ></textarea>
</template>

<script setup>
import { ref, inject, watch, onMounted } from "vue";

const userInput = ref("");

// 상위 컴포넌트에서 제공한 데이터 주입
const { currentPassage, showLengthWarning } = inject("passageData");
const MIN_LENGTH = 500;
const MAX_LENGTH = 5000;

// 부모 컴포넌트에서 전달받은 지문 상태 감시
watch(
    () => currentPassage.value.PAS_CONTENT,
    (newContent) => {
        userInput.value = newContent || "";
    },
    { immediate: true }
);

// 사용자 입력 감시
watch(userInput, (newValue) => {
    // 최대 글자 수 제한
    if (newValue.length > MAX_LENGTH) {
        userInput.value = newValue.slice(0, MAX_LENGTH);
    }

    // 현재 패시지 내용 업데이트
    currentPassage.value.PAS_CONTENT = userInput.value;
});
</script>
