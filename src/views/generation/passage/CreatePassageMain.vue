<template>
    <div class="max-h-[90vh] w-full min-w-0">
        <div
            class="p-[1.4%_3%] box-border w-full min-w-0 min-h-[70vh] bg-white border border-[#E5E7EB] rounded-xl relative mx-auto flex flex-col flex-1 shadow-sm"
        >
            <div
                class="flex flex-col items-start py-2 gap-4 w-full min-w-0 h-auto flex-shrink-0"
            >
                <p
                    class="w-full font-pretendard font-bold text-lg md:text-xl leading-[150%] tracking-[-0.02em] text-[#303030]"
                >
                    작업이름
                </p>
                <input
                    type="text"
                    id="passage-title"
                    placeholder="작업 이름을 입력해주세요. (최대 50자)"
                    v-model="title"
                    class="box-border flex flex-row items-center p-3 px-4 w-full h-[46px] bg-white border border-[#E5E7EB] rounded-lg font-pretendard font-normal text-sm md:text-base leading-[150%] tracking-[-0.02em] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] hover:shadow-lg hover:-translate-y-0.3 hover:border-[var(--primary)] transition-all duration-300 ease-out"
                />
            </div>

            <div
                class="flex flex-col items-start py-2 gap-4 w-full min-w-0 h-auto flex-shrink-0"
            >
                <p
                    class="w-full font-pretendard font-bold text-lg md:text-xl leading-[150%] tracking-[-0.02em] text-[#303030]"
                >
                    지문 분야 선택
                </p>
                <div
                    class="flex flex-row flex-wrap items-center gap-4 w-full max-w-full"
                >
                    <div class="flex flex-row items-center gap-2">
                        <input
                            type="radio"
                            id="human"
                            name="category"
                            value="인문"
                            checked
                            @change="onCategoryChange('인문')"
                            class="hidden peer"
                        />
                        <label
                            for="human"
                            class="font-pretendard font-medium text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030] relative pl-6 cursor-pointer block before:content-[''] before:absolute before:left-[0.1em] before:top-[0.5em] before:w-4 before:h-4 before:border-[1.5px] before:border-[#E5E7EB] before:rounded-full before:bg-white after:content-[''] after:absolute after:left-[0.1em] after:top-[0.5em] after:w-4 after:h-4 after:rounded-full after:border-none after:bg-[#0086ff] after:opacity-0 peer-checked:after:opacity-100 hover:before:bg-[var(--primary)]/10 hover:before:border-[var(--primary)] transition-all duration-200"
                            >인문</label
                        >
                    </div>
                    <div class="flex flex-row items-center gap-2">
                        <input
                            type="radio"
                            id="art"
                            name="category"
                            value="예술"
                            @change="onCategoryChange('예술')"
                            class="hidden peer"
                        />
                        <label
                            for="art"
                            class="font-pretendard font-medium text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030] relative pl-6 cursor-pointer block before:content-[''] before:absolute before:left-[0.1em] before:top-[0.5em] before:w-4 before:h-4 before:border-[1.5px] before:border-[#E5E7EB] before:rounded-full before:bg-white after:content-[''] after:absolute after:left-[0.1em] after:top-[0.5em] after:w-4 after:h-4 after:rounded-full after:border-none after:bg-[#0086ff] after:opacity-0 peer-checked:after:opacity-100 hover:before:bg-[var(--primary)]/10 hover:before:border-[var(--primary)] transition-all duration-200"
                            >예술</label
                        >
                    </div>
                    <div class="flex flex-row items-center gap-2">
                        <input
                            type="radio"
                            id="social"
                            name="category"
                            value="사회"
                            @change="onCategoryChange('사회')"
                            class="hidden peer"
                        />
                        <label
                            for="social"
                            class="font-pretendard font-medium text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030] relative pl-6 cursor-pointer block before:content-[''] before:absolute before:left-[0.1em] before:top-[0.5em] before:w-4 before:h-4 before:border-[1.5px] before:border-[#E5E7EB] before:rounded-full before:bg-white after:content-[''] after:absolute after:left-[0.1em] after:top-[0.5em] after:w-4 after:h-4 after:rounded-full after:border-none after:bg-[#0086ff] after:opacity-0 peer-checked:after:opacity-100 hover:before:bg-[var(--primary)]/10 hover:before:border-[var(--primary)] transition-all duration-200"
                            >사회</label
                        >
                    </div>
                    <div class="flex flex-row items-center gap-2">
                        <input
                            type="radio"
                            id="science"
                            name="category"
                            value="과학"
                            @change="onCategoryChange('과학')"
                            class="hidden peer"
                        />
                        <label
                            for="science"
                            class="font-pretendard font-medium text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030] relative pl-6 cursor-pointer block before:content-[''] before:absolute before:left-[0.1em] before:top-[0.5em] before:w-4 before:h-4 before:border-[1.5px] before:border-[#E5E7EB] before:rounded-full before:bg-white after:content-[''] after:absolute after:left-[0.1em] after:top-[0.5em] after:w-4 after:h-4 after:rounded-full after:border-none after:bg-[#0086ff] after:opacity-0 peer-checked:after:opacity-100 hover:before:bg-[var(--primary)]/10 hover:before:border-[var(--primary)] transition-all duration-200"
                            >과학</label
                        >
                    </div>
                    <div class="flex flex-row items-center gap-2">
                        <input
                            type="radio"
                            id="other"
                            name="category"
                            value="기술"
                            @change="onCategoryChange('기술')"
                            class="hidden peer"
                        />
                        <label
                            for="other"
                            class="font-pretendard font-medium text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030] relative pl-6 cursor-pointer block before:content-[''] before:absolute before:left-[0.1em] before:top-[0.5em] before:w-4 before:h-4 before:border-[1.5px] before:border-[#E5E7EB] before:rounded-full before:bg-white after:content-[''] after:absolute after:left-[0.1em] after:top-[0.5em] after:w-4 after:h-4 after:rounded-full after:border-none after:bg-[#0086ff] after:opacity-0 peer-checked:after:opacity-100 hover:before:bg-[var(--primary)]/10 hover:before:border-[var(--primary)] transition-all duration-200"
                            >기술</label
                        >
                    </div>
                </div>
            </div>

            <div
                class="flex flex-col items-start py-2 gap-4 w-full min-w-0 flex-1 h-auto"
            >
                <h2
                    class="w-full font-pretendard font-bold text-lg md:text-xl leading-[150%] tracking-[-0.02em] text-[#303030]"
                >
                    지문 제재 입력
                </h2>
                <textarea
                    placeholder="100자 이내의 원하는 지문의 제재, 필수 포함 키워드를 작성해 주세요. (ex : 인공지능과 기계학습)"
                    id="input-text"
                    v-model="inputText"
                    maxlength="100"
                    @input="onInputChange"
                    class="flex-1 box-border w-full min-h-32 p-4 bg-white border border-[#E5E7EB] rounded-xl resize-none font-pretendard text-sm md:text-base text-[#303030] placeholder:text-[#757575] placeholder:font-medium placeholder:leading-[150%] placeholder:tracking-[-0.02em] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] hover:shadow-lg hover:-translate-y-0.3 hover:border-[var(--primary)] transition-all duration-300 ease-out"
                ></textarea>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, watch, defineExpose, onMounted } from "vue";
let savePassageData = {};
try {
    const savedData = localStorage.getItem("saveResponse");
    if (savedData) {
        savePassageData = JSON.parse(savedData) || {};
    }
} catch (error) {
    // // console.error('데이터 파싱 오류:', error);
}

const emit = defineEmits(["input-change", "category-change", "title-change"]);
const title = ref(savePassageData?.passage?.title || "");
const inputText = ref("");
const selectedCategory = ref("인문");

const MAX_LENGTH = 50;

// 카테고리 변경 함수 추가
const onCategoryChange = (category) => {
    selectedCategory.value = category;
    emit("category-change", category);
};

const onTitleChange = () => {
    emit("title-change", title.value);
};

const checkTextLength = () => {
    if (inputText.value.length > 100) {
        inputText.value = inputText.value.slice(0, 100);
    }
};

const onInputChange = () => {
    checkTextLength();
    emit("input-change", inputText.value);
};

onMounted(() => {
    localStorage.removeItem("saveResponse");
    // 또는 빈 객체로 초기화
    localStorage.setItem("saveResponse", JSON.stringify({}));
});

// 초기값 설정을 위한 emit
watch(
    inputText,
    (newValue) => {
        emit("input-change", newValue);
    },
    { immediate: true }
);

watch(
    title,
    (newValue) => {
        emit("title-change", newValue);
    },
    { immediate: true }
);

watch(title, (newValue) => {
    // 최대 작업 이름 글자 수 제한
    if (newValue.length > MAX_LENGTH) {
        // 최대 길이로 잘라서 다시 설정
        title.value = newValue.substring(0, MAX_LENGTH);
    }
});

defineExpose({
    resetForm() {
        inputText.value = "";
        selectedCategory.value = "인문";
        title.value = "";
        // DOM에 직접 접근하여 라디오 버튼 상태 변경
        document.getElementById("human").checked = true;
    },
});
</script>
