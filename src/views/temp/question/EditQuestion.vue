<template>
    <div class="flex flex-col items-start p-0 gap-1 w-full h-full">
        <div
            class="box-border w-full h-[310px] md:min-h-[365px] bg-white border border-[#E5E7EB] rounded-xl"
        >
            <div
                class="flex flex-col items-start pt-[7px] gap-3 relative w-[95%] mx-auto h-auto top-[25px] overflow-visible"
            >
                <div
                    class="h-9 flex justify-between items-center font-pretendard font-normal text-base leading-[150%] tracking-[-0.02em] text-[#303030] gap-2"
                >
                    <div class="flex-1">
                        <span
                            v-if="!props.isEditing"
                            class="font-pretendard font-semibold text-base leading-[150%] tracking-[-0.02em] text-[#303030]"
                            >{{ title }}</span
                        >
                        <input
                            v-else
                            type="text"
                            v-model="title"
                            ref="titleInput"
                            @input="handleQuestionChanged"
                            class="hover:border-[#0086ff] hover:shadow-md h-9 font-pretendard font-semibold text-base leading-[150%] tracking-[-0.02em] text-[#303030] border-none w-full focus:outline-none focus:ring-2 focus:ring-[#0086ff] focus:ring-opacity-50"
                        />
                    </div>

                    <button
                        class="hover:bg-gray-100 hover:shadow-sm border-none bg-transparent cursor-pointer w-[16.67px]"
                        @click="
                            props.isEditing
                                ? toggleEditMode()
                                : requestEditMode()
                        "
                    >
                        <Icon
                            icon="mingcute:pencil-fill"
                            width="24"
                            height="24"
                            :class="
                                props.isEditing
                                    ? 'text-[#0086FF]'
                                    : 'text-[#303030]'
                            "
                        />
                    </button>
                </div>
                <div
                    class="flex flex-col items-start p-0 gap-3 max-h-[198px] overflow-y-auto overflow-x-hidden flex-none order-1 self-stretch flex-grow-0 z-[1]"
                >
                    <div
                        v-for="(item, index) in items"
                        :key="index"
                        class="flex flex-row items-start p-0 gap-2 w-full min-h-[30px] h-auto flex-none order-0 self-stretch flex-grow-0"
                    >
                        <span
                            class="font-pretendard font-normal text-base leading-[150%] tracking-[-0.02em] text-[#303030] flex-none flex-shrink-0"
                            >{{ circledNumbers[index] }}</span
                        >
                        <span
                            v-if="!props.isEditing"
                            class="font-pretendard font-normal text-base leading-[150%] tracking-[-0.02em] text-[#303030] flex-1 break-words break-keep overflow-wrap-break-word whitespace-normal max-w-[calc(100%-30px)]"
                        >
                            {{ item }}
                        </span>
                        <input
                            v-else
                            type="text"
                            v-model="items[index]"
                            @input="handleQuestionChanged"
                            class="hover:border-[#0086ff] hover:shadow-md w-[calc(100%-30px)] min-h-[30px] h-auto font-pretendard font-normal text-base leading-[150%] tracking-[-0.02em] text-[#303030] border border-[#bdbdbd] whitespace-normal overflow-wrap-break-word break-keep focus:outline-none focus:ring-2 focus:ring-[#0086ff] focus:ring-opacity-50"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    ref,
    watch,
    nextTick,
    onMounted,
    defineProps,
    defineExpose,
} from "vue";
import BaseButton from "@/components/common/BaseButton.vue";

// props 정의
const props = defineProps({
    // 문제 제목
    questionTitle: {
        type: String,
        default: "다음 중 본문과 내용이 다른 것을 고르시오.",
    },
    // 문항 리스트
    questions: {
        type: Array,
        default: () => [
            "LLMs의 성능은 모델의 크기를 줄일수록 향상된다.",
            "LLMs의 성능은 모델의 크기를 줄일수록 향상된다.",
            "LLMs는 인공지능이 인간 언어를 이해하고 생성하는 방식을 변화시키고 있다.",
            "ChatGPT와 같은 혁신은 LLMs가 독특한 문제 해결 능력을 보여주기 시작했음을 나타낸다.",
            "연구자들은 LLMs의 잠재력을 확대하기 위해 새로운 아키텍처와 훈련 전략을 탐구하고 있다.",
        ],
    },
    isEditing: {
        type: Boolean,
        defaule: false,
    },
    isFromRoute: {
        // 이전 페이지가 보관함 관련일 경우, 재생성하기 버튼 비활성화
        type: Boolean,
        default: false,
    },
});

// emits 정의
const emit = defineEmits([
    "edit-mode-changed",
    "update:questions",
    "update:questionTitle",
    "question-changed",
    "request-edit-mode",
    "recreate-question", // 재생성 버튼 클릭 시 이벤트 추가
]);

// 반응형 상태 정의
const isEditing = ref(props.isEditing);
const title = ref(props.questionTitle);
const items = ref([...props.questions]);
const titleInput = ref(null);

// 문항 번호 기호 배열
const circledNumbers = ["①", "②", "③", "④", "⑤"];

// 재생성 버튼 클릭 핸들러
const handleRecreate = () => {
    emit("recreate-question", {
        mode: "recreate", //mode 추가
        title: title.value,
        options: items.value,
    });
};

// 편집 버튼 클릭 핸들러 - 부모 컴포넌트에게 편집 요청을 알림
const requestEditMode = () => {
    emit("request-edit-mode");
};

// 편집 모드 토글 함수
const toggleEditMode = () => {
    isEditing.value = !isEditing.value;
    emit("edit-mode-changed", isEditing.value);

    if (isEditing.value) {
        nextTick(() => {
            if (titleInput.value) {
                titleInput.value.focus();
            }
        });
    } else {
        // 수정 완료 시 상태 업데이트
        emit("question-changed", {
            title: title.value,
            options: items.value, // ✅ 명확한 데이터 구조로 전달
        });
    }
};

// 입력 값 수정 시 상태 업데이트
const handleQuestionChanged = () => {
    emit("question-changed", {
        title: title.value,
        options: items.value,
    });
};

// props 변경 감시
watch(
    () => props.questions,
    (newVal) => {
        items.value = [...newVal];
    },
    { deep: true }
);

watch(
    () => props.questionTitle,
    (newVal) => {
        title.value = newVal;
    }
);

watch(
    () => props.isEditing,
    (newVal) => {
        isEditing.value = newVal;
    },
    { immediate: true }
);

// 컴포넌트 마운트 시 초기화
onMounted(() => {
    title.value = props.questionTitle;
    items.value = [...props.questions];
});

// 외부에서 호출 가능하도록 함수 노출
defineExpose({
    toggleEditMode,
    getTitle: () => title.value,
    getOptions: () => items.value,
    setTitle: (newTitle) => {
        title.value = newTitle || "";
    },
    setOptions: (newOptions) => {
        items.value = newOptions || [];
    },
});
</script>
