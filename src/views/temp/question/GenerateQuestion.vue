<template>
    <!-- 데스크톱 버전 -->
    <div class="hidden md:flex flex-col gap-8 p-8 box-border w-full">
        <p class="font-pretendard font-bold text-base leading-[150%] tracking-[-0.02em] text-[#16252d]">
            문항 생성
        </p>

        <div class="flex flex-col gap-8">
            <div class="flex flex-col lg:flex-row gap-4">
                <div class="flex-1">
                    <p class="font-bold text-2xl md:text-xl leading-[150%] tracking-[-0.02em] text-black pb-2">
                        지문
                    </p>
                    <div class="w-full">
                        <EditPassage ref="editPassageRef" :initialTitle="passageData.title"
                            :initialContent="passageData.content" @content-changed="handlePassageChange" />
                    </div>
                </div>

                <PassageSummary id="passage-summary" class="w-full lg:max-w-[35%] lg:max-w-[35%]" />
            </div>

            <div class="flex flex-col lg:flex-row gap-4">
                <!-- 문항 캐러셀 -->
                <div class="flex-1 overflow-hidden">
                    <p class="h-[41px] font-bold text-2xl md:text-xl leading-[150%] tracking-[-0.02em] text-black">
                        문항
                    </p>
                    <div class="flex flex-row flex-nowrap w-auto transition-transform duration-300" :style="{
                        transform: `translateX(-${currentSlide * 100}%)`,
                    }">
                        <div v-for="(item, index) in questionsData" :key="index"
                            class="flex-none min-w-full w-full h-full">
                            <EditQuestion ref="editQuestionRefs" :questions="item.queOption"
                                :questionTitle="item.queQuery" :isEditing="isEditingGlobal" :isFromRoute="isFromRoute"
                                @edit-mode-changed="updateEditingMode" @question-changed="
                                    handleQuestionChange($event, index)
                                    " @request-edit-mode="openEditWarningModal" @recreate-question="
                                    handleRecreateButtonClick(index)
                                    " />
                        </div>
                    </div>
                </div>

                <div class="w-full lg:max-w-[35%] lg:max-w-[35%]">
                    <!-- 해설 캐러셀 -->
                    <p class="font-semibold text-2xl md:text-xl leading-8 text-black pb-2">
                        문제 해설
                    </p>
                    <div class="box-border overflow-hidden rounded-xl">
                        <div class="flex w-full transition-transform duration-300" :style="{
                            transform: `translateX(-${currentSlide * 100
                                }%)`,
                        }">
                            <div v-for="(item, index) in questionsData" :key="index"
                                class="flex-none w-full min-w-full h-full box-border flex flex-col">
                                <QuestionDescription :isEditing="isEditingGlobal" :queAnswer="item.queAnswer"
                                    :description="item.description" :slideIndex="index" @description-changed="
                                        handleDescriptionChange($event, index)
                                        " />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 페이지네이션 -->
            <div class="flex flex-row items-center p-0 gap-3 justify-center">
                <button
                    class="hover:bg-gray-100 hover:shadow-sm bg-transparent border-none cursor-pointer flex justify-center items-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="currentSlide === 0" @click="prevSlide">
                    <Icon icon="ep:arrow-left-bold" width="18px" height="18px" class="text-[#303030]" />
                </button>
                <div
                    class="flex flex-row justify-center items-center gap-2 w-[100px] h-[30px] font-pretendard text-base">
                    <span class="text-[#0086ff] text-base">{{
                        currentSlide + 1
                        }}</span>
                    / {{ questionsData.length }}
                </div>
                <button
                    class="hover:bg-gray-100 hover:shadow-sm bg-transparent border-none cursor-pointer flex justify-center items-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="currentSlide === questionsData.length - 1" @click="nextSlide">
                    <Icon icon="ep:arrow-right-bold" width="18px" height="18px" class="text-[#303030]" />
                </button>
            </div>
        </div>

        <div class="hidden md:flex flex-row items-center gap-6 justify-end">
            <BaseButton text="문항 추가하기" type="type2" width="248px" height="54px"
                :disabled="isContentChanged || isFromRoute" @click="validateAndOpenModal('generate')"
                class="flex-none order-0 flex-grow-0" />
            <BaseButton text="저장하기" type="type2" width="248px" height="54px" :disabled="!isContentChanged"
                @click="handleSaveButtonClick" class="flex-none order-1 flex-grow-0" />
            <BaseButton text="추출하기" type="type2" width="248px" height="54px" :disabled="isContentChanged"
                @click="openFileModal" class="flex-none order-2 flex-grow-0" />
        </div>
    </div>

    <!-- 모바일 버전 -->
    <div class="block md:hidden w-full bg-white h-screen">
        <!-- Header -->
        <header
            class="sticky top-0 z-999 bg-white/80 backdrop-blur-md justify-center shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-4 py-3.5 flex items-center">
            <div class="flex items-center gap-2">
                <div class="flex justify-center items-center w-full">
                    <router-link to="/questions"
                        class="text-base text-center font-bold bg-[#222] bg-clip-text text-transparent">문항생성</router-link>
                </div>
            </div>
        </header>

        <!-- 버튼 그룹 -->
        <div class="flex items-center gap-2 justify-end border-b border-gray-200 p-2">
            <button @click="validateAndOpenModal('generate')" :disabled="isContentChanged || isFromRoute"
                class="hover:bg-[#dcfce7] hover:shadow-sm px-3 py-1.5 text-xs rounded-lg transition-all duration-200 bg-[#f0fdf4] text-[#16a34a] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#f0fdf4] disabled:hover:text-[#16a34a]">
                문항 추가하기
            </button>
            <button @click="handleSaveButtonClick" :disabled="!isContentChanged"
                class="hover:bg-[#cce7ff] hover:shadow-sm px-3 py-1.5 text-xs rounded-lg transition-all duration-200 bg-[#e6f3ff] text-[#0066cc] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#e6f3ff] disabled:hover:text-[#0066cc]">
                저장하기
            </button>
            <button @click="openFileModal" :disabled="isContentChanged"
                class="hover:bg-[#e0f2fe] hover:shadow-sm px-3 py-1.5 text-xs rounded-lg transition-all duration-200 bg-[#f0f9ff] text-[#0284c7] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#f0f9ff] disabled:hover:text-[#0284c7]">
                추출하기
            </button>
        </div>
        <div class="flex flex-col gap-4 p-4">
            <!-- 문항 섹션 -->
            <div class="w-full">
                <EditPassageMobile ref="editPassageRefMobile" :initial-title="passageData.title"
                    :initial-content="passageData.content" @content-changed="handlePassageChange" />
            </div>
        </div>
    </div>

    <!-- Modals -->
    <GenerateQuestionModal :isOpen="showGenerateQuestionModal" createText="다음" mode="generate"
        @close="showGenerateQuestionModal = false" @openPaymentModal="handleUpdateQuestion" />
    <PaymentUsageModal :isOpen="showPaymentModal" createText="문항 추가하기" @close="showPaymentModal = false"
        @generate="handleQuestionGeneration" :selected-question="selectedQuestion" />
    <PaymentUsageModal :isOpen="showRecreateModal" createText="재생성하기" @close="showRecreateModal = false"
        @generate="handleRecreateGeneration" :selected-question="selectedQuestion" />
    <ConfirmModalComponent :isOpen="isConfirmModalOpen" title="문항 생성이 불가합니다."
        message="500자 이하의 지문으로 정상적인 문항을 생성하기 어렵습니다.<br>충분한 지문을 입력해 주세요." @close="isConfirmModalOpen = false"
        @confirm="isConfirmModalOpen = false" />
    <WarningModalComponent :isOpen="isLengthWarning" title="글자 수를 확인해주세요."
        message="500자 이하의 지문으로는 새로운 문항을 추가하기 어렵습니다.<br>그래도 저장하시겠습니까?" cancelText="취소하기" confirmText="저장하기"
        @close="cancelLengthWarning" @confirm="confirmLengthWarning" />
    <WarningModalComponent :isOpen="isWarningModalOpen" title="작업을 중단하시겠습니까?" message="마지막 편집 내용은 저장되지 않습니다."
        cancelText="취소하기" confirmText="작업 중단하기" @close="cancelNavigation" @confirm="confirmNavigation" />
    <WarningModalComponent :isOpen="isEditWarningModalOpen" title="문항 수정 시 최초 생성된 해설은 적용되지 않습니다."
        message="해설 수정을 원하실 경우, 직접 수정도 가능합니다." cancelText="취소하기" confirmText="수정하기" @close="closeEditWarningModal"
        @confirm="confirmEditWarningModal" />
    <FileSelectModal :isOpen="isFileModalOpen" :pasCode="pasCode" @close="closeFileModal" @confirm="handleFileSelect" />
    <LoadingModal :isOpen="isLoading" :message="loadingMessage" />
</template>

<script setup>
import {
    ref,
    onMounted,
    provide,
    onBeforeUnmount,
    getCurrentInstance,
    watch,
    nextTick,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
// 직접 컴포넌트 임포트
import EditPassage from "@/views/temp/question/EditPassage.vue";
import EditQuestion from "@/views/temp/question/EditQuestion.vue";
import PassageSummary from "@/views/temp/passage/PassageSummary.vue";
import QuestionDescription from "@/views/temp/question/QuestionDescription.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import GenerateQuestionModal from "@/components/generation/GenerateQuestionModal.vue";
import ConfirmModalComponent from "@/components/common/ConfirmModalComponent.vue";
import WarningModalComponent from "@/components/common/WarningModalComponent.vue";
import PaymentUsageModal from "@/components/generation/PaymentUsageModal.vue";
import FileSelectModal from "@/components/common/FileSelectModal.vue";
import LoadingModal from "@/components/common/LoadingModal.vue";
import EditPassageMobile from "@/views/temp/question/EditPassageMobile.vue";

const isEditingGlobal = ref(false);
const pattern = ref(null);
const type = ref(null);
const questionData = ref(null);
const passageData = ref({
    title: "",
    content: "",
    gist: "",
});
const isConfirmModalOpen = ref(false);
const isLengthWarning = ref(false);
const showGenerateQuestionModal = ref(false);
const showPaymentModal = ref(false); // PaymentUsageModal 상태
const showRecreateModal = ref(false); // 재생성하기 모달 상태 추가
const isSaved = ref(true); // 저장 상태 초기값을 true로 변경
const hasManualSave = ref(true); // 처음에는 true로 설정하여 문항 추가하기와 추출하기 버튼 활성화
const isContentChanged = ref(true); // 내용 변경 플래그 (false로 시작)
const isWarningModalOpen = ref(false);
const isFileModalOpen = ref(false); // 파일 선택 모달 상태 추가
const isEditWarningModalOpen = ref(false); // 문항 편집 경고 모달 상태 추가
const currentRecreateIndex = ref(null); // 현재 재생성하려는 문항 인덱스 추가
const isFromRoute = ref(false); // 문항 생성 페이지로 오기 전 주소에 따라 "문항 추가" 버튼 비활성화
const isProcessing = ref(false);
const pasCode = ref(0);
const isLoading = ref(false);
const loadingMessage = ref(
    "문항을 생성 중입니다.\n생성까지 최대 1분이 소요될 수 있습니다."
);

// 내용 변경 감지를 위한 타이머 설정
let changeDetectionTimer = null;

// EditQuestion 컴포넌트 참조
const editQuestionRefs = ref([]);

// 캐러셀 관련 상태
const currentSlide = ref(0);

const saveResponse = ref({});

const selectedQuestion = ref({
    pattern: "",
    type: "",
    queExample: "",
});

// try {
//   const data = localStorage.getItem('saveResponse');
//   if (data) {
//     saveResponse = JSON.parse(data);
//   }
// } catch (error) {
//   console.error('JSON 파싱 오류:', error);
//   saveResponse={};
// }

const questionsData = ref([]);

const authStore = useAuthStore();

// ✅ 값 저장 후 PaymentUsageModal 열기
const handleUpdateQuestion = (data) => {
    if (data) {
        console.log("부모에서 받은 값: ", data);
        selectedQuestion.value = {
            pattern: data.pattern || "",
            type: data.type || "",
            queExample: data.queExample || "",
        };

        // ✅ PaymentUsageModal 열기
        showPaymentModal.value = true;
    }
};

// 제목 및 지문 수정
const handlePassageChange = (updatedData) => {
    passageData.value.title = updatedData.title || "";
    passageData.value.content = updatedData.content || "";

    console.log("지문 수정됨:", passageData.value);

    // 상태 변경 감지
    handleContentChange();
};

// 해설 수정
const handleDescriptionChange = (event, index) => {
    if (!event || index === undefined) return;

    console.log(`문항 ${index + 1} 해설 수정됨:`, event);

    if (event.queAnswer) {
        questionsData.value[index].queAnswer = event.queAnswer;
    }

    if (event.description) {
        questionsData.value[index].description = event.description;
    }

    handleContentChange();
};

// 재생성하기 버튼 클릭 핸들러
const handleRecreateButtonClick = (index) => {
    console.log(
        "재생성하기 버튼 클릭됨, 문항 인덱스:",
        index || currentSlide.value
    );

    // 현재 재생성하려는 문항 인덱스 저장
    currentRecreateIndex.value =
        index !== undefined ? index : currentSlide.value;

    // ✅ 지문 길이 검증이 필요하면 추가
    if (!validatePassageLength()) {
        showLengthWarning(); // 지문이 너무 짧을 경우 경고
        return; // ✅ 검증 실패 시 함수 종료
    }

    selectedQuestion.value = {
        mode: "recreate",
        title: questionsData.value[index].queQuery,
        options: questionsData.value[index].queOption,
    };

    showRecreateModal.value = true;
};

// 재생성 실행 핸들러 (PaymentUsageModal에서 버튼 클릭 시 호출)
const handleRecreateGeneration = async () => {
    if (showRecreateModal.value === false) {
        return;
    }

    if (isProcessing.value) return; // 중복 실행 방지
    isProcessing.value = true;

    isLoading.value = true;
    loadingMessage.value =
        "문항을 재생성 중입니다.\n재생성까지 최대 1분이 소요될 수 있습니다.";

    try {
        // 1단계: 문항 생성 API 호출
        const requestData = {
            custom_passage: saveResponse.value.passage?.content || "",
            type_question: route.query.pattern,
            type_question_detail: route.query.type,
            question_example: route.query.queExample,
            mode: "recreate",
        };

        console.log("Request Data:", requestData);

        const response = await fetch("/fastapi/generate-single-passage-question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            // 인증 오류 처리 (401)
            if (response.status === 401) {
                console.error("인증 오류(401): 로그인이 필요합니다");

                // 인증 상태 초기화
                authStore.user = null;
                authStore.isAuthenticated = false;
                localStorage.removeItem("authUser");

                // 로그인 페이지로 리다이렉트
                router.push({
                    path: "/login",
                    query: { redirect: route.fullPath },
                });

                throw new Error("인증이 필요합니다");
            }
            throw new Error(`문항 생성 실패: ${response.status}`);
        }

        const result = await response.json();
        console.log("문항 생성 성공:", result);

        //2단계: 문항 저장 API 호출
        const newQuestion = {
            queQuery: result.generated_question,
            queOption: result.generated_option,
            queAnswer: result.generated_answer,
            description: result.generated_description,
        };

        const saveRequestData = {
            type: saveResponse.value.passage.type,
            keyword: saveResponse.value.passage.keyword,
            title: saveResponse.value.passage?.title || "",
            content: saveResponse.value.passage?.content || "",
            gist: saveResponse.value.passage?.gist || "",
            isGenerated: 0,
            questions: [
                ...questionsData.value, // 기존 질문 유지
                newQuestion,
            ],
            mode: "recreate",
        };

        console.log("saveRequest: ", saveRequestData);

        const updateResponse = await fetch(
            `/api/pass/ques/update/${saveResponse.value.passage.pasCode}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(saveRequestData),
            }
        );

        if (!updateResponse.ok) {
            // 인증 오류 처리 (401)
            if (response.status === 401) {
                console.error("인증 오류(401): 로그인이 필요합니다");

                // 인증 상태 초기화
                authStore.user = null;
                authStore.isAuthenticated = false;
                localStorage.removeItem("authUser");

                // 로그인 페이지로 리다이렉트
                router.push({
                    path: "/login",
                    query: { redirect: route.fullPath },
                });

                throw new Error("인증이 필요합니다");
            }
            throw new Error(`문항 저장 실패: ${updateResponse.status}`);
        }

        const updateResult = await updateResponse.json();
        console.log("문항 저장 성공:", updateResult);

        // 상태 업데이트
        questionsData.value = [...questionsData.value, newQuestion]; // 기존 질문 + 새 질문 추가
        saveResponse.value = {
            ...saveResponse.value,
            passage: updateResult, // 저장된 값 갱신
        };

        //새 문항이 표시되도록 캐러셀 인덱스 업데이트
        currentSlide.value = questionsData.value.length - 1;

        localStorage.setItem(
            "saveResponse",
            JSON.stringify(saveResponse.value)
        );

        console.log("저장된 값:", localStorage.getItem("saveResponse"));
        isLoading.value = false;

        // 모달 닫기
        showRecreateModal.value = false;
        isProcessing.value = true;
    } catch (error) {
        console.error("API 요청 실패:", error);
        alert(`오류 발생: ${error.message}`);
        isProcessing.value = false;
    } finally {
        isProcessing.value = false;
        isLoading.value = false;
    }
};

// 문항 저장 함수 (백엔드 연동 시 구현 예정)
const saveQuestion = () => {
    // 편집 모드 해제
    updateEditingMode(false);

    // 현재 EditQuestion 컴포넌트의 편집 모드 해제
    if (editQuestionRefs.value && editQuestionRefs.value[currentSlide.value]) {
        editQuestionRefs.value[currentSlide.value].toggleEditMode(false);
    }

    // 기존의 저장하기 버튼의 핸들러 함수 호출
    handleSaveButtonClick();
};

// 편집 경고 모달 열기
const openEditWarningModal = () => {
    isEditWarningModalOpen.value = true;
};

// 편집 경고 모달 닫기
const closeEditWarningModal = () => {
    isEditWarningModalOpen.value = false;
};

// 편집 경고 모달 확인 시 처리
const confirmEditWarningModal = () => {
    isEditWarningModalOpen.value = false;

    // 먼저 전역 편집 상태를 true로 설정
    updateEditingMode(true);

    // 현재 슬라이드의 EditQuestion 컴포넌트에서 편집 모드를 true로 강제 설정
    nextTick(() => {
        if (
            editQuestionRefs.value &&
            editQuestionRefs.value[currentSlide.value]
        ) {
            console.log("수정 모드 활성화: 현재 슬라이드", currentSlide.value);
            const currentEditQuestion =
                editQuestionRefs.value[currentSlide.value];
            currentEditQuestion.toggleEditMode(true); // true를 명시적으로 전달
        } else {
            console.error(
                "에러: 현재 슬라이드의 EditQuestion 컴포넌트를 찾을 수 없습니다.",
                {
                    slideIndex: currentSlide.value,
                    refsLength: editQuestionRefs.value
                        ? editQuestionRefs.value.length
                        : 0,
                }
            );
        }
    });
};

// 슬라이드 네비게이션 함수
const nextSlide = () => {
    // 정상 이동 처리
    if (currentSlide.value < questionsData.value.length - 1) {
        currentSlide.value++;
    }
};

const prevSlide = () => {
    // 정상 이동 처리
    if (currentSlide.value > 0) {
        currentSlide.value--;
    }
};

// 네비게이션 관련 변수
const pendingRoute = ref(null);

// EditPassage 컴포넌트 참조
const editPassageRef = ref(null);
const editPassageRefMobile = ref(null);

// 내용 변경 시 호출되는 함수
const handleContentChange = () => {
    // 내용이 변경되면 isContentChanged를 true로, hasManualSave를 false로 설정
    isContentChanged.value = true;
    hasManualSave.value = false;
    isSaved.value = false;
    console.log("내용이 변경되었습니다:", {
        isContentChanged: isContentChanged.value,
        hasManualSave: hasManualSave.value,
    });
};

// 저장 버튼 클릭 핸들러
const handleSaveButtonClick = async () => {
    if (isProcessing.value) return;
    isProcessing.value = true;

    try {
        const editPassageComponent =
            window.innerWidth >= 768
                ? editPassageRef.value
                : editPassageRefMobile.value;

        if (editPassageComponent) {
            const isValid = editPassageComponent.validateTextLength();

            if (isValid) {
                const currentContent = editPassageComponent.getContent();
                const currentTitle = editPassageComponent.getTitle();

                // 로깅 확인
                console.log("저장할 데이터:", {
                    title: currentTitle,
                    content: currentContent,
                });

                const pasCode = saveResponse.value.passage.pasCode;

                // 올바른 요청 데이터 구조 생성
                const requestData = {
                    type: saveResponse.value.passage.type,
                    keyword: saveResponse.value.passage.keyword,
                    title: currentTitle,
                    content: currentContent,
                    gist: saveResponse.value.passage.gist || "",
                    isGenerated: saveResponse.value.passage.isGenerated || 0,
                    questions: saveResponse.value.passage.questions || [],
                };

                // 지문 저장 api
                const response = await fetch(
                    `/api/pass/ques/update/${pasCode}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(requestData),
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    if (response.status === 401) {
                        console.error("인증 오류(401): 로그인이 필요합니다");
                        authStore.user = null;
                        authStore.isAuthenticated = false;
                        localStorage.removeItem("authUser");
                        router.push({
                            path: "/login",
                            query: { redirect: route.fullPath },
                        });
                        throw new Error("인증이 필요합니다");
                    }
                    throw new Error(`지문 저장 실패: ${response.status}`);
                }

                const data = await response.json();

                // API 응답으로 받은 데이터로 saveResponse 업데이트
                saveResponse.value = {
                    ...saveResponse.value,
                    passage: data,
                };

                // 업데이트된 데이터를 로컬스토리지에 저장
                localStorage.setItem(
                    "saveResponse",
                    JSON.stringify(saveResponse.value)
                );

                // 상태 업데이트
                isSaved.value = true;
                hasManualSave.value = true;
                isContentChanged.value = false;

                console.log("지문이 성공적으로 저장되었습니다:", data);
                return true;
            } else {
                showLengthWarning();
                return false;
            }
        }
        return false;
    } catch (error) {
        console.error("지문 저장 실패:", error);
        alert("지문 저장에 실패했습니다.");
        return false;
    } finally {
        isProcessing.value = false;
    }
};

// 지문 데이터 저장 함수
const savePassageData = () => {
    if (passageData.value) {
        localStorage.setItem(
            "generateQuestionPassageData",
            JSON.stringify(passageData.value)
        );
        console.log("지문 데이터 저장 완료:", passageData.value);
    }
};

const updateEditingMode = (value) => {
    console.log("전역 편집 모드 변경:", value);
    isEditingGlobal.value = value;
};

// validatePassageLength 함수
const validatePassageLength = () => {
    const editPassageComponent =
        window.innerWidth >= 768
            ? editPassageRef.value
            : editPassageRefMobile.value;
    if (editPassageComponent) {
        return editPassageComponent.validateTextLength();
    }
    return false;
};

// showLengthWarning 함수
const showLengthWarning = () => {
    isConfirmModalOpen.value = true;
};

// validateAndOpenModal 함수 수정
const validateAndOpenModal = () => {
    if (!validatePassageLength()) {
        showLengthWarning();
    } else {
        localStorage.setItem(
            "tempPassageData",
            JSON.stringify(passageData.value)
        );
        // GenerateQuestion 표시
        showGenerateQuestionModal.value = true;
    }
};

// 파일 선택 모달 열기 함수
const openFileModal = () => {
    isFileModalOpen.value = true;
};

// 파일 선택 모달 닫기 함수
const closeFileModal = () => {
    isFileModalOpen.value = false;
};

// 파일 선택 처리 함수
const handleFileSelect = (fileType) => {
    console.log("선택된 파일 형식:", fileType);
    // 여기에 선택된 파일 형식에 따른 추출 로직 구현
    // 예: PDF, Word, TXT 파일 생성 및 다운로드 등
};

// 문항 생성 처리 함수
const handleQuestionGeneration = async () => {
    if (showPaymentModal.value === false) {
        return;
    }

    if (isProcessing.value) return; // 중복 실행 방지
    isProcessing.value = true;

    isLoading.value = true;
    loadingMessage.value =
        "새로운 문항을 생성 중입니다.\n생성까지 최대 1분이 소요될 수 있습니다.";

    try {
        // 임시 api 연결
        const apiUrl = import.meta.env.VITE_API_URL;

        // 1단계: 문항 생성 API 호출
        const requestData = {
            custom_passage: saveResponse.value.passage?.content || "",
            type_question: selectedQuestion.value.pattern,
            type_question_detail: selectedQuestion.value.type,
            question_example: selectedQuestion.value.queExample,
        };

        console.log("Request Data:", requestData);

        const response = await fetch("/fastapi/generate-single-passage-question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            // 인증 오류 처리 (401)
            if (response.status === 401) {
                console.error("인증 오류(401): 로그인이 필요합니다");

                // 인증 상태 초기화
                authStore.user = null;
                authStore.isAuthenticated = false;
                localStorage.removeItem("authUser");

                // 로그인 페이지로 리다이렉트
                router.push({
                    path: "/login",
                    query: { redirect: route.fullPath },
                });

                throw new Error("인증이 필요합니다");
            }
            throw new Error(`문항 생성 실패: ${response.status}`);
        }

        const result = await response.json();
        console.log("문항 생성 성공:", result);

        //2단계: 문항 저장 API 호출
        const newQuestion = {
            queQuery: result.generated_question,
            queOption: result.generated_option,
            queAnswer: result.generated_answer,
            description: result.generated_description,
        };

        const saveRequestData = {
            type: saveResponse.value.passage.type,
            keyword: saveResponse.value.passage.keyword,
            title: saveResponse.value.passage?.title || "",
            content: saveResponse.value.passage?.content || "",
            gist: saveResponse.value.passage?.gist || "",
            isGenerated: 0,
            questions: [
                ...questionsData.value, // 기존 질문 유지
                newQuestion,
            ],
            mode: "generate", // mode를 명확히 추가
        };

        console.log("saveRequest: ", saveRequestData);

        const updateResponse = await fetch(
            `/api/pass/ques/update/${saveResponse.value.passage.pasCode}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(saveRequestData),
            }
        );

        if (!updateResponse.ok) {
            // 인증 오류 처리 (401)
            if (response.status === 401) {
                console.error("인증 오류(401): 로그인이 필요합니다");

                // 인증 상태 초기화
                authStore.user = null;
                authStore.isAuthenticated = false;
                localStorage.removeItem("authUser");

                // 로그인 페이지로 리다이렉트
                router.push({
                    path: "/login",
                    query: { redirect: route.fullPath },
                });

                throw new Error("인증이 필요합니다");
            }
            throw new Error(`문항 저장 실패: ${updateResponse.status}`);
        }

        const updateResult = await updateResponse.json();
        console.log("문항 저장 성공:", updateResult);

        // 상태 업데이트
        questionsData.value = [...questionsData.value, newQuestion]; // 기존 질문 + 새 질문 추가
        saveResponse.value = {
            ...saveResponse.value,
            passage: updateResult, // 저장된 값 갱신
        };

        //새 문항이 표시되도록 캐러셀 인덱스 업데이트
        currentSlide.value = questionsData.value.length - 1;

        localStorage.setItem(
            "saveResponse",
            JSON.stringify(saveResponse.value)
        );

        console.log("저장된 값:", localStorage.getItem("saveResponse"));
        isLoading.value = false;

        // 모달 닫기
        showPaymentModal.value = false;
        isProcessing.value = false;
    } catch (error) {
        console.error("API 요청 실패:", error);
        alert(`오류 발생: ${error.message}`);
        isProcessing.value = false;
    } finally {
        isProcessing.value = false;
        isLoading.value = false;
    }
};

const handleQuestionChange = (updatedData, index) => {
    if (!updatedData || index === undefined) return;

    console.log(`문항 수정됨 [${index}]:`, updatedData);

    // ✅ 수정된 값 명확하게 저장
    questionsData.value[index] = {
        ...questionsData.value[index],
        queQuery: updatedData.title || "",
        queOption: updatedData.options || [],
    };

    // 상태 변경 감지
    handleContentChange();
};

// const handleDescriptionChange = (event, index) => {
//   handleContentChange();

//   // 해당 인덱스의 문항 데이터 업데이트
//   if (event && index !== undefined) {
//     const targetIndex = index;

//     if (event.correct) {
//       console.log(`문항 ${targetIndex+1}의 정답을 ${event.correct}로 업데이트`);
//       questionsData.value[targetIndex].correct = event.correct;
//     }
//     if (event.description) {
//       console.log(`문항 ${targetIndex+1}의 해설 업데이트`);
//       questionsData.value[targetIndex].description = event.description;
//     }
//   }
// };

// 라우터 관련 정보 가져오기
const route = useRoute();
const router = useRouter();

// 저장되지 않은 변경사항이 있는지 확인하는 함수
const hasUnsavedChanges = () => {
    const hasContentChanged = isContentChanged.value && !isSaved.value;
    const hasUnsavedContent =
        passageData.value &&
        passageData.value.content &&
        passageData.value.content.length > 0 &&
        !hasManualSave.value;

    console.log("변경 감지 상태:", {
        isContentChanged: isContentChanged.value,
        isSaved: isSaved.value,
        hasManualSave: hasManualSave.value,
        hasContentChanged,
        hasUnsavedContent,
    });

    return hasContentChanged || hasUnsavedContent;
};

// 페이지 이탈 시, 경고 (브라우저 새로고침, 닫기 등)
const handleBeforeUnload = (e) => {
    if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "";
        return "";
    }
};

// 이동 취소 - 현재 화면 유지
const cancelNavigation = () => {
    console.log("네비게이션 취소됨");
    isWarningModalOpen.value = false;
    pendingRoute.value = null;
};

// 이동 확인 - 타겟 페이지로 이동
const confirmNavigation = () => {
    console.log("네비게이션 승인됨, 이동 실행");
    isWarningModalOpen.value = false;
    isContentChanged.value = false;
    hasManualSave.value = true;

    if (pendingRoute.value) {
        const targetPath = pendingRoute.value;
        pendingRoute.value = null;
        router.push(targetPath);
    }
};

// Vue 인스턴스 참조
const instance = getCurrentInstance();
let routerGuard = null;

onMounted(() => {
    try {
        const data = localStorage.getItem("saveResponse");
        if (data) {
            saveResponse.value = JSON.parse(data);
            console.log("로드된 데이터:", saveResponse.value);

            // ✅ 값이 있으면 상태에 반영
            passageData.value.title = saveResponse.value.passage?.title || "";
            passageData.value.content =
                saveResponse.value.passage?.content || "";
            questionsData.value = saveResponse.value.passage?.questions || [];
            pasCode.value = saveResponse.value.passage?.pasCode || "";
        }
    } catch (error) {
        console.error("JSON 파싱 오류:", error);
        saveResponse.value = {}; // ✅ 오류 발생 시 빈 객체로 초기화
    }
    // URL 쿼리 파라미터에서 문항 유형과 서술 방식 가져오기
    if (route.query) {
        pattern.value = route.query.pattern || null;
        type.value = route.query.type || null;
    }

    // 라우터 state에서 선택된 문항 데이터 가져오기
    if (saveResponse.value && saveResponse.value.question) {
        questionData.value = saveResponse.question;
    }

    // 라우터 state에서 지문 데이터 가져오기
    if (saveResponse.value && saveResponse.value.passage) {
        passageData.value = saveResponse.value.passage;

        // EditPassage에 지문 내용 설정
        if (
            editPassageRef.value &&
            saveResponse.value.passage &&
            saveResponse.value.passage.content
        ) {
            editPassageRef.value.setContent(saveResponse.value.passage.content);
        }
    }
    // 로컬 스토리지에서 지문 데이터 확인
    else {
        const storedPassageData = localStorage.getItem(
            "generateQuestionPassageData"
        );
        if (storedPassageData) {
            try {
                passageData.value = JSON.parse(storedPassageData);

                // EditPassage에 지문 내용 설정
                if (
                    editPassageRef.value &&
                    passageData.value &&
                    passageData.value.content
                ) {
                    editPassageRef.value.setContent(passageData.value.content);
                }
            } catch (error) {
                console.error(
                    "저장된 지문 데이터를 불러오는 중 오류 발생:",
                    error
                );
            }
        }
    }

    // 이전 경로가 /home 또는 /storage로 시작하는지 확인
    const fromPath = route.query.from || "";
    isFromRoute.value =
        fromPath.startsWith("/home") || fromPath.startsWith("/storage");
    console.log("이전 경로:", route.query.from, isFromRoute.value);

    // 브라우저 새로고침, 닫기 등에 대한 이벤트 리스너 추가
    window.addEventListener("beforeunload", handleBeforeUnload);

    // 전역 네비게이션 가드 설정
    routerGuard = router.beforeEach((to, from, next) => {
        console.log("라우터 가드 호출됨", {
            from: from.path,
            to: to.path,
            current: route.path,
        });

        // 현재 라우트에서 다른 라우트로 이동하는 경우에만 확인
        if (from.path === route.path && hasUnsavedChanges()) {
            console.log(
                "저장되지 않은 변경사항 감지됨, 네비게이션 중단 및 모달 표시"
            );

            // 저장되지 않은 변경사항이 있다면 모달 표시하고 대기
            isWarningModalOpen.value = true;
            pendingRoute.value = to.fullPath; // 이동하려는 전체 경로 저장

            return false; // 네비게이션 중단
        }

        console.log("네비게이션 계속 진행");
        localStorage.removeItem("saveResponse");
        return next(); // 네비게이션 계속
    });

    // localStorage 변경 감지 타이머 설정
    changeDetectionTimer = setInterval(() => {
        const hasChanged =
            localStorage.getItem("editPassageChanged") === "true";
        if (hasChanged) {
            // 변경사항 있음 - 버튼 활성화
            isContentChanged.value = true;
            localStorage.removeItem("editPassageChanged");
        }
    }, 500); // 500ms마다 체크
});

onBeforeUnmount(() => {
    // 컴포넌트 해제 시 이벤트 리스너 제거
    window.removeEventListener("beforeunload", handleBeforeUnload);

    // 라우터 가드 제거
    if (routerGuard) {
        routerGuard();
    }

    // 타이머 정리
    if (changeDetectionTimer) {
        clearInterval(changeDetectionTimer);
    }

    // localStorage 정리
    localStorage.removeItem("editPassageChanged");
});

// provide 실행
provide("passageData", {
    passage: passageData,
    updatePassage: (newContent) => {
        if (passageData.value) {
            passageData.value.content = newContent;
            // 내용이 변경되었음을 표시
            handleContentChange();
        } else {
            passageData.value = { content: newContent };
            // 새로운 내용이 추가되었음을 표시
            handleContentChange();
        }
    },
});

// 슬라이드가 변경될 때마다 포커스 조정 (접근성 개선)
watch(currentSlide, (newSlide) => {
    console.log(`슬라이드 변경: ${newSlide + 1}/${questionsData.value.length}`);
});

// 핵심 논점 요약 함수 추가
const handleSummaryClick = async () => {
    if (isProcessing.value) return;
    isProcessing.value = true;

    try {
        const response = await fetch("/fastapi/generate-summary", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: passageData.value.content,
            }),
        });

        if (!response.ok) {
            throw new Error(`요약 생성 실패: ${response.status}`);
        }

        const result = await response.json();
        console.log("요약 생성 성공:", result);

        // 핵심 논점 업데이트
        passageData.value.gist = result.summary;
        handleContentChange();
    } catch (error) {
        console.error("요약 생성 실패:", error);
        alert("요약 생성에 실패했습니다.");
    } finally {
        isProcessing.value = false;
    }
};
</script>
