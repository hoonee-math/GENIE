<template>
    <div class="flex flex-col items-start p-[2%_3%] gap-3">
        <p
            class="flex flex-col items-start p-0 gap-3 h-[30px] font-pretendard font-bold text-xl leading-[150%] tracking-[-0.02em] text-[#303030] flex-none order-0 self-stretch flex-grow-0"
        >
            작업이름
        </p>
        <input
            type="text"
            placeholder="작업 이름을 입력해 주세요. (최대 50자)"
            v-model="title"
            @blur="emitTitleChange"
            class="hover:border-[#0086ff] hover:shadow-md box-border flex flex-row items-center p-2 gap-2 h-[46px] bg-white border border-[#0086ff] rounded-lg flex-none order-1 self-stretch flex-grow-0 w-full focus:outline-none focus:ring-2 focus:ring-[#0086ff] focus:ring-opacity-50"
        />
    </div>
</template>

<script setup>
import { ref, watch, defineEmits } from "vue";
const emit = defineEmits(["title-changed"]);

const title = ref("");

// 초기 값 설정 (값이 없으면 빈 문자열로 설정)
const savePassageData = JSON.parse(localStorage.getItem("saveResponse"));
title.value = savePassageData?.passage?.title || "";
const MAX_LENGTH = 50;

watch(title, (newValue) => {
    // 최대 글자 수 제한
    if (newValue.length > MAX_LENGTH) {
        // 최대 길이로 잘라서 다시 설정
        title.value = newValue.substring(0, MAX_LENGTH);
    }
});

// 수정된 제목을 부모 컴포넌트에 전달
const emitTitleChange = () => {
    emit("title-changed", title.value || "");
};

// 외부에서 상태 접근 가능하도록 설정
defineExpose({
    getTitle: () => title.value,
    setTitle: (newTitle) => {
        title.value = newTitle || "";
    },
});
</script>
