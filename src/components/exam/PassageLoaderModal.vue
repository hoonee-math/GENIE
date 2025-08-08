<template>
    <BaseModal :isOpen="isOpen" width="80vw" height="80vh" @close="closeModal">
        <div class="w-full h-full flex flex-col items-start gap-4 box-border max-w-[1232px] max-h-[968px]">
            <h1
                class="w-full font-pretendard font-bold text-lg md:text-xl leading-[150%] tracking-[-0.02em] text-[#303030]">
                지문 및 문항 불러오기
            </h1>

            <div class="flex flex-col gap-3 w-full">
                <!-- 지문 구조 -->
                <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <span class="font-pretendard font-normal text-sm leading-[150%] tracking-[-0.02em] text-[#424242]">
                        지문 구조
                    </span>
                    <div class="flex flex-wrap gap-2 md:gap-4 overflow-x-auto w-full md:w-auto">
                        <BaseButton v-for="structure in passageStructures" :key="structure.id" :text="structure.label" type="type3"
                            :width="structure.width" height="40px" class="transition-all duration-200" :class="{
                                'bg-[#e6f3ff] border-none text-[#0066cc]':
                                    activeType === structure.label,
                                'bg-white border-[#bdbdbd] text-[#757575] hover:border-[#0086ff] hover:text-[#0086ff]':
                                    activeType !== structure.label,
                            }" @click="activeType = structure.label" />
                    </div>
                </div>
            </div>

            <!-- 사용자의 저장된 지문+문항 목록, 문항이 있는 지문들만 호출하여 보여줘야 함. 새로운 api 필요.-->
            <!-- 목록은 @/components/exam/PassageBlock.vue 을 재활용하는 것을 고려. but 구조가 다름. PassageBlock 이나 QuesetionItem 에 들어있는 heroicons-solid:menu-alt-4 아이콘과 index 번호를 출력해주는 대신에 체크 박스가 필요함.-->
            <!-- PassageBlock 이나 QuesetionItem 를 수정하여, 체크박스 형태를 이용하고 싶은 경우를 props로 전달할 수 있게 설정 -->
            <!-- 해당 체크박스를 이용해서 문제지로 불러올 지문과 문항을 선택. 지문을 체크하면 모든 문항이 체크됨. 일부 문항만 체크하면 지문에 체크된 체크 박스가 부분체크된 상태를 보여주는 형태로 변해야함. -->
            <div class="flex flex-col lg:flex-row gap-4 md:gap-5 flex-1 w-full overflow-hidden">
                <!-- 지문+문항 목록 -->
                <div
                    class="w-full flex-1 h-full rounded-[20px] border border-[#bdbdbd] p-4 md:p-5 flex items-center justify-center overflow-hidden">
                    <div v-if="loadedPassagesFromStroage.length > 0" class="flex flex-col gap-4 w-full h-full overflow-y-auto">
                        <!-- 이곳에 체크박스형의 PassageBlock 이 오면 됨. -->
                    </div>
                    <div v-else class="font-bold text-base md:text-lg leading-[150%] tracking-[-0.02em] text-center">
                        문항 생성 페이지에서 새로운 문항을 생성해주세요.
                    </div>
                </div>

                <!-- 미리보기 -->
                <div
                    class="w-full flex-1 h-full rounded-[20px] border border-[#bdbdbd] p-4 md:p-6 flex flex-col items-start overflow-hidden">
                    <!-- 이곳에 선택한 문항의 지문을 불러오면 됨. passage.questions 구조이므로 pasCode는 다른 지문, 다른 지문의 문항을 선택할때 변경될 것임. -->
                </div>
            </div>

            <!-- 버튼 영역 -->
            <div class="flex flex-col sm:flex-row gap-2.5 self-end w-full sm:w-auto">
                <div class="flex gap-2.5 w-full sm:w-auto relative">
                    <BaseButton text="닫기" type="type3" height="54px" class="w-full sm:w-auto px-8 text-sm"
                        @click="closeModal" />
                    <BaseButton text="지문 및 문항 추가하기" type="type1" height="54px" class="w-full sm:w-auto px-8 text-sm"
                        :disabled="!selectedQuestion" @click.once="handleLoadPassageAndQuestionFromStorage" />
                </div>
            </div>
        </div>
    </BaseModal>

    <LoadingModal :isOpen="isLoading" :message="loadingMessage" />
</template>
<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import BaseModal from "@/components/common/BaseModal.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import LoadingModal from "@/components/common/LoadingModal.vue";

const router = useRouter();
const emit = defineEmits(["close"]);
const loadedPassagesFromStroage = ref();

const props = defineProps({
    isOpen: Boolean,
});

const passageStructures = ref([
    { id: 1, label: "전체" },
    { id: 2, label: "단일 지문" },
    { id: 3, label: "복합 지문" },
    { id: 4, label: "독서론 지문" },
]);

const closeModal = () => {
    emit("close");
};

const handleLoadPassageAndQuestionFromStorage = async () => {
    if (isProcessing.value) return; // 중복 실행 방지
    isProcessing.value = true;

    try {
        // 체크 박스에 선택한, 지문과 문항 목록 전체를 PassageLoaderPanel 에 전달. 즉, useGenerateExam 의 passages 에 저장하는 로직이 추가되어야 함.
        // ...
    } catch (error) {
        alert(`오류가 발생했습니다.`);
    } finally {
        emit("close");
    }
};

// 그 밖에 필요한 함수들 추가 예정

</script>
