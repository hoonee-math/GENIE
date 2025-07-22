<template>
    <header
        class="sticky top-0 z-999 bg-white/90 backdrop-blur-md justify-center shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-4 py-3.5 flex items-center"
    >
        <div class="flex items-center gap-2">
            <div class="flex justify-center items-center w-full">
                <router-link
                    to="/passage"
                    class="text-base text-center font-bold bg-[#222] bg-clip-text text-transparent"
                    >지문생성</router-link
                >
            </div>
        </div>
    </header>

    <div class="flex items-center justify-end p-4 border-b border-gray-200">
        <div class="flex items-center gap-2">
            <button
                @click="handleSaveButtonClick"
                class="px-3 py-1.5 text-xs rounded-lg transition-all duration-200 bg-[#e6f3ff] text-[#0066cc] hover:bg-[#cce7ff] hover:shadow-lg hover:-translate-y-0.3 shadow-sm"
            >
                저장하기
            </button>
            <button
                @click="checkContentLengthAndOpenFileModal"
                :disabled="isContentChanged || !hasManualSave"
                class="px-3 py-1.5 text-xs rounded-lg transition-all duration-200 bg-[#f0f9ff] text-[#0284c7] hover:bg-[#e0f2fe] hover:shadow-lg hover:-translate-y-0.3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#f0f9ff] disabled:hover:text-[#0284c7] disabled:hover:shadow-sm disabled:hover:transform-none"
            >
                추출하기
            </button>
            <router-link to="/questions" custom v-slot="{ navigate }">
                <button
                    @click="handleConnectCreate($event, navigate)"
                    :disabled="isContentChanged"
                    class="px-3 py-1.5 text-xs rounded-lg transition-all duration-200 bg-[#f0fdf4] text-[#16a34a] hover:bg-[#dcfce7] hover:shadow-lg hover:-translate-y-0.3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#f0fdf4] disabled:hover:text-[#16a34a] disabled:hover:shadow-sm disabled:hover:transform-none"
                >
                    문항 생성
                </button>
            </router-link>
        </div>
    </div>

    <div class="flex flex-col gap-6 w-fullpx-4 p-4">
        <div class="flex items-center justify-between">
            <h1 class="text-xl font-semibold text-gray-900">지문 생성</h1>
            <button
                @click="toggleSummary"
                class="px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm border hover:shadow-lg hover:-translate-y-0.3"
                :class="{
                    'bg-[#e6f3ff] text-[#0066cc] border-[#0066cc] hover:bg-[#cce7ff]':
                        isSummaryOpen,
                    'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100':
                        !isSummaryOpen,
                }"
            >
                <span>요약 보기</span>
            </button>
        </div>

        <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700"
                    >작업 이름</label
                >
                <input
                    type="text"
                    v-model="title"
                    @input="handleTitleChange"
                    class="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] hover:shadow-lg hover:-translate-y-0.3 hover:border-[var(--primary)] transition-all duration-300 ease-out text-[15px]"
                    placeholder="작업 이름을 입력해주세요."
                />
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700"
                    >생성 결과</label
                >
                <textarea
                    v-model="content"
                    @input="handleContentChange"
                    class="w-full h-[400px] p-4 bg-white border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] hover:shadow-lg hover:-translate-y-0.3 hover:border-[var(--primary)] transition-all duration-300 ease-out text-[15px] leading-relaxed"
                    placeholder="지문을 입력해주세요."
                ></textarea>
            </div>
        </div>

        <!-- 슬라이드업 요약 패널 -->
        <div
            v-show="isSummaryOpen"
            class="fixed inset-0 z-40 transition-opacity duration-300"
            :class="{
                'opacity-100': isSummaryOpen,
                'opacity-0': !isSummaryOpen,
            }"
            @click="toggleSummary"
        >
            <div
                class="absolute bottom-0 left-0 right-0 bg-white transform transition-all duration-300 ease-out h-[60vh] rounded-t-2xl shadow-lg border-t border-gray-200"
                :class="{
                    'translate-y-0': isSummaryOpen,
                    'translate-y-full': !isSummaryOpen,
                }"
                @click.stop
            >
                <!-- 드래그 핸들 -->
                <div
                    class="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1"
                ></div>

                <!-- 요약 내용 -->
                <div class="p-6 h-[calc(60vh-2rem)] overflow-y-auto">
                    <div class="flex flex-col gap-6">
                        <!-- 지문 유형 섹션 -->
                        <div class="flex flex-col gap-4">
                            <h3
                                class="text-sm font-medium text-[#0066cc] px-3 py-1.5 bg-[#e6f3ff] rounded-lg inline-block w-fit shadow-sm"
                            >
                                지문 유형
                            </h3>
                            <div class="p-6 bg-white rounded-xl">
                                <div class="flex flex-col gap-5">
                                    <div class="flex items-center gap-4 w-full">
                                        <span
                                            class="font-medium text-gray-600 text-sm min-w-[80px] shrink-0"
                                            >지문 분야</span
                                        >
                                        <div class="flex-1 min-w-0">
                                            <span
                                                class="text-gray-900 break-words whitespace-pre-wrap block w-full"
                                                >{{ subject }}</span
                                            >
                                        </div>
                                    </div>
                                    <div class="flex items-start gap-4 w-full">
                                        <span
                                            class="font-medium text-gray-600 text-sm min-w-[80px] shrink-0"
                                            >지문 제재</span
                                        >
                                        <div class="flex-1 min-w-0">
                                            <span
                                                class="text-gray-900 break-words whitespace-pre-wrap block w-full"
                                                >{{ keyword }}</span
                                            >
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 핵심 논점 섹션 -->
                        <div class="flex flex-col gap-4">
                            <h3
                                class="text-sm font-medium text-[#0066cc] px-3 py-1.5 bg-[#e6f3ff] rounded-lg inline-block w-fit shadow-sm"
                            >
                                핵심 논점
                            </h3>
                            <div class="p-6 bg-white rounded-xl min-h-[200px]">
                                <div
                                    class="text-gray-900 leading-relaxed whitespace-pre-line text-[15px]"
                                >
                                    {{ gistText }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
    <ConfirmModalComponent
        :isOpen="isSaveSuccessModalOpen"
        title="확인"
        :message="saveSuccessMessage"
        @close="closeSaveSuccessModal"
        @confirm="closeSaveSuccessModal"
    />
    <LoadingModal :isOpen="isLoading" :message="loadingMessage" />
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import FileSelectModal from "@/components/common/FileSelectModal.vue";
import ConfirmModalComponent from "@/components/common/ConfirmModalComponent.vue";
import WarningModalComponent from "@/components/common/WarningModalComponent.vue";
import LoadingModal from "@/components/common/LoadingModal.vue";

const props = defineProps({
    initialTitle: {
        type: String,
        default: "",
    },
    initialContent: {
        type: String,
        default: "",
    },
});

const title = ref(props.initialTitle);
const content = ref(props.initialContent);
const isSummaryOpen = ref(false);
const subject = ref("");
const keyword = ref("");
const gist = ref("");
const isContentChanged = ref(false);
const hasManualSave = ref(true);

const emit = defineEmits([
    "content-changed",
    "save",
    "download",
    "connect-create",
]);

const loadPassageData = () => {
    try {
        const storedData = localStorage.getItem("genieq-passage-data");
        if (storedData) {
            const passageData = JSON.parse(storedData);
            pasCode.value = passageData.pasCode;
            type.value = passageData.type || passageData.PAS_TYPE || "";
            keyword.value =
                passageData.keyword || passageData.PAS_KEYWORD || "";
            if (passageData.gist || passageData.PAS_GIST) {
                gist.value = passageData.gist || passageData.PAS_GIST || "";
            }
            return passageData;
        }
        return null;
    } catch (error) {
        console.error("Failed to load passage data:", error);
        return null;
    }
};

const loadSummaryData = () => {
    try {
        const storedData = localStorage.getItem("genieq-passage-data");
        if (storedData) {
            const passageData = JSON.parse(storedData);
            console.log("요약 데이터 로드:", passageData);

            // 기본 데이터 설정
            title.value = passageData.title || "";
            content.value = passageData.content || "";
            subject.value =
                passageData.subject ||
                passageData.PAS_SUBJECT ||
                passageData.type ||
                passageData.PAS_TYPE ||
                "";
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
        }
    } catch (error) {
        console.error("Failed to load summary data:", error);
    }
};

const gistText = computed(() => {
    if (!gist.value) {
        try {
            const storedData = localStorage.getItem("genieq-passage-data");
            if (storedData) {
                const passageData = JSON.parse(storedData);
                if (passageData.gist) {
                    if (Array.isArray(passageData.gist)) {
                        gist.value = passageData.gist;
                        return passageData.gist.join("\n");
                    } else if (typeof passageData.gist === "string") {
                        gist.value = passageData.gist;
                        return passageData.gist;
                    }
                } else if (passageData.PAS_GIST) {
                    if (Array.isArray(passageData.PAS_GIST)) {
                        gist.value = passageData.PAS_GIST;
                        return passageData.PAS_GIST.join("\n");
                    } else if (typeof passageData.PAS_GIST === "string") {
                        gist.value = passageData.PAS_GIST;
                        return passageData.PAS_GIST;
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load gist:", error);
        }
        return "핵심 논점이 없습니다.";
    }

    if (Array.isArray(gist.value)) {
        return gist.value.join("\n");
    }
    return String(gist.value);
});

const toggleSummary = () => {
    isSummaryOpen.value = !isSummaryOpen.value;
    document.body.style.overflow = isSummaryOpen.value ? "hidden" : "";
    if (isSummaryOpen.value) {
        loadSummaryData();
    }
};

const handleTitleChange = (event) => {
    title.value = event.target.value;
    emitContentChange();
};

const handleContentChange = () => {
    emitContentChange();
};

const emitContentChange = () => {
    emit("content-changed", {
        title: title.value,
        content: content.value,
    });
};

const validateContent = () => {
    return content.value.length >= 500;
};

const setContent = (newContent) => {
    content.value = newContent;
    emitContentChange();
};

const setTitle = (newTitle) => {
    title.value = newTitle;
    emitContentChange();
};

const handleSaveButtonClick = () => {
    if (isProcessing.value) {
        return;
    }
    isProcessing.value = true;
    isLoading.value = true;
    loadingMessage.value = "저장 중입니다...";

    const saveData = {
        pasCode: pasCode.value,
        title: title.value,
        content: content.value,
    };

    if (!pasCode.value) {
        alert("지문 코드가 없습니다. 저장할 수 없습니다.");
        isLoading.value = false;
        return;
    }

    fetch(`/api/pass/update/each`, {
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
                        query: { redirect: route.fullPath },
                    });
                    throw new Error("인증이 필요합니다");
                }
                throw new Error("업데이트 API 호출 실패: " + response.status);
            }
            return response.json();
        })
        .then((responseData) => {
            const updatedData = {
                pasCode: pasCode.value,
                title: title.value,
                content: content.value,
                type: type.value,
                keyword: keyword.value,
                gist: summary.value?.items || [],
            };
            localStorage.setItem(
                "genieq-passage-data",
                JSON.stringify(updatedData)
            );
            isContentChanged.value = false;
            hasManualSave.value = true;
            openSaveSuccessModal();
        })
        .catch((error) => {
            alert("지문 저장 중 오류가 발생했습니다: " + error.message);
        })
        .finally(() => {
            isLoading.value = false;
            isProcessing.value = false;
        });
};

const checkContentLengthAndOpenFileModal = () => {
    if (validateContent()) {
        const data = loadPassageData();
        openFileModal(data.pasCode);
    }
};

const handleConnectCreate = (event, navigate) => {
    if (!validateContent()) {
        isConfirmModalOpen.value = true;
        event.preventDefault();
        return;
    }

    if (hasUnsavedChanges()) {
        isWarningModalOpen.value = true;
        pendingRoute.value = "/questions";
        event.preventDefault();
        return;
    }

    prepareDataForQuestions();
    navigatingToQuestions.value = true;
    navigate(event);
};

// 추가 필요한 상태 변수들
const isProcessing = ref(false);
const isLoading = ref(false);
const loadingMessage = ref("");
const isConfirmModalOpen = ref(false);
const isWarningModalOpen = ref(false);
const pendingRoute = ref(null);
const navigatingToQuestions = ref(false);
const pasCode = ref(null);
const type = ref("");
const summary = ref({});
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// 추가 필요한 함수들
const hasUnsavedChanges = () => {
    return isContentChanged.value;
};

const prepareDataForQuestions = () => {
    const passageForQuestion = {
        title: title.value,
        content: content.value,
        type: type.value,
        keyword: keyword.value,
        gist: summary.value?.items || [],
        pasCode: pasCode.value,
    };
};

const openFileModal = (code) => {
    pasCode.value = code;
    isFileModalOpen.value = true;
};

const openSaveSuccessModal = () => {
    isSaveSuccessModalOpen.value = true;
};

// props가 변경될 때 title과 content 업데이트
watch(
    () => props.initialTitle,
    (newTitle) => {
        title.value = newTitle;
    }
);

watch(
    () => props.initialContent,
    (newContent) => {
        content.value = newContent;
    }
);

// 컴포넌트 마운트 시 데이터 로드 수정
onMounted(() => {
    try {
        const storedData = localStorage.getItem("genieq-passage-data");
        if (storedData) {
            const passageData = JSON.parse(storedData);
            console.log("마운트 시 데이터 로드:", passageData);

            // 기본 데이터 설정
            if (passageData.title) {
                setTitle(passageData.title);
            }
            if (passageData.content) {
                setContent(passageData.content);
            }

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

            // 기타 데이터 설정
            if (passageData.subject || passageData.PAS_SUBJECT) {
                subject.value =
                    passageData.subject || passageData.PAS_SUBJECT || "";
            }
            if (passageData.keyword || passageData.PAS_KEYWORD) {
                keyword.value =
                    passageData.keyword || passageData.PAS_KEYWORD || "";
            }
            if (passageData.pasCode) {
                pasCode.value = passageData.pasCode;
            }

            console.log("설정된 핵심 논점:", gist.value);
        }
    } catch (error) {
        console.error("Failed to load data on mount:", error);
    }
});

// 추가 필요한 상태 변수들
const isFileModalOpen = ref(false);
const isSaveSuccessModalOpen = ref(false);
const saveSuccessMessage = ref("지문이 저장되었습니다.");

// 모달 관련 함수들
const closeFileModal = () => {
    isFileModalOpen.value = false;
};

const closeConfirmModal = () => {
    isConfirmModalOpen.value = false;
};

const closeSaveSuccessModal = () => {
    isSaveSuccessModalOpen.value = false;
};

const cancelNavigation = () => {
    isWarningModalOpen.value = false;
    pendingRoute.value = null;
};

const confirmNavigation = () => {
    isWarningModalOpen.value = false;
    isContentChanged.value = false;
    hasManualSave.value = true;
    if (pendingRoute.value === "/questions") {
        prepareDataForQuestions();
        navigatingToQuestions.value = true;
    }
    if (pendingRoute.value) {
        const targetPath = pendingRoute.value;
        pendingRoute.value = null;
        router.push(targetPath);
    }
};

const handleFileSelect = async (fileType) => {
    isLoading.value = true;
    loadingMessage.value = "파일 추출 중입니다...";
    try {
        if (!pasCode.value) {
            throw new Error("지문 코드가 없습니다. 파일을 추출할 수 없습니다.");
        }
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
        const blob = await response.blob();
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${title.value || "passage"}.${getFileExtension(
            fileType
        )}`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    } catch (error) {
        alert("파일 추출 중 오류가 발생했습니다: " + error.message);
    } finally {
        isLoading.value = false;
    }
};

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

defineExpose({
    validateContent,
    setContent,
    setTitle,
});
</script>

<style scoped>
/* 스크롤바 스타일링 */
.h-\[calc\(60vh-2rem\)\]::-webkit-scrollbar {
    width: 4px;
}

.h-\[calc\(60vh-2rem\)\]::-webkit-scrollbar-track {
    background: transparent;
}

.h-\[calc\(60vh-2rem\)\]::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 2px;
}

.h-\[calc\(60vh-2rem\)\]::-webkit-scrollbar-thumb:hover {
    background: #d1d5db;
}
</style>
