<template>
    <div
        class="box-border w-full min-w-0 min-h-[70vh] max-h-[90vh] bg-white border border-[#E5E7EB] rounded-xl relative p-[1.4%_2%] flex flex-col shadow-sm"
    >
        <div class="flex flex-col items-start py-2 gap-4 w-full min-w-0 h-auto">
            <p
                class="w-full font-pretendard font-bold text-lg md:text-xl leading-[150%] tracking-[-0.02em] text-[#303030]"
            >
                작업이름
            </p>
            <input
                type="text"
                id="passage-title"
                placeholder="작업 이름을 입력해주세요. (최대 50자)"
                v-model="passageTitle"
                class="box-border flex flex-row items-center p-3 px-4 w-full h-[46px] bg-white border border-[#E5E7EB] rounded-lg font-pretendard font-normal text-sm md:text-base leading-[150%] tracking-[-0.02em] focus:outline-none focus:ring-2 focus:ring-[#0086ff] focus:ring-opacity-50 focus:border-[#0086ff] hover:border-[#0086ff] hover:shadow-md transition-all duration-200"
            />
        </div>
        <p
            class="w-full font-pretendard font-bold text-lg md:text-xl leading-[150%] tracking-[-0.02em] text-[#303030] py-2"
        >
            지문 입력
        </p>
        <div
            class="flex flex-col sm:flex-row items-center py-2 gap-8 w-full h-8"
        >
            <div class="flex flex-row items-center gap-8">
                <p
                    :class="[
                        'font-pretendard font-semibold text-sm md:text-base leading-[150%] cursor-pointer tracking-[-0.02em] text-[#424242] m-0',
                        activeTab === 'user' ? 'text-[#0086ff] underline' : '',
                    ]"
                    @click="setActiveTab('user')"
                >
                    사용자 입력
                </p>
                <p
                    :class="[
                        'font-pretendard font-semibold text-sm md:text-base leading-[150%] cursor-pointer tracking-[-0.02em] text-[#424242] m-0',
                        activeTab === 'stores'
                            ? 'text-[#0086ff] underline'
                            : '',
                    ]"
                    @click="setActiveTab('stores')"
                >
                    자료실 지문
                </p>
            </div>
            <div
                class="w-fit h-6 text-right font-pretendard font-medium text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#bdbdbd] mt-2 sm:mt-0 sm:ml-auto"
            >
                <span class="text-[#0086ff]">{{ currentLength }}</span
                >/5000
            </div>
        </div>

        <div class="flex-1">
            <div
                v-if="activeTab === 'user'"
                class="h-full box-border w-full min-w-0 bg-white border border-[#E5E7EB] rounded-xl"
            >
                <UserInsertPassage />
            </div>
            <div
                v-else
                class="h-full box-border w-full min-w-0 bg-white border border-[#E5E7EB] rounded-xl"
            >
                <StoresInsertPassage />
            </div>
        </div>

        <WarningModalComponent
            :isOpen="isWarningModalOpen"
            title="지문 내용을 초기화하시겠습니까?"
            message="현재 입력된 지문 내용이 모두 삭제됩니다."
            cancelText="취소"
            confirmText="확인"
            @close="closeWarningModal"
            @confirm="confirmWarningModal"
        />
    </div>
</template>

<script setup>
import StoresInsertPassage from "@/views/generation/question/StoresInsertPassage.vue";
import UserInsertPassage from "@/views/generation/question/UserInsertPassage.vue";

import { ref, inject, computed, watch, defineExpose, onMounted } from "vue";

// 현재 활성화된 탭 상태 관리
const activeTab = ref("user");

// provide로 제공된 데이터 주입
const { currentPassage, openLoadPassageModal } = inject("passageData");

const setActiveTab = (tab) => {
    // 탭이 이미 같은 경우는 아무것도 하지 않음
    if (tab === activeTab.value) return;

    // 이전 탭 저장 (디버깅 용)
    const prevTab = activeTab.value;

    // 탭 변경 전 데이터 초기화 (모달 없이 바로 초기화)
    if (tab === "stores" || tab === "user") {
        // 내용 초기화
        currentPassage.value.PAS_CONTENT = "";
        currentPassage.value.PAS_GIST = "";

        // 제목도 초기화
        currentPassage.value.PAS_TITLE = "";
        passageTitle.value = "";

        // 모달에서 선택된 정보도 초기화 - 전역 상태가 있다면
        localStorage.removeItem("selectedPassageData");

        console.log(
            `[InsertPassage] 탭 전환: ${prevTab} -> ${tab}, 내용 초기화 완료`
        );
    }

    // 탭 변경
    activeTab.value = tab;
};

// 제목 길이 50자 제한
// saveTitle이 존재할 때만 접근하도록 수정
const saveTitle = JSON.parse(localStorage.getItem("saveResponse")) || {};

const passageTitle = ref(
    saveTitle?.passage && saveTitle.passage.title ? saveTitle.passage.title : ""
);
const MAX_LENGTH = 50;

onMounted(() => {
    // genieq-passage-data에서 데이터 로드
    try {
        const storedData = localStorage.getItem("genieq-passage-data");
        if (storedData) {
            const data = JSON.parse(storedData);

            // 작업 이름 설정
            if (data.title) {
                passageTitle.value = data.title;
            }
            // 내용 설정 (currentPassage 업데이트)
            if (data.content && currentPassage.value) {
                currentPassage.value.PAS_CONTENT = data.content;
            }
            activeTab.value = "user";
        }
    } catch (error) {}
});

watch(passageTitle, (newVal) => {
    // 최대 글자 수 제한
    if (newVal.length > MAX_LENGTH) {
        // 최대 길이로 잘라서 다시 설정
        passageTitle.value = newVal.substring(0, MAX_LENGTH);
    }
});

// 현재 입력된 글자 수 계산
const currentLength = computed(() => {
    return currentPassage.value?.PAS_CONTENT?.length || 0;
});

// 제목이 입력될 때 currentPassage 값 업데이트
watch(passageTitle, (newVal) => {
    currentPassage.value.PAS_TITLE = newVal;
});

// 탭 변경 시 currentLength 업데이트를 위한 감시자
watch(activeTab, () => {
    // 탭이 변경될 때 글자 수 재계산
    currentLength.value;
});

defineExpose({ passageTitle });
</script>
