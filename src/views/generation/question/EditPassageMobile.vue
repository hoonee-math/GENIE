<template>
    <div class="w-full">
        <!-- 탭 버튼 -->
        <div class="flex justify-center mt-4">
            <div class="flex gap-1 p-1 bg-gray-100 rounded-full w-fit">
                <button
                    @click="activeTab = 'passage'"
                    class="hover:bg-gray-100 hover:shadow-sm px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                    :class="{
                        'bg-white text-[#0066cc] shadow-sm':
                            activeTab === 'passage',
                        'text-gray-600': activeTab !== 'passage',
                    }"
                >
                    지문
                </button>
                <button
                    @click="activeTab = 'question'"
                    class="hover:bg-gray-100 hover:shadow-sm px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                    :class="{
                        'bg-white text-[#0066cc] shadow-sm':
                            activeTab === 'question',
                        'text-gray-600': activeTab !== 'question',
                    }"
                >
                    문항
                </button>
            </div>
        </div>
        <div class="flex flex-col gap-4">
            <!-- 버튼 그룹 -->
            <div class="flex items-center justify-between">
                <h1 class="text-xl font-semibold text-gray-900">문항 생성</h1>
                <button
                    v-if="activeTab === 'passage'"
                    @click="toggleSummary"
                    class="hover:bg-gray-100 hover:shadow-sm px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm border"
                    :class="{
                        'bg-[#e6f3ff] text-[#0066cc] border-[#0066cc]':
                            isSummaryOpen,
                        'bg-gray-50 text-gray-600 border-gray-200':
                            !isSummaryOpen,
                    }"
                >
                    <span>요약 보기</span>
                </button>
                <button
                    v-else
                    @click="toggleExplanation"
                    class="hover:bg-gray-100 hover:shadow-sm px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm border"
                    :class="{
                        'bg-[#e6f3ff] text-[#0066cc] border-[#0066cc]':
                            isExplanationOpen,
                        'bg-gray-50 text-gray-600 border-gray-200':
                            !isExplanationOpen,
                    }"
                >
                    <span>문제 해설</span>
                </button>
            </div>

            <!-- 지문 탭 내용 -->
            <div v-if="activeTab === 'passage'" class="flex flex-col gap-4">
                <!-- 제목 입력 -->
                <div class="w-full">
                    <label class="text-sm font-medium text-gray-700"
                        >작업 이름</label
                    >
                    <input
                        type="text"
                        v-model="title"
                        @input="handleTitleChange"
                        placeholder="지문 제목을 입력해주세요"
                        class="hover:border-[#0086ff] hover:shadow-md w-full h-[46px] px-4 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0086ff] transition-all duration-200"
                    />
                </div>

                <!-- 내용 입력 -->
                <div class="w-full">
                    <div class="flex flex-col items-start gap-2">
                        <p class="text-sm font-medium text-gray-700">
                            편집도구
                        </p>
                        <div
                            class="relative box-border min-h-[53px] bg-white border border-[#E5E7EB] rounded-lg w-full flex flex-row gap-4 items-center px-4"
                        >
                            <div
                                class="flex flex-row items-center gap-3 sm:gap-4 w-full"
                            >
                                <p
                                    class="font-pretendard font-normal text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black whitespace-nowrap"
                                >
                                    단어·문장 기호
                                </p>
                                <div
                                    class="flex flex-row items-center gap-2 sm:gap-3 overflow-x-auto w-full sm:w-auto"
                                >
                                    <ul
                                        class="flex flex-row items-center gap-2 sm:gap-3 list-none"
                                    >
                                        <li
                                            @click="showSymbolTooltip('㉠')"
                                            class="font-pretendard text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-[#0086ff]"
                                        >
                                            ㉠
                                        </li>
                                        <li
                                            @click="showSymbolTooltip('ⓐ')"
                                            class="font-pretendard text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-[#0086ff]"
                                        >
                                            ⓐ
                                        </li>
                                        <li
                                            @click="showSymbolTooltip('㉮')"
                                            class="font-pretendard text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-[#0086ff]"
                                        >
                                            ㉮
                                        </li>
                                        <li
                                            @click="showSymbolTooltip('①')"
                                            class="font-pretendard text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-[#0086ff]"
                                        >
                                            ①
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div
                                class="flex flex-row items-center gap-3 sm:gap-4 w-full"
                            >
                                <p
                                    class="font-pretendard font-normal text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black whitespace-nowrap"
                                >
                                    에디터
                                </p>
                                <div
                                    class="flex flex-row items-center gap-2 sm:gap-3"
                                >
                                    <ul
                                        class="flex flex-row items-center gap-2 sm:gap-3 list-none"
                                    >
                                        <li
                                            @click="
                                                handleButtonClick(
                                                    $event,
                                                    'bold'
                                                )
                                            "
                                            class="font-pretendard text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-[#0086ff]"
                                        >
                                            <b>B</b>
                                        </li>
                                        <li
                                            @click="
                                                handleButtonClick(
                                                    $event,
                                                    'underline'
                                                )
                                            "
                                            class="font-pretendard text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-[#0086ff]"
                                        >
                                            <u>U</u>
                                        </li>
                                        <li
                                            @click="
                                                handleButtonClick(
                                                    $event,
                                                    'strikethrough'
                                                )
                                            "
                                            class="font-pretendard text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-[#0086ff]"
                                        >
                                            <s>S</s>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <SymbolTooltip
                                :message="symbolList.join('')"
                                :symbolType="currentSymbolType"
                                class="absolute top-[48px] left-[106px]"
                                v-if="showTooltip"
                                @symbol-click="insertSymbol"
                            />
                        </div>
                    </div>
                    <label class="text-sm font-medium text-gray-700"
                        >생성 결과</label
                    >
                    <textarea
                        v-model="content"
                        @input="handleContentChange"
                        placeholder="지문 내용을 입력해주세요"
                        class="hover:border-[#0086ff] hover:shadow-md w-full h-[300px] p-4 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0086ff] transition-all duration-200 resize-none"
                    ></textarea>
                </div>
            </div>

            <!-- 문항 탭 내용 -->
            <div v-if="activeTab === 'question'" class="flex flex-col gap-4">
                <div class="flex-1 overflow-hidden">
                    <div
                        class="flex flex-row flex-nowrap w-auto transition-transform duration-300"
                        :style="{
                            transform: `translateX(-${currentSlide * 100}%)`,
                        }"
                    >
                        <div
                            v-for="(item, index) in questionsData"
                            :key="index"
                            class="flex-none min-w-full w-full h-full"
                        >
                            <EditQuestion
                                ref="editQuestionRefs"
                                :questions="item.queOption"
                                :questionTitle="item.queQuery"
                                :isEditing="isEditingGlobal"
                                :isFromRoute="isFromRoute"
                                @edit-mode-changed="updateEditingMode"
                                @question-changed="
                                    handleQuestionChange($event, index)
                                "
                                @request-edit-mode="openEditWarningModal"
                                @recreate-question="
                                    handleRecreateButtonClick(index)
                                "
                            />
                        </div>
                    </div>
                </div>

                <!-- 페이지네이션 -->
                <div
                    class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200"
                >
                    <div
                        class="flex flex-row items-center justify-between p-4 pb-20"
                    >
                        <!-- 왼쪽 화살표 -->
                        <button
                            class="hover:bg-gray-100 hover:shadow-sm bg-transparent border-none cursor-pointer flex justify-center items-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            :disabled="currentSlide === 0"
                            @click="prevSlide"
                        >
                            <Icon
                                icon="ep:arrow-left-bold"
                                width="18px"
                                height="18px"
                                class="text-[#303030]"
                            />
                        </button>

                        <!-- 중앙 영역 -->
                        <div
                            class="flex flex-col items-center flex-1 mx-4 pt-2"
                        >
                            <!-- 스크롤바 -->
                            <div
                                class="relative w-full h-1 bg-[#e6f3ff] rounded-full"
                            >
                                <div
                                    class="h-full bg-[#91c4f1] rounded-full transition-all duration-200"
                                    :style="{
                                        width: `${
                                            ((currentSlide + 1) /
                                                questionsData.length) *
                                            100
                                        }%`,
                                    }"
                                ></div>
                                <!-- 동그라미 -->
                                <div
                                    class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#91c4f1] rounded-full cursor-pointer shadow-[0_2px_4px_rgba(145,196,241,0.3)]"
                                    :style="{
                                        left: `${
                                            ((currentSlide + 1) /
                                                questionsData.length) *
                                            100
                                        }%`,
                                        transform: 'translate(-50%, -50%)',
                                    }"
                                    @touchstart="handleDragStart"
                                    @touchmove="handleDragMove"
                                    @touchend="handleDragEnd"
                                ></div>
                            </div>

                            <!-- 문제 정보 -->
                            <div
                                class="flex items-center justify-center gap-2 text-sm mt-1"
                            >
                                <span class="text-[#0086ff] font-medium">{{
                                    currentSlide + 1
                                }}</span>
                                <span class="text-gray-400">/</span>
                                <span class="text-gray-600"
                                    >{{ questionsData.length }} 문제</span
                                >
                            </div>
                        </div>

                        <!-- 오른쪽 화살표 -->
                        <button
                            class="hover:bg-gray-100 hover:shadow-sm bg-transparent border-none cursor-pointer flex justify-center items-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            :disabled="
                                currentSlide === questionsData.length - 1
                            "
                            @click="nextSlide"
                        >
                            <Icon
                                icon="ep:arrow-right-bold"
                                width="18px"
                                height="18px"
                                class="text-[#303030]"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 슬라이드업 요약 패널 -->
    <div
        v-show="isSummaryOpen && activeTab === 'passage'"
        class="fixed inset-0 z-40 transition-opacity duration-300"
        :class="{ 'opacity-100': isSummaryOpen, 'opacity-0': !isSummaryOpen }"
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
                                <div class="flex flex-row gap-2 w-full">
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
                                <div class="flex flex-row gap-2 w-full">
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

    <!-- 슬라이드업 문제 해설 패널 -->
    <div
        v-show="isExplanationOpen && activeTab === 'question'"
        class="fixed inset-0 z-40 transition-opacity duration-300"
        :class="{
            'opacity-100': isExplanationOpen,
            'opacity-0': !isExplanationOpen,
        }"
        @click="toggleExplanation"
    >
        <div
            class="absolute bottom-0 left-0 right-0 bg-white transform transition-all duration-300 ease-out h-[60vh] rounded-t-2xl shadow-lg border-t border-gray-200"
            :class="{
                'translate-y-0': isExplanationOpen,
                'translate-y-full': !isExplanationOpen,
            }"
            @click.stop
        >
            <!-- 드래그 핸들 -->
            <div
                class="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1"
            ></div>

            <!-- 문제 해설 내용 -->
            <div class="p-6 h-[calc(60vh-2rem)] overflow-y-auto">
                <div
                    class="flex flex-col gap-6"
                    v-for="(item, index) in questionsData"
                    :key="index"
                >
                    <!-- 정답 섹션 -->
                    <div class="flex flex-col">
                        <h3
                            class="text-sm font-medium text-[#0066cc] px-3 py-1.5 bg-[#e6f3ff] rounded-lg inline-block w-fit shadow-sm mb-2"
                        >
                            정답
                        </h3>
                        <div class="p-2 bg-white rounded-xl">
                            <div
                                class="text-gray-900 leading-relaxed whitespace-pre-line text-[15px]"
                            >
                                {{ item.queAnswer }}
                            </div>
                        </div>
                    </div>

                    <!-- 해설 섹션 -->
                    <div class="flex flex-col">
                        <h3
                            class="text-sm font-medium text-[#0066cc] px-3 py-1.5 bg-[#e6f3ff] rounded-lg inline-block w-fit shadow-sm mb-2"
                        >
                            해설
                        </h3>
                        <div class="p-2 bg-white rounded-xl">
                            <div
                                class="text-gray-900 leading-relaxed whitespace-pre-line text-[15px]"
                            >
                                {{ item.description }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from "vue";
import { Icon } from "@iconify/vue";
import EditQuestion from "./EditQuestion.vue";
import SymbolTooltip from "@/views/generation/question/SymbolTooltip.vue";

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

const emit = defineEmits(["content-changed"]);

const title = ref(props.initialTitle);
const content = ref(props.initialContent);
const isSummaryOpen = ref(false);
const summary = ref("");
const isContentChanged = ref(false);
const isFromRoute = ref(false);
const subject = ref("");
const keyword = ref("");
const gist = ref("");
const activeTab = ref("passage");
const isExplanationOpen = ref(false);
const currentSlide = ref(0);
const questionsData = ref([]);
const isEditingGlobal = ref(false);

// 드래그 관련 상태
const isDragging = ref(false);
const dragStartX = ref(0);
const scrollbarWidth = ref(0);

// 드래그 관련 함수들
const handleDragStart = (event) => {
    isDragging.value = true;
    dragStartX.value = event.touches[0].clientX;
    const scrollbar = event.target.parentElement;
    scrollbarWidth.value = scrollbar.offsetWidth;
};

const handleDragMove = (event) => {
    if (!isDragging.value) return;

    const currentX = event.touches[0].clientX;
    const deltaX = currentX - dragStartX.value;
    const percentage = (deltaX / scrollbarWidth.value) * 100;

    // 현재 슬라이드 위치 계산
    const newPosition = Math.max(
        0,
        Math.min(
            questionsData.value.length - 1,
            Math.round(currentSlide.value + percentage / 100)
        )
    );

    if (newPosition !== currentSlide.value) {
        currentSlide.value = newPosition;
        dragStartX.value = currentX;
    }
};

const handleDragEnd = () => {
    isDragging.value = false;
};

// 탭 변경 시 처리
watch(activeTab, (newTab) => {
    if (newTab === "question") {
        // 문항 탭으로 전환 시 데이터 다시 로드
        loadQuestionsData();
    }
});

// 제목 변경 핸들러
const handleTitleChange = (event) => {
    title.value = event.target.value;
    emitChanges();
};

// 내용 변경 핸들러
const handleContentChange = (event) => {
    content.value = event.target.value;
    emitChanges();
};

// 변경사항 emit
const emitChanges = () => {
    emit("content-changed", {
        title: title.value,
        content: content.value,
        summary: summary.value,
    });
};

// gistText computed 속성
const gistText = computed(() => {
    if (!gist.value) {
        try {
            // saveResponse에서 데이터 확인
            const saveResponseData = localStorage.getItem("saveResponse");
            if (saveResponseData) {
                const data = JSON.parse(saveResponseData);
                if (data.passage && data.passage.gist) {
                    if (Array.isArray(data.passage.gist)) {
                        gist.value = data.passage.gist;
                        return data.passage.gist.join("\n");
                    } else if (typeof data.passage.gist === "string") {
                        gist.value = data.passage.gist;
                        return data.passage.gist;
                    }
                }
            }

            // 기존 genieq-passage-data 확인
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

// 요약 토글
const toggleSummary = () => {
    isSummaryOpen.value = !isSummaryOpen.value;
    document.body.style.overflow = isSummaryOpen.value ? "hidden" : "";
    if (isSummaryOpen.value) {
        loadSummaryData();
    }
};

// 요약 데이터 로드
const loadSummaryData = () => {
    try {
        // saveResponse에서 데이터 확인
        const saveResponseData = localStorage.getItem("saveResponse");
        if (saveResponseData) {
            const data = JSON.parse(saveResponseData);
            if (data.passage) {
                subject.value = data.passage.type || data.passage.subject || "";
                keyword.value = data.passage.keyword || "";
                if (data.passage.gist) {
                    if (Array.isArray(data.passage.gist)) {
                        gist.value = data.passage.gist;
                    } else if (typeof data.passage.gist === "string") {
                        gist.value = data.passage.gist;
                    }
                }
                return; // 데이터를 찾았으면 여기서 종료
            }
        }

        // 기존 genieq-passage-data 확인
        const storedData = localStorage.getItem("genieq-passage-data");
        if (storedData) {
            const passageData = JSON.parse(storedData);

            // 기본 데이터 설정
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
        }
    } catch (error) {
        console.error("Failed to load summary data:", error);
    }
};

// 저장 버튼 클릭 핸들러
const handleSaveButtonClick = () => {
    if (content.value.length < 500) {
        alert("내용은 최소 500자 이상이어야 합니다.");
        return false;
    }

    // 변경사항 저장
    emitChanges();
    isContentChanged.value = false;
    return true;
};

// 파일 모달 열기
const openFileModal = () => {
    if (content.value.length < 500) {
        alert("내용은 최소 500자 이상이어야 합니다.");
        return;
    }
    // TODO: Implement file modal opening
};

// 문항 생성 모달 열기
const validateAndOpenModal = (type) => {
    if (content.value.length < 500) {
        alert("내용은 최소 500자 이상이어야 합니다.");
        return;
    }
    // TODO: Implement question generation modal opening
};

// props 변경 감지
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

// 컴포넌트 마운트 시 초기화
onMounted(() => {
    loadQuestionsData();
    console.log("==========", props.initialTitle);
    if (props.initialTitle) title.value = props.initialTitle;
    if (props.initialContent) content.value = props.initialContent;
});

// 외부에서 호출할 수 있는 메서드들
defineExpose({
    getTitle: () => title.value,
    getContent: () => content.value,
    getSummary: () => summary.value,
    setTitle: (newTitle) => {
        title.value = newTitle;
        emitChanges();
    },
    setContent: (newContent) => {
        content.value = newContent;
        emitChanges();
    },
    setSummary: (newSummary) => {
        summary.value = newSummary;
        emitChanges();
    },
    validateTextLength: () => content.value.length >= 500,
    handleSaveButtonClick,
});

// 문제 해설 토글
const toggleExplanation = () => {
    isExplanationOpen.value = !isExplanationOpen.value;
    document.body.style.overflow = isExplanationOpen.value ? "hidden" : "";
};

// 슬라이드 관련 함수들
const prevSlide = () => {
    if (currentSlide.value > 0) {
        currentSlide.value--;
    }
};

const nextSlide = () => {
    if (currentSlide.value < questionsData.value.length - 1) {
        currentSlide.value++;
    }
};

// 편집 모드 업데이트
const updateEditingMode = (isEditing) => {
    isEditingGlobal.value = isEditing;
};

// 문항 변경 핸들러
const handleQuestionChange = (event, index) => {
    if (event && questionsData.value[index]) {
        questionsData.value[index] = {
            ...questionsData.value[index],
            queQuery: event.title,
            queOption: event.options,
        };
        // 변경사항을 localStorage에 저장
        localStorage.setItem(
            "genieq-questions-data",
            JSON.stringify(questionsData.value)
        );
    }
};

// 설명 변경 핸들러
const handleDescriptionChange = (event, index) => {
    if (event && questionsData.value[index]) {
        questionsData.value[index] = {
            ...questionsData.value[index],
            description: event.description,
        };
        // 변경사항을 localStorage에 저장
        localStorage.setItem(
            "genieq-questions-data",
            JSON.stringify(questionsData.value)
        );
    }
};

// 편집 경고 모달
const openEditWarningModal = () => {
    // TODO: Implement edit warning modal
    console.log("Edit warning modal requested");
};

// 재생성 버튼 클릭 핸들러
const handleRecreateButtonClick = (index) => {
    // TODO: Implement recreate button handling
    console.log("Recreate button clicked for question:", index);
};

// 문항 데이터 로드
const loadQuestionsData = () => {
    try {
        const storedData = localStorage.getItem("saveResponse");
        if (storedData) {
            const data = JSON.parse(storedData);
            if (data.passage && data.passage.questions) {
                questionsData.value = data.passage.questions;
            }
        }
    } catch (error) {
        console.error("Failed to load questions data:", error);
    }
};

// 심볼 툴팁 표시
const showSymbolTooltip = (symbol) => {
    // 이미 열려있는 같은 심볼 툴팁이면 닫기
    if (showTooltip.value && currentSymbolType.value === symbol) {
        showTooltip.value = false;
        return;
    }

    currentSymbolType.value = symbol;

    // 각 심볼에 따른 목록 정의
    const symbolSeries = {
        "㉠": ["㉠", "㉡", "㉢", "㉣", "㉤"],
        "㉮": ["㉮", "㉯", "㉰", "㉱", "㉲"],
        "ⓐ": ["ⓐ", "ⓑ", "ⓒ", "ⓓ", "ⓔ"],
        "①": ["①", "②", "③", "④", "⑤"],
    };

    // 선택된 심볼에 해당하는 시리즈 설정
    symbolList.value = symbolSeries[symbol] || [];

    // 툴팁 표시
    showTooltip.value = true;
};

// 심볼 삽입 함수
const insertSymbol = (symbol) => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    // 현재 커서 위치 저장
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content.value;

    // 선택된 텍스트가 있으면 대체, 없으면 현재 위치에 삽입
    const newText = text.substring(0, start) + symbol + text.substring(end);
    content.value = newText;

    // 커서 위치 업데이트 (심볼 삽입 후 위치)
    nextTick(() => {
        textarea.focus();
        textarea.setSelectionRange(
            start + symbol.length,
            start + symbol.length
        );
    });

    // 변경사항 emit
    emitChanges();
};

// 에디터 버튼 클릭 처리
const handleButtonClick = (event, type) => {
    // 기본 이벤트 동작 방지
    event.preventDefault();

    // contentDiv 요소 가져오기
    const contentDiv = document.getElementById("content-text");
    if (contentDiv) {
        contentDiv.focus();
    }

    // 저장된 선택 영역 복원
    restoreSelection();

    // 포커스 설정
    contentDiv.focus();

    // 서식 적용
    formatText(type);
};

// 선택 영역 복원 함수
const restoreSelection = () => {
    if (savedRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
    }
};

// 텍스트 서식 적용
const formatText = (type) => {
    // 현재 선택된 텍스트 확인
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.toString() === "") return; // 선택된 텍스트가 없으면 아무것도 하지 않음

    // document.execCommand 사용하여 서식 적용
    let command;
    switch (type) {
        case "bold":
            command = "bold";
            break;
        case "underline":
            command = "underline";
            break;
        case "strikethrough":
            command = "strikeThrough";
            break;
        default:
            return;
    }

    // 명령어 실행
    document.execCommand(command, false, null);

    // 현재 선택 영역 가져오기
    if (selection.rangeCount > 0) {
        // 현재 위치 저장
        savedRange = selection.getRangeAt(0).cloneRange();
    }

    // 내용 변경 이벤트 발생
    onContentChange(true);
};

const showTooltip = ref(false);
const currentSymbolType = ref("㉠");
const symbolList = ref([]);
let savedRange = null;
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
