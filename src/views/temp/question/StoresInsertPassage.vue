<template>
    <div class="h-full">
        <div
            v-if="!currentPassage.PAS_CONTENT"
            class="relative h-full min-h-[10em] flex items-center justify-center"
        >
            <button
                class="hover:bg-gray-50 hover:shadow-md box-border flex flex-col justify-center items-center p-4 gap-2 w-full max-w-[320px] min-w-[180px] h-32 border border-[#424242] rounded-xl bg-white cursor-pointer transition-colors duration-200"
                @click="openLoadPassageModal"
            >
                <Icon
                    icon="material-symbols:bookmark"
                    class="w-[2.2em] h-[2.8em] mb-2 text-[#424242]"
                />
                <p
                    class="w-full h-auto font-pretendard font-normal text-base sm:text-lg leading-[150%] text-center tracking-[-0.02em] text-[#424242] mt-2"
                >
                    자료실에서 지문 불러오기
                </p>
            </button>
        </div>
        <div v-else class="h-full">
            <textarea
                id="stores-passage-text"
                v-model="passageContent"
                readonly
                placeholder="지문을 불러와주세요"
                class="hover:border-[#0086ff] hover:shadow-md w-full h-full p-4 bg-white border border-[#E5E7EB] rounded-xl resize-none font-pretendard text-base text-[#303030] placeholder:text-[#757575] placeholder:font-medium placeholder:leading-[150%] placeholder:tracking-[-0.02em] focus:outline-none focus:ring-2 focus:ring-[#0086ff] focus:ring-opacity-50 focus:border-[#0086ff] transition-all duration-200"
            ></textarea>
        </div>

        <!-- 지문 불러오기 모달 -->
        <LoadPassageModal
            :isOpen="showLoadPassageModal"
            @close="showLoadPassageModal = false"
        />
    </div>
</template>

<script setup>
import { ref, inject, computed, watch } from "vue";
import LoadPassageModal from "@/components/generation/LoadPassageModal.vue";

// 부모 컴포넌트에서 제공하는 데이터 주입
const { currentPassage, openLoadPassageModal, showLengthWarning } =
    inject("passageData");
const MIN_LENGTH = 500;
const MAX_LENGTH = 1700;

// 지문 내용을 위한 반응형 변수
const passageContent = computed({
    get: () => currentPassage.value.PAS_CONTENT || "",
    set: (newValue) => {
        currentPassage.value.PAS_CONTENT = newValue;
    },
});
</script>
