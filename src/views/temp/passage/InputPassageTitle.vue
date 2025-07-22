<template>
    <div class="w-full">
        <input
            type="text"
            id="passage-title"
            placeholder="작업 이름을 입력해 주세요."
            v-model="title"
            class="flex flex-row items-center p-3 px-4 gap-2 w-full h-[46px] bg-white rounded-lg border border-[#E5E7EB] font-pretendard font-normal text-base md:text-lg lg:text-xl leading-[150%] tracking-[-0.02em] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] hover:shadow-lg hover:-translate-y-0.3 hover:border-[var(--primary)] transition-all duration-300 ease-out"
        />
    </div>
</template>
<script setup>
import { ref, defineExpose, watch } from "vue";

// 제목 데이터 ref로 관리
const title = ref("");

// 외부에서 접근할 수 있도록 함수 노출
const getTitle = () => {
    return title.value;
};

// InputPassageTitle.vue 수정
// 외부에서 제목을 설정할 수 있는 메서드 추가
const setTitle = (newTitle) => {
    // console.log('[32] InputPassageTitle: 제목 설정', newTitle);
    if (newTitle !== undefined) {
        title.value = newTitle || "";
    }
};
// (추가) 제목 변경 시 로그 출력
watch(title, (newValue) => {
    // console.log('[33] InputPassageTitle: 제목 변경됨', newValue);
});

// 외부에 노출할 메소드 정의 업데이트
defineExpose({
    getTitle,
    setTitle, // 추가
});
</script>
