<template>
    <div class="flex flex-col items-start p-0 gap-1 relative">
        <div
            class="box-border flex flex-col items-center p-5 gap-2 w-full h-[365px] bg-white border border-[#E5E7EB] rounded-xl"
        >
            <span
                v-if="!isEditing"
                class="flex flex-col items-start p-0 gap-8 w-full font-pretendard font-normal text-base leading-8 tracking-[-0.019em] text-black flex-none order-0 self-stretch flex-grow-0"
                >정답 {{ queAnswer }}</span
            >

            <div
                v-else
                class="flex flex-row items-center p-0 gap-2 w-full h-10 whitespace-nowrap flex-none order-0 self-stretch flex-grow-0"
            >
                <div
                    class="flex flex-row items-center p-0 gap-5 w-[217px] h-5 flex-none order-0 flex-grow-0"
                >
                    <p class="font-pretendard font-normal text-base">정답</p>
                    <div class="flex items-center justify-center">
                        <input
                            type="radio"
                            :id="`answer1-${uniqueId}`"
                            value="①"
                            v-model="localAnswer"
                            @change="handleDescriptionChanged"
                            class="hidden peer"
                        />
                        <label
                            :for="`answer1-${uniqueId}`"
                            class="flex items-center justify-center w-3 h-3 rounded-full text-base leading-8 text-center peer-checked:bg-[#ffeddc] peer-checked:text-[#0086ff] hover:bg-gray-100 hover:shadow-sm transition-all duration-200 cursor-pointer"
                            >①</label
                        >
                    </div>
                    <div class="flex items-center justify-center">
                        <input
                            type="radio"
                            :id="`answer2-${uniqueId}`"
                            value="②"
                            v-model="localAnswer"
                            @change="handleDescriptionChanged"
                            class="hidden peer"
                        />
                        <label
                            :for="`answer2-${uniqueId}`"
                            class="flex items-center justify-center w-3 h-3 rounded-full text-base leading-8 text-center peer-checked:bg-[#ffeddc] peer-checked:text-[#0086ff] hover:bg-gray-100 hover:shadow-sm transition-all duration-200 cursor-pointer"
                            >②</label
                        >
                    </div>
                    <div class="flex items-center justify-center">
                        <input
                            type="radio"
                            :id="`answer3-${uniqueId}`"
                            value="③"
                            v-model="localAnswer"
                            @change="handleDescriptionChanged"
                            class="hidden peer"
                        />
                        <label
                            :for="`answer3-${uniqueId}`"
                            class="flex items-center justify-center w-3 h-3 rounded-full text-base leading-8 text-center peer-checked:bg-[#ffeddc] peer-checked:text-[#0086ff] hover:bg-gray-100 hover:shadow-sm transition-all duration-200 cursor-pointer"
                            >③</label
                        >
                    </div>
                    <div class="flex items-center justify-center">
                        <input
                            type="radio"
                            :id="`answer4-${uniqueId}`"
                            value="④"
                            v-model="localAnswer"
                            @change="handleDescriptionChanged"
                            class="hidden peer"
                        />
                        <label
                            :for="`answer4-${uniqueId}`"
                            class="flex items-center justify-center w-3 h-3 rounded-full text-base leading-8 text-center peer-checked:bg-[#ffeddc] peer-checked:text-[#0086ff] hover:bg-gray-100 hover:shadow-sm transition-all duration-200 cursor-pointer"
                            >④</label
                        >
                    </div>
                    <div class="flex items-center justify-center">
                        <input
                            type="radio"
                            :id="`answer5-${uniqueId}`"
                            value="⑤"
                            v-model="localAnswer"
                            @change="handleDescriptionChanged"
                            class="hidden peer"
                        />
                        <label
                            :for="`answer5-${uniqueId}`"
                            class="flex items-center justify-center w-3 h-3 rounded-full text-base leading-8 text-center peer-checked:bg-[#ffeddc] peer-checked:text-[#0086ff] hover:bg-gray-100 hover:shadow-sm transition-all duration-200 cursor-pointer"
                            >⑤</label
                        >
                    </div>
                </div>
            </div>

            <div class="flex flex-col items-start p-0 gap-8 h-[277px] w-full">
                <span
                    v-if="!isEditing"
                    class="font-pretendard font-normal text-base leading-8 tracking-[-0.019em] text-black flex-none order-0 self-stretch flex-grow-0 overflow-y-scroll"
                    >{{ description }}</span
                >
                <textarea
                    v-else
                    type="text"
                    v-model="description"
                    @input="handleDescriptionChanged"
                    class="w-full h-full font-pretendard font-normal text-base leading-8 tracking-[-0.019em] text-black flex-none order-0 self-stretch flex-grow-0 resize-none overflow-y-scroll focus:outline-none focus:ring-2 focus:ring-[#0086ff] focus:ring-opacity-50 hover:shadow-md border border-transparent hover:border-[#0086ff] transition-all duration-200"
                ></textarea>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

// props 정의
const props = defineProps({
    // 정답
    queAnswer: {
        type: String,
        default: "①",
    },
    // 해설
    description: {
        type: String,
        default: "",
    },
    // 편집 모드 상태를 props로 받음
    isEditing: {
        type: Boolean,
        default: false,
    },
    // 현재 슬라이드 인덱스
    slideIndex: {
        type: Number,
        default: 0,
    },
});

// emits 정의
const emit = defineEmits(["description-changed"]);

// 내부적으로 관리할 정답 데이터 (v-model에 연결)
const localAnswer = ref("");
// 내부적으로 관리할 해설 데이터
const description = ref("");

// 고유 ID 계산 (slideIndex 기반)
const uniqueId = computed(() => `desc-${props.slideIndex}`);

// 해설 변경 시 이벤트 발생
const handleDescriptionChanged = () => {
    // 변경사항을 부모 컴포넌트에 알림
    emit("description-changed", {
        queAnswer: localAnswer.value,
        description: description.value,
        slideIndex: props.slideIndex,
    });
};

// 초기 상태 설정
onMounted(() => {
    localAnswer.value = props.queAnswer;
    description.value = props.description;
});

// props 변경 감시
watch(
    () => props.queAnswer,
    (newVal) => {
        localAnswer.value = newVal;
    }
);

watch(
    () => props.description,
    (newVal) => {
        description.value = newVal;
    }
);

watch(
    () => props.isEditing,
    (newVal) => {
        // console.log('편집 모드 변경 : ', newVal);
    }
);
</script>
