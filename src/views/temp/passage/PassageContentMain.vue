<template>
    <div class="w-full flex flex-col gap-2">
        <p
            class="font-pretendard font-bold text-2xl md:text-xl leading-[150%] tracking-[-0.02em] text-[#303030]"
        >
            지문 유형
        </p>
        <div
            class="box-border w-full min-w-0 min-h-[70vh] bg-white border border-[#E5E7EB] rounded-xl flex flex-col gap-4 px-6 md:px-8 lg:px-10 py-4 shadow-sm"
        >
            <div class="flex flex-col items-start gap-4 w-full">
                <p
                    class="font-pretendard font-bold text-lg md:text-xl leading-[150%] tracking-[-0.02em] text-[#303030]"
                >
                    작업이름
                </p>
                <input
                    type="text"
                    id="passage-title"
                    placeholder="작업 이름을 입력해주세요. (최대 50자)"
                    v-model="title"
                    class="box-border w-full h-[46px] bg-white border border-[#E5E7EB] rounded-lg font-pretendard font-normal text-sm md:text-base leading-[150%] tracking-[-0.02em] p-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] hover:shadow-lg hover:-translate-y-0.3 hover:border-[var(--primary)] transition-all duration-300 ease-out"
                />
            </div>

            <div class="flex flex-col w-full gap-4 mt-6 relative flex-1">
                <PlainTooltip
                    id="start-edit"
                    message="필요한 부분을 클릭하고 편집을 시작하세요"
                    width="316px"
                    class="absolute inline-block left-[174px]"
                />
                <div class="flex flex-row items-center justify-between w-full">
                    <p
                        class="font-pretendard font-bold text-lg md:text-xl leading-[150%] tracking-[-0.02em] text-[#303030]"
                    >
                        생성 결과
                    </p>
                    <div
                        class="font-pretendard font-medium text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#757575]"
                    >
                        <span class="text-[#0086ff]">{{ content.length }}</span
                        >/5000
                    </div>
                </div>
                <div
                    class="box-border w-full min-h-[300px] bg-white border border-[#E5E7EB] rounded-xl flex flex-row items-start flex-1"
                >
                    <textarea
                        id="content-text"
                        placeholder="본문을 입력해주세요."
                        v-model="content"
                        @input="handleInput"
                        class="w-full h-full min-h-[200px] font-pretendard font-normal text-sm md:text-base leading-7 tracking-[-0.02em] text-[#303030] border border-[#E5E7EB] rounded-lg p-3 px-4 outline-none resize-none bg-transparent placeholder:text-[#757575] placeholder:font-medium placeholder:leading-[150%] placeholder:tracking-[-0.02em] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] hover:shadow-lg hover:-translate-y-0.3 hover:border-[var(--primary)] transition-all duration-300 ease-out"
                    ></textarea>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, defineExpose, defineEmits, watch, onMounted } from "vue";
import PlainTooltip from "@/components/common/PlainTooltip.vue";

const savePassageData = JSON.parse(localStorage.getItem("saveResponse")) || {};
// 본문 내용 ref로 관리
const content = ref("");
const title = ref(savePassageData?.passage?.title || "");
const MAX_TITLE_LENGTH = 50;
const summary = ref({
    subject: "",
    keyword: "",
    gist: [],
});

// 이벤트 발신 정의
const emit = defineEmits(["content-changed"]);

// 초기 텍스트 길이 설정
const MIN_LENGTH = 300;
const MAX_LENGTH = 5000;

// 입력 처리 함수
const handleInput = (event) => {
    // 최대 글자 수 제한
    if (content.value.length > MAX_LENGTH) {
        content.value = content.value.slice(0, MAX_LENGTH);
    }

    // 상위 컴포넌트에 변경 알림
    emitContentChange();
};

// 변경사항 상위 컴포넌트로 전달
const emitContentChange = () => {
    // 현재 요약 정보 설정 (PassageSummary 컴포넌트와 동기화)
    const summaryValue = {
        subject: summary.value.subject || "",
        keyword: summary.value.keyword || "",
        gist: summary.value.gist || "",
    };

    // 상위 컴포넌트에 변경 내용 전달
    emit("content-changed", {
        title: title.value,
        content: content.value,
        summary: summaryValue,
    });
    // console.log('[31] PassageContentMain: 내용 변경 이벤트 발생', {titleLength: title.value?.length || 0,contentLength: content.value?.length || 0,summary: summaryValue});
};

// 본문 길이 검증
const validateContent = () => {
    return content.value.length >= MIN_LENGTH;
};

// 외부에서 접근할 수 있도록 함수 노출
const getContent = () => content.value;
const getTitle = () => title.value;
const getSummary = () => summary.value;

const setContent = (newContent) => {
    // console.log('[29] PassageContentMain: 내용 설정', newContent?.length || 0);
    if (newContent !== undefined) {
        content.value = newContent || "";
        emitContentChange();
    }
};

const setTitle = (newTitle) => {
    // console.log('[30] PassageContentMain: 제목 설정', newTitle);
    if (newTitle !== undefined) {
        title.value = newTitle || "";
        emitContentChange();
    }
};

const setSummary = (newSummary) => {
    // console.log('PassageContentMain: 요약 설정', newSummary);
    if (newSummary) {
        summary.value = {
            subject: newSummary.subject || "",
            keyword: newSummary.keyword || "",
            gist: Array.isArray(newSummary.gist) ? [...newSummary.gist] : [],
        };
    }
    emitContentChange();
};

// 외부에서 접근 가능한 메서드 노출
defineExpose({
    getContent,
    getTitle,
    getSummary,
    setContent,
    setTitle,
    setSummary,
    validateContent,
});

// 컴포넌트 마운트 시 실행
onMounted(() => {
    try {
        const storedData = localStorage.getItem("genieq-passage-data");
        if (storedData) {
            const passageData = JSON.parse(storedData);
            //console.log('[2] 저장된 지문 데이터 로드:', passageData);

            // 제목과 내용 설정
            if (passageData.title) {
                title.value = passageData.title;
                // console.log('[3] 제목 설정:', title.value);
            }

            if (passageData.content) {
                content.value = passageData.content;
                // console.log('[4] 내용 설정(길이):', content.value.length);
            }

            // 요약 정보 설정
            summary.value = {
                subject: passageData.type || "",
                keyword: passageData.keyword || "",
                gist: passageData.gist || [],
            };

            // console.log('[5] 요약 정보 설정:', summary.value);

            // 변경 이벤트 발생 - 상위 컴포넌트에 알림
            emitContentChange();
        } else {
            // console.log('[6] 저장된 지문 데이터 없음');
        }
    } catch (error) {
        // console.error('[7] 지문 데이터 로드 오류:', error);
        // 에러 발생 시 기본 상태 유지
    }

    // saveResponse 초기화 (문제 방지)
    try {
        localStorage.removeItem("saveResponse");
        localStorage.setItem("saveResponse", JSON.stringify({}));
    } catch (error) {
        // console.error('[8] localStorage 접근 오류:', error);
    }

    // localStorage.removeItem('saveResponse');
    // localStorage.setItem('saveResponse', JSON.stringify({}));
});

watch(title, (newValue) => {
    // 최대 제목 글자 수 제한
    if (newValue.length > MAX_TITLE_LENGTH) {
        // 최대 길이로 잘라서 다시 설정
        title.value = newValue.substring(0, MAX_TITLE_LENGTH);
    }
});

// title이나 content가 변경될 때 이벤트 발생
watch([title, content], () => {
    emitContentChange();
});
</script>
