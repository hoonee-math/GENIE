<template>
    <div class="flex flex-col gap-8 p-0 md:p-8 box-border w-full">
        <div
            class="flex flex-col items-start gap-4 w-full px-4 md:mt-0 bg-white md:bg-[#f9fafb] h-screen"
        >
            <p
                class="hidden md:block min-w-[120px] font-pretendard font-bold text-2xl md:text-xl leading-[150%] tracking-[-0.02em] text-[#16252d]"
            >
                문항 생성
            </p>

            <div class="w-full">
                <!-- 데스크탑 버전 -->
                <div class="hidden md:flex flex-row gap-6 w-full bg-[#f9fafb]">
                    <InsertPassage ref="insertPassageRef" />
                    <PaymentUsage
                        ref="paymentUsageRef"
                        @credit-update="onCreditUpdate"
                    />
                </div>
                <!-- 모바일 버전 -->
                <div class="block md:hidden bg-white">
                    <InsertPassageMobile
                        @input-change="updateInput"
                        @type-change="updateType"
                        @title-change="updateTitle"
                        @credit-update="onCreditUpdate"
                        @handle-create-question="handleCreateQuestion"
                    />
                </div>
            </div>

            <!-- 데스크탑 버튼: md 이상 -->
            <div
                class="hidden md:flex flex-col sm:flex-row justify-end gap-4 w-full"
            >
                <BaseButton
                    id="reset_button"
                    text="초기화"
                    type="type2"
                    width="100%"
                    sm:width="248px"
                    height="54px"
                    :disabled="!resetContent"
                    @click="resetTitlePassage"
                    class="w-full sm:w-auto hover:shadow-xl active:scale-[0.98]"
                />
                <BaseButton
                    id="select-type"
                    text="문항 유형 선택하기"
                    type="type1"
                    width="100%"
                    sm:width="248px"
                    height="54px"
                    :disabled="!hasContent || creditCountValue <= 0"
                    @click="validateAndOpenModal"
                    class="w-full sm:w-auto hover:shadow-xl active:scale-[0.98]"
                />
            </div>
        </div>
    </div>

    <!-- 모달 컴포넌트들 -->
    <GenerateQuestionModal
        :isOpen="showGenerateQuestionModal"
        @close="closeGenerateQuestionModal"
        :passageTitle="passageTitle"
        :passageContent="currentPassage.PAS_CONTENT"
    />
    <LoadPassageModal
        :isOpen="showLoadPassageModal"
        @close="closeLoadPassageModal"
        @loadPassage="handleLoadPassage"
    />
    <ConfirmModalComponent
        :isOpen="isConfirmModalOpen"
        PAS_TITLE="글자 수를 확인해 주세요."
        message="500자 이하의 지문으로 정상적인 문항을 생성하기 어렵습니다. 충분한 지문을 입력해 주세요."
        @close="isConfirmModalOpen = false"
        @confirm="isConfirmModalOpen = false"
    />
    <ConfirmModalComponent
        :isOpen="isListLimitModalOpen"
        :title="listLimitModalTitle"
        :message="listLimitModalMessage"
        @close="isListLimitModalOpen = false"
        @confirm="isListLimitModalOpen = false"
    />
</template>

<script setup>
import { ref, provide, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import PaymentUsage from "@/views/generation/PaymentUsage.vue";
import InsertPassage from "@/views/temp/question/InsertPassage.vue";
import InsertPassageMobile from "@/views/temp/question/InsertPassageMobile.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import GenerateQuestionModal from "@/components/generation/GenerateQuestionModal.vue";
import LoadPassageModal from "@/components/generation/LoadPassageModal.vue";
import ConfirmModalComponent from "@/components/common/ConfirmModalComponent.vue";

// 모달 상태
const showGenerateQuestionModal = ref(false);
const showLoadPassageModal = ref(false);
const isConfirmModalOpen = ref(false);
const isListLimitModalOpen = ref(false);

// 컴포넌트 refs
const paymentUsageRef = ref(null);
const insertPassageRef = ref(null);

// 상태 관리
const creditCountValue = ref(0);
const passageTitle = ref("");
const recentListCount = ref(0);

// 라우터와 스토어 초기화
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 지문 상태
const currentPassage = ref({
    PAS_TITLE: "",
    PAS_CONTENT: "",
    PAS_GIST: "",
});

// 모달 메시지
const listLimitModalTitle = ref("최근 작업 내역이 꽉 찼습니다.");
const listLimitModalMessage = ref(
    "생성할 문항을 저장할 공간이 부족합니다. 최근 작업 내역에서 공간을 확보하고 다시 시도하세요."
);

// 이벤트 핸들러
const updateInput = (value) => {
    currentPassage.value.PAS_CONTENT = value;
};

const updateType = (value) => {
    // 선택된 문항 데이터 저장
    localStorage.setItem("selectedQuestionData", JSON.stringify(value));
};

const updateTitle = (value) => {
    passageTitle.value = value;
};

const onCreditUpdate = (count) => {
    creditCountValue.value = count;
};

const handleCreateQuestion = (data) => {
    // 지문 데이터 저장
    currentPassage.value = data.passage;
    passageTitle.value = data.title;

    // 선택된 문항 데이터 저장
    localStorage.setItem("selectedQuestionData", JSON.stringify(data.type));

    // 문항 생성 모달 표시
    showGenerateQuestionModal.value = true;
};

// 최근 작업 내역 개수 가져오기
const fetchListCount = async () => {

    try{
        console.log("api 요청?????");
        const responseData = await apiGet('/api/pass/select/count/recent');
        console.log("응답데이터: ",responseData);
        if(responseData) {
            recentListCount.value = data;
        } else {
        }
    } catch (error) {
        console.log('작업 내역 개수 확인 요청 실패:', error);
    }

    // fetch(`/api/pass/select/count/recent`, {
    //     method: "GET",
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    //     credentials: "include",
    // })
    //     .then((response) => {
    //         if (!response.ok) {
    //             if (response.status === 401) {
    //                 authStore.user = null;
    //                 authStore.isAuthenticated = false;
    //                 localStorage.removeItem("authUser");
    //                 router.push({
    //                     path: "/login",
    //                     query: { redirect: route.fullPath },
    //                 });
    //                 throw new Error("인증이 필요합니다");
    //             }
    //             return response.text().then((text) => {
    //                 throw new Error(text);
    //             });
    //         }
    //         return response.json();
    //     })
    //     .then((data) => {
    //         recentListCount.value = data;
    //     })
    //     .catch((error) => {});
};

// 검증 및 모달 관련 함수
const validateAndOpenModal = () => {
    if (creditCountValue.value <= 0) return;

    if (recentListCount.value >= 150) {
        isListLimitModalOpen.value = true;
        return;
    }

    if (!validatePassageLength()) {
        isConfirmModalOpen.value = true;
    } else {
        localStorage.setItem(
            "tempPassageData",
            JSON.stringify(currentPassage.value)
        );
        showGenerateQuestionModal.value = true;
    }
};

const validatePassageLength = () => {
    return (
        currentPassage.value.PAS_CONTENT &&
        currentPassage.value.PAS_CONTENT.length >= 500
    );
};

// 지문 관련 함수
const setPassage = (passage) => {
    currentPassage.value.PAS_CONTENT = passage.PAS_CONTENT;
    currentPassage.value.PAS_GIST = passage.PAS_GIST;
};

const resetTitlePassage = () => {
    currentPassage.value = {
        PAS_TITLE: "",
        PAS_CONTENT: "",
        PAS_GIST: "",
    };
    if (insertPassageRef.value) {
        insertPassageRef.value.passageTitle = "";
    }
};

const handleLoadPassage = (passage) => {
    setPassage(passage);
    if (passage.PAS_TITLE) {
        currentPassage.value.PAS_TITLE = passage.PAS_TITLE;
        if (insertPassageRef.value?.passageTitle !== undefined) {
            insertPassageRef.value.passageTitle = passage.PAS_TITLE;
        }
    }
    showLoadPassageModal.value = false;
};

// 모달 제어 함수
const closeLoadPassageModal = () => {
    showLoadPassageModal.value = false;
};

const closeGenerateQuestionModal = () => {
    showGenerateQuestionModal.value = false;
};

// computed 속성
const hasContent = computed(() => {
    return (
        currentPassage.value.PAS_CONTENT &&
        currentPassage.value.PAS_CONTENT.trim().length > 0 &&
        insertPassageRef.value?.passageTitle &&
        insertPassageRef.value?.passageTitle.trim().length > 0
    );
});

const resetContent = computed(() => {
    return (
        (currentPassage.value.PAS_CONTENT &&
            currentPassage.value.PAS_CONTENT.trim().length > 0) ||
        (insertPassageRef.value?.passageTitle &&
            insertPassageRef.value?.passageTitle.trim().length > 0)
    );
});

// 컴포넌트 마운트 시 실행
onMounted(() => {
    // fetchListCount();
    const savedPassageData = localStorage.getItem("tempPassageData");
    if (savedPassageData) {
        try {
            const passageData = JSON.parse(savedPassageData);
            setPassage({
                PAS_TITLE: passageData.PAS_TITLE || "",
                PAS_CONTENT: passageData.PAS_CONTENT || "",
                PAS_GIST: passageData.PAS_GIST || "",
            });
            localStorage.removeItem("tempPassageData");
        } catch (error) {}
    }
    setTimeout(() => {
        if (paymentUsageRef.value?.creditcount) {
            creditCountValue.value = paymentUsageRef.value.creditcount.value;
        }
    }, 0);
});

// provide를 통해 하위 컴포넌트에 상태와 메서드 제공
provide("passageData", {
    currentPassage,
    setPassage,
    resetTitlePassage,
    openLoadPassageModal: () => (showLoadPassageModal.value = true),
    validatePassageLength,
    showLengthWarning: () => (isConfirmModalOpen.value = true),
});
</script>
