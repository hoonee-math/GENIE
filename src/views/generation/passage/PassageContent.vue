<template>
    <div class="w-full">
        <!-- 데스크톱 버전 -->
        <div
            class="hidden md:flex flex-col gap-6 md:gap-8 p-[1.4%_2%] box-border w-full mx-auto"
        >
            <div class="relative flex-1 flex flex-col gap-4 w-full">
                <div
                    class="flex flex-row gap-4 md:gap-6 items-stretch h-full min-h-[70vh]"
                >
                    <PassageContentMain
                        ref="passageContentRef"
                        @content-changed="handleContentChange"
                        class="w-[70%]"
                    />
                    <PassageSummary
                        ref="passageSummaryRef"
                        class="w-[30%] min-w-[300px]"
                    />
                </div>

                <div class="hidden md:flex flex-row justify-end gap-4 mt-4">
                    <BaseButton
                        id="save-button"
                        text="저장하기"
                        type="type2"
                        width="248px"
                        height="54px"
                        @click="handleSaveButtonClick"
                    />
                    <BaseButton
                        id="download-button"
                        text="추출하기"
                        type="type2"
                        width="248px"
                        height="54px"
                        :disabled="isContentChanged || !hasManualSave"
                        @click="checkContentLengthAndOpenFileModal()"
                    />
                    <router-link to="/questions" custom v-slot="{ navigate }">
                        <BaseButton
                            id="connect-create-button"
                            text="이어서 문항 생성하기"
                            type="type4"
                            width="520px"
                            height="54px"
                            @click="handleConnectCreate($event, navigate)"
                            :disabled="isContentChanged"
                        />
                    </router-link>
                </div>
            </div>
        </div>

        <!-- 모바일 버전 -->
        <div
            class="block md:hidden flex flex-col gap-4 box-border w-full mx-auto bg-white"
        >
            <div class="relative flex-1 flex flex-col gap-4 w-full">
                <div class="flex flex-col items-stretch min-h-[70vh]">
                    <PassageContentMainMobile
                        ref="passageContentRef"
                        @content-changed="handleContentChange"
                        :initial-title="title"
                        :initial-content="content"
                        class="w-full"
                    />
                </div>

                <div class="hidden flex flex-col gap-4 mt-4">
                    <BaseButton
                        id="save-button"
                        text="저장하기"
                        type="type2"
                        width="100%"
                        height="54px"
                        @click="handleSaveButtonClick"
                        class="w-full"
                    />
                    <BaseButton
                        id="download-button"
                        text="추출하기"
                        type="type2"
                        width="100%"
                        height="54px"
                        :disabled="isContentChanged || !hasManualSave"
                        @click="checkContentLengthAndOpenFileModal()"
                        class="w-full"
                    />
                    <router-link
                        to="/questions"
                        custom
                        v-slot="{ navigate }"
                        class="w-full"
                    >
                        <BaseButton
                            id="connect-create-button"
                            text="이어서 문항 생성하기"
                            type="type4"
                            width="100%"
                            height="54px"
                            @click="handleConnectCreate($event, navigate)"
                            :disabled="isContentChanged"
                            class="w-full"
                        />
                    </router-link>
                </div>
            </div>
        </div>

        <!-- Modals -->
        <FileSelectModal
            :isOpen="isFileModalOpen"
            :pasCode="pasCode"
            @close="closeFileModal"
            @confirm="handleFileSelect"
        />
        <ConfirmModalComponent
            :isOpen="isConfirmModalOpen"
            title="글자 수를 확인해 주세요."
            message="500자 이하의 지문으로 정상적인 문항을 생성하기 어렵습니다. 충분한 지문을 입력해 주세요."
            @close="closeConfirmModal"
            @confirm="closeConfirmModal"
        />
        <WarningModalComponent
            :isOpen="isWarningModalOpen"
            title="작업을 중단하시겠습니까?"
            message="마지막 편집 내용은 저장되지 않습니다."
            cancelText="취소하기"
            confirmText="작업 중단하기"
            @close="cancelNavigation"
            @confirm="confirmNavigation"
        />
        <PaymentUsageModal
            ref="paymentUsageModalRef"
            :isOpen="isPaymentUsageModalOpen"
            @close="closePaymentUsageModal"
            @generate="handleGenerate"
        />
        <ConfirmModalComponent
            :isOpen="isSaveSuccessModalOpen"
            title="확인"
            :message="saveSuccessMessage"
            @close="closeSaveSuccessModal"
            @confirm="closeSaveSuccessModal"
        />
        <LoadingModal :isOpen="isLoading" :message="loadingMessage" />
    </div>
</template>

<script setup>
import PassageContentMain from "@/views/generation/passage/PassageContentMain.vue";
import PassageContentMainMobile from "@/views/generation/passage/PassageContentMainMobile.vue";
import PassageSummary from "@/views/generation/passage/PassageSummary.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import FileSelectModal from "@/components/common/FileSelectModal.vue";
import ConfirmModalComponent from "@/components/common/ConfirmModalComponent.vue";
import WarningModalComponent from "@/components/common/WarningModalComponent.vue";
import PaymentUsageModal from "@/components/generation/PaymentUsageModal.vue";
import LoadingModal from "@/components/common/LoadingModal.vue";
import {
    ref,
    onMounted,
    onBeforeUnmount,
    getCurrentInstance,
    nextTick,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePassageStore } from "@/stores/passage";
import { useAuthStore } from "@/stores/auth";
// UI 상태 관리
const isFileModalOpen = ref(false);
const isConfirmModalOpen = ref(false);
const hasManualSave = ref(true); // 초기값을 true로 설정 (초기 상태에서 추출하기 버튼 활성화)
const isContentChanged = ref(false); // 내용 변경 여부 추적 (초기 상태는 변경되지 않음)
const isWarningModalOpen = ref(false); // 경고 모달 상태
const isPaymentUsageModalOpen = ref(false); // 결제 사용 모달 상태
const isLoading = ref(false); // 로딩 상태 추가
const loadingMessage = ref(
    "지문을 생성 중입니다.\n생성까지 최대 3분이 소요될 수 있습니다."
); // 로딩 메시지
const isFromRoute = ref(false); // 이전 페이지의 루트 확인용
const isSaveSuccessModalOpen = ref(false); // 저장 확인 모달 오픈
const saveSuccessMessage = ref("지문이 저장되었습니다."); // 저장 확인 모달 메시지
const navigatingToQuestions = ref(false); // 이동 경로 추적을 위한 플래그 추가

// 중복 요청 방지를 위한 처리 상태 플래그 추가
const isProcessing = ref(false);
// 네비게이션 관련 변수
const pendingRoute = ref(null); // 대기 중인 라우트 정보 저장
// 컴포넌트 참조
const passageContentRef = ref(null);
const passageSummaryRef = ref(null);
// 지문 데이터 상태 관리
const title = ref("");
const content = ref("");
const summary = ref({});
const pasCode = ref(null);
const type = ref("");
const keyword = ref("");
const gist = ref([]);
const subject = ref("");
// 라우터 관련 정보 가져오기
const route = useRoute();
const router = useRouter();
const passageStore = usePassageStore();
const authStore = useAuthStore();

const paymentUsageModalRef = ref(null);
// 글자 수 체크 함수
const checkContentLength = (event) => {
    // 내용 길이 검증
    if (passageContentRef.value && !passageContentRef.value.validateContent()) {
        event?.preventDefault(); // 라우터 링크 이벤트 방지
        isConfirmModalOpen.value = true;
        return false;
    }
    return true;
};
// 결제 사용 모달 관련 함수
const openPaymentUsageModal = () => {
    if (checkContentLength(new Event("click"))) {
        // 저장된 지문 데이터를 로컬 스토리지에 임시 저장
        const passageData = {
            title: title.value,
            content: content.value,
            summary: summary.value,
            pasCode: pasCode.value,
            type: type.value,
            keyword: keyword.value,
        };
        localStorage.setItem(
            "generateQuestionPassageData",
            JSON.stringify(passageData)
        );

        // 모달 열기 전에 이용권 정보 갱신
        if (
            paymentUsageModalRef.value &&
            paymentUsageModalRef.value.updateCreditCount
        ) {
            authStore.updateTicketCount().then((count) => {
                paymentUsageModalRef.value.updateCreditCount(count);

                // 갱신 후 모달 열기
                isPaymentUsageModalOpen.value = true;
            });
        } else {
            // ref나 초기화 메서드가 없어도 모달은 열어줌
            isPaymentUsageModalOpen.value = true;
        }
    }
};

// 모달 관련 함수
const closePaymentUsageModal = () => {
    isPaymentUsageModalOpen.value = false;
};

const openSaveSuccessModal = () => {
    isSaveSuccessModalOpen.value = true;
};

const closeSaveSuccessModal = () => {
    isSaveSuccessModalOpen.value = false;
};

const validatePassageLength = () => {
    if (passageContentRef.value) {
        // 기존 메서드가 있다면 호출
        if (typeof passageContentRef.value.validateTextLength === "function") {
            return passageContentRef.value.validateTextLength();
        }
        // 아니면 직접 내용 길이 검증
        const contentText = content.value || "";
        return contentText.length >= 500;
    }
    return false;
};

// 백엔드 API에 지문 저장 함수 (handleGenerate 함수에서 호출)
const savePassageToBackend = (data) => {
    if (!data || !data.generated_passage) {
        alert("지문 데이터가 유효하지 않습니다.");
        isLoading.value = false;
        isProcessing.value = false;
        return;
    }

    loadingMessage.value = "생성된 지문을 저장 중입니다...";
    // console.log("[LOG-1] 재생성된 데이터 저장 시도:", {
    //     type: data.type_passage,
    //     keyword: data.keyword,
    //     content_length: data.generated_passage ? data.generated_passage.length : 0
    // });

    const saveData = {
        type: data.type_passage || type.value,
        keyword: keyword.value,
        title: title.value,
        content: data.generated_passage,
        gist: data.generated_core_point,
        isGenerated: 1,
    };

    // 백엔드 API 호출
    fetch(`/api/pass/insert/each`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(saveData),
    })
        .then((response) => {
            if (!response.ok) {
                if (response.status === 401) {
                    authStore.user = null;
                    authStore.isAuthenticated = false;
                    localStorage.removeItem("authUser");
                    router.push({
                        path: "/login",
                        query: { redirect: router.currentRoute.value.fullPath },
                    });
                    throw new Error("인증이 필요합니다");
                }
                return response.text().then((text) => {
                    throw new Error("저장 API 호출 실패: " + text);
                });
            }
            return response.json();
        })
        .then((responseData) => {
            authStore.updateTicketCount().then((newCount) => {}); // 차감된 이용권으로 update

            const passageData = {
                pasCode: responseData.pasCode,
                title: saveData.title,
                type: saveData.type,
                keyword: saveData.keyword,
                content: saveData.content,
                gist: saveData.gist,
            };

            localStorage.setItem(
                "genieq-passage-data",
                JSON.stringify(passageData)
            );

            // 저장 성공 후 상태 업데이트
            isContentChanged.value = false; // 변경 내용이 없는 상태로 설정
            hasManualSave.value = true; // 저장된 상태로 설정

            router.push("/passage/create");

            // 상태 초기화
            isLoading.value = false;
            isProcessing.value = false;
        })
        .catch((error) => {
            alert("저장 중 오류가 발생했습니다: " + error.message);
            isLoading.value = false;
            isProcessing.value = false;
        });
};
const handleGenerate = () => {
    if (isProcessing.value) {
        return;
    }

    closePaymentUsageModal();
    // 재생성 처리 로직
    isProcessing.value = true;
    isLoading.value = true;
    loadingMessage.value =
        "지문을 재생성 중입니다.\n재생성까지 최대 3분이 소요될 수 있습니다.";

    // 로컬 스토리지에서 문자열로 데이터 가져오기
    const savedGenerateDataStr = localStorage.getItem("genieq-passage-data");

    if (!savedGenerateDataStr) {
        isLoading.value = false;
        return;
    }

    // 문자열을 객체로 파싱
    let savedGenerateData;
    try {
        savedGenerateData = JSON.parse(savedGenerateDataStr);
    } catch (error) {
        alert("지문 데이터 처리 중 오류가 발생했습니다.");
        isLoading.value = false;
        return;
    }

    const requestData = {
        type_passage: savedGenerateData.type,
        keyword: [savedGenerateData.keyword],
    };

    fetch("/fastapi/generate-passage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`API 호출 실패: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            savePassageToBackend(data);

            // 재생성 결과 적용
            if (passageContentRef.value) {
                passageContentRef.value.setContent(data.generated_passage);
            }
            if (
                passageSummaryRef.value &&
                typeof passageSummaryRef.value.setSummary === "function"
            ) {
                const summaryData = {
                    subject: type.value,
                    keyword: keyword.value,
                    gist: data.generated_core_point,
                };
                passageSummaryRef.value.setSummary(summaryData);
            }
            // 상태 업데이트
            content.value = data.generated_passage;
            summary.value = {
                subject: type.value,
                keyword: keyword.value,
                gist: data.generated_core_point,
            };

            isContentChanged.value = false;
            hasManualSave.value = true;
        })
        .catch((error) => {
            fetch(`/api/test/generate-passage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`API 호출 실패: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    localStorage.setItem("pathFromGenerate", "true");
                    savePassageToBackend(data);
                })
                .catch((error) => {});
            isLoading.value = false;
            isProcessing.value = false;
        })
        .finally(() => {
            isLoading.value = false;
            isProcessing.value = false;
        });
};
// 저장 버튼 클릭 핸들러
const handleSaveButtonClick = () => {
    if (isProcessing.value) {
        return;
    }
    isProcessing.value = true;

    // 로딩 상태 활성화
    isLoading.value = true;
    loadingMessage.value = "저장 중입니다...";
    // 저장할 데이터 준비
    const saveData = {
        pasCode: pasCode.value,
        title: title.value,
        content: content.value,
    };
    // console.log('📢 지문 업데이트 요청 데이터:', saveData);
    if (!pasCode.value) {
        alert("지문 코드가 없습니다. 저장할 수 없습니다.");
        isLoading.value = false;
        return;
    }

    // 백엔드 API 호출 - 지문 업데이트
    fetch(`/api/pass/update/each`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(saveData),
    })
        .then((response) => {
            if (!response.ok) {
                if (response.status === 401) {
                    // 인증 오류 처리
                    authStore.user = null;
                    authStore.isAuthenticated = false;
                    localStorage.removeItem("authUser");
                    router.push({
                        path: "/login",
                        query: { redirect: route.fullPath },
                    });
                    throw new Error("인증이 필요합니다");
                }
                throw new Error("업데이트 API 호출 실패: " + response.status);
            }
            return response.json();
        })
        .then((responseData) => {
            // 통합 데이터 구조로 저장
            const updatedData = {
                pasCode: pasCode.value,
                title: title.value,
                content: content.value,
                type: type.value,
                keyword: keyword.value,
                gist: summary.value?.items || [],
            };
            // 로컬 스토리지 업데이트
            localStorage.setItem(
                "genieq-passage-data",
                JSON.stringify(updatedData)
            );
            isContentChanged.value = false; // 변경 내용이 없는 상태 (저장하기 비활성화)
            hasManualSave.value = true; // 나머지 버튼 활성화

            // 저장 성공 모달 표시
            openSaveSuccessModal();
        })
        .catch((error) => {
            // console.error('지문 업데이트 중 오류:', error);
            alert("지문 저장 중 오류가 발생했습니다: " + error.message);
        })
        .finally(() => {
            isLoading.value = false;
            isProcessing.value = false;
        });
};

// 이어서 문항 생성하기 버튼 클릭 시 데이터 저장
const handleConnectCreate = (event, navigate) => {
    // 내용 길이 확인 (500자 검증)
    if (!validatePassageLength()) {
        isConfirmModalOpen.value = true;
        event.preventDefault();
        return; // 함수 종료
    }
    // 변경사항 확인
    if (hasUnsavedChanges()) {
        // 대기 중인 네비게이션 설정
        isWarningModalOpen.value = true;
        pendingRoute.value = "/questions";
        event.preventDefault();
        return;
    }

    // 모든 검증을 통과한 경우 데이터 준비 및 이동
    prepareDataForQuestions();
    navigatingToQuestions.value = true;
    navigate(event);
};

// 문항 생성 페이지로 데이터 전달 준비
const prepareDataForQuestions = () => {
    // 지문 데이터 준비
    const passageForQuestion = {
        title: title.value,
        content: content.value,
        type: type.value,
        keyword: keyword.value,
        gist: gist.value,
        pasCode: pasCode.value,
    };

    // 로컬 스토리지에 저장
    localStorage.setItem(
        "passageForQuestion",
        JSON.stringify(passageForQuestion)
    );

    // 문항 생성 페이지로 이동
    router.push("/questions");
};
// 파일 모달 열기 함수
const openFileModal = (code) => {
    pasCode.value = code;
    isFileModalOpen.value = true;
};
// 내용 길이 확인 후 파일 모달 열기
const checkContentLengthAndOpenFileModal = () => {
    if (checkContentLength(new Event("click"))) {
        const data = loadPassageData();
        openFileModal(data.pasCode);
    }
};
// 모달 닫기
const closeFileModal = () => {
    isFileModalOpen.value = false;
};
// 확인 모달 닫기
const closeConfirmModal = () => {
    isConfirmModalOpen.value = false;
};
// 파일 형식 선택 처리
const handleFileSelect = async (fileType) => {
    // 로딩 상태 활성화
    isLoading.value = true;
    loadingMessage.value = "파일 추출 중입니다...";
    try {
        // 컴포넌트에서 데이터 수집
        const exportData = {
            pasCode: pasCode.value,
            fileType: fileType,
        };
        // console.log('파일 추출 요청:', exportData);
        if (!pasCode.value) {
            throw new Error("지문 코드가 없습니다. 파일을 추출할 수 없습니다.");
        }
        const apiUrl = import.meta.env.VITE_API_URL;
        // 백엔드 API 호출 - 파일 추출
        const response = await fetch(
            `/api/pass/export/each/${pasCode.value}?type=${fileType}`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: getContentType(fileType),
                },
            }
        );
        if (!response.ok) {
            if (response.status === 401) {
                // 인증 오류 처리
                authStore.user = null;
                authStore.isAuthenticated = false;
                localStorage.removeItem("authUser");
                router.push({
                    path: "/login",
                    query: { redirect: route.fullPath },
                });
                throw new Error("인증이 필요합니다");
            }
            throw new Error("파일 추출 API 호출 실패: " + response.status);
        }
        // 파일 다운로드 처리
        const blob = await response.blob();
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${title.value || "passage"}.${getFileExtension(
            fileType
        )}`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        // console.log('파일 추출 완료');
    } catch (error) {
        // console.error('파일 추출 중 오류:', error);
        alert("파일 추출 중 오류가 발생했습니다: " + error.message);
    } finally {
        isLoading.value = false;
    }
};
// 파일 형식에 따른 Content-Type 반환
const getContentType = (fileType) => {
    switch (fileType.toLowerCase()) {
        case "pdf":
            return "application/pdf";
        case "word":
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        case "txt":
        default:
            return "text/plain";
    }
};
// 파일 형식에 따른 확장자 반환
const getFileExtension = (fileType) => {
    switch (fileType.toLowerCase()) {
        case "pdf":
            return "pdf";
        case "word":
            return "docx";
        case "txt":
        default:
            return "txt";
    }
};
// 저장되지 않은 변경사항이 있는지 확인하는 함수
const hasUnsavedChanges = () => {
    return isContentChanged.value;
};
// 이동 취소 - 현재 화면 유지
const cancelNavigation = () => {
    // console.log('네비게이션 취소됨');
    isWarningModalOpen.value = false;
    pendingRoute.value = null;
};
// 이동 확인 - 타겟 페이지로 이동
const confirmNavigation = () => {
    // console.log('네비게이션 승인됨, 이동 실행');
    isWarningModalOpen.value = false;
    // 변경 사항이 있었지만, 사용자가 이동을 확인했으므로 관련 상태 초기화
    isContentChanged.value = false;
    hasManualSave.value = true; // 사용자가 명시적으로 저장하지 않기로 함
    // 문항 생성 페이지로의 이동인 경우, 데이터 준비
    if (pendingRoute.value === "/questions") {
        prepareDataForQuestions();
        navigatingToQuestions.value = true;
    }
    // 네비게이션 수행
    if (pendingRoute.value) {
        const targetPath = pendingRoute.value;
        pendingRoute.value = null;
        router.push(targetPath);
    }
};
// 페이지 이탈 시, 경고 (브라우저 새로고침, 닫기 등)
const handleBeforeUnload = (e) => {
    if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "";
        return "";
    }
};
// Vue 인스턴스 참조
const instance = getCurrentInstance();
let routerGuard = null;
// 로컬 스토리지에서 지문 데이터 로드
const loadPassageData = () => {
    try {
        const storedData = localStorage.getItem("genieq-passage-data");
        if (storedData) {
            const passageData = JSON.parse(storedData);
            console.log("지문 데이터 로드:", passageData);

            // 기본 데이터 설정
            title.value = passageData.title || "";
            content.value = passageData.content || "";
            pasCode.value = passageData.pasCode;
            type.value = passageData.type || passageData.PAS_TYPE || "";
            keyword.value =
                passageData.keyword || passageData.PAS_KEYWORD || "";

            // 핵심 논점 설정
            if (passageData.gist) {
                if (Array.isArray(passageData.gist)) {
                    gist.value = passageData.gist;
                } else if (typeof passageData.gist === "string") {
                    gist.value = passageData.gist;
                }
            } else if (passageData.PAS_GIST) {
                if (Array.isArray(passageData.PAS_GIST)) {
                    gist.value = passageData.PAS_GIST;
                } else if (typeof passageData.PAS_GIST === "string") {
                    gist.value = passageData.PAS_GIST;
                }
            }

            console.log("설정된 핵심 논점:", gist.value);
            return passageData;
        }
        return null;
    } catch (error) {
        console.error("Failed to load passage data:", error);
        return null;
    }
};
// 컴포넌트 마운트 시 실행
onMounted(async () => {
    // 이전 경로 확인 로직 추가
    const fromPath = route.query.from || "";
    isFromRoute.value =
        localStorage.getItem("pathFromGenerate", "true") !== "true";

    // 데이터 로드
    const loadedData = loadPassageData();
    // 데이터가 있으면 컴포넌트에 적용
    if (loadedData) {
        // console.log('[17-1] 로드된 데이터를 컴포넌트에 적용 시작');
        // 본문과 제목 설정 - nextTick 사용
        nextTick(() => {
            if (passageContentRef.value) {
                // 명시적으로 setContent와 setTitle 호출, 순서 변경
                if (title.value) {
                    passageContentRef.value.setTitle(title.value);
                    // console.log('[17-2] 명시적으로 제목 설정:', title.value);
                }
                if (content.value) {
                    passageContentRef.value.setContent(content.value);
                    // console.log('[17-3] 본문 설정 완료, 길이:', content.value.length);
                }
            }

            // 핵심 논점 설정 - PassageSummary 컴포넌트에 데이터 전달
            if (
                passageSummaryRef.value &&
                typeof passageSummaryRef.value.setSummary === "function"
            ) {
                // (수정) 명시적으로 summary 데이터 구조 정의
                const summaryData = {
                    subject: type.value,
                    keyword: keyword.value,
                    gist: summary.value.items || [],
                };
                // console.log('[17-4] 핵심 논점 설정 준비:', summaryData);
                passageSummaryRef.value.setSummary(summaryData);
                // console.log('[17-5] 핵심 논점 설정 완료', summaryData);
            }

            const isJustCreated =
                localStorage.getItem("pathFromGenerate") === "true";

            if (isJustCreated) {
                // 생성 직후 - 저장하기만 활성화
                isContentChanged.value = true;
                hasManualSave.value = false;
            } else {
                // 이미 저장된 콘텐츠가 있는 경우 - 모든 버튼 활성화
                isContentChanged.value = false;
                hasManualSave.value = true;
            }
        });
    } else {
        // (수정) 데이터가 없는 경우 이전 페이지로 리다이렉트
        // console.log('[17-6] 로드된 데이터 없음, 이전 페이지로 리다이렉트');
        alert("지문 데이터를 찾을 수 없습니다. 지문 생성 페이지로 이동합니다.");
        router.push("/passage");
        return; // 불필요한 코드 실행 방지
    }
    // 브라우저 새로고침, 닫기 등에 대한 이벤트 리스너 추가
    window.addEventListener("beforeunload", handleBeforeUnload);
    // 전역 네비게이션 가드 설정
    routerGuard = router.beforeEach((to, from, next) => {
        // console.log('[23] 라우터 가드 호출됨', { from: from.path, to: to.path, current: route.path });
        // 현재 라우트에서 다른 라우트로 이동하는 경우에만 확인
        if (from.path === route.path) {
            if (to.path === "/questions") {
                navigatingToQuestions.value = true; // 이어서 문항 생성하기 페이지로 이동하는 경우 플래그 설정
            }
            // console.log('[24] 저장되지 않은 변경사항 감지됨, 네비게이션 중단 및 모달 표시');
            // 저장되지 않은 변경사항이 있다면 모달 표시하고 대기
            if (hasUnsavedChanges()) {
                isWarningModalOpen.value = true;
                pendingRoute.value = to.fullPath; // 이동하려는 전체 경로 저장
                return false; // 네비게이션 중단
            }
        }
        // console.log('[25] 네비게이션 계속 진행');
        return next(); // 네비게이션 계속
    });
    // 현재 상태 로그
    // console.log('[26] 현재 상태 값:', {
    //     title: title.value,
    //     contentLength: content.value?.length || 0,
    //     pasCode: pasCode.value,
    //     type: type.value,
    //     keyword: keyword.value,
    //     isContentChanged: isContentChanged.value,
    //     hasManualSave: hasManualSave.value
    // });
});
onBeforeUnmount(() => {
    // 컴포넌트 해제 시 이벤트 리스너 제거
    window.removeEventListener("beforeunload", handleBeforeUnload);
    localStorage.removeItem("pathFromGenerate");
    // 질문 페이지로 이동하는 경우에만 데이터 유지, 그 외에는 삭제
    if (!navigatingToQuestions.value) {
        localStorage.removeItem("genieq-passage-data");
    } else {
    }
    // 라우터 가드 제거
    if (routerGuard) {
        routerGuard();
    }
    // console.log('PassageContent 컴포넌트 언마운트');
});
// 데이터가 변경될 때마다 호출될 콜백 함수
// 이 함수를 자식 컴포넌트에서 호출하도록 구현하여 내용 변경 감지
const handleContentChange = (data) => {
    // (수정) data가 null이 아닌 경우에만 처리
    if (data) {
        // (수정) 명시적으로 제목과 내용 설정
        if (data.title !== undefined) {
            title.value = data.title;
        }
        if (data.content !== undefined) {
            content.value = data.content;
        }
        // (수정) summary 데이터 명확히 설정
        if (data.summary !== undefined) {
            summary.value = data.summary;
        }

        // 내용이 변경되면 저장 플래그 초기화 (추출하기 버튼 비활성화)
        hasManualSave.value = false;
        isContentChanged.value = true;
    }
};
</script>
