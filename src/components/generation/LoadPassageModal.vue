<template>
    <BaseModal :isOpen="isOpen" @close="closeModal" width="100vw" height="100vh">
        <div class="w-full h-full flex flex-col items-start gap-4 md:p-6 box-border relative"
            :class="{ 'p-4': isMobile }">
            <!-- 모바일 X 버튼 -->
            <button @click="closeModal"
                class="md:hidden absolute right-4 top-4 z-10 w-8 h-8 flex items-center justify-center">
                <Icon icon="mdi:close" width="24" height="24" class="text-gray-600" />
            </button>

            <!-- 제목 및 설명 -->
            <div class="flex flex-row md:flex-col md:items-start w-full gap-4 items-center"
                :class="{ 'gap-4 items-center': isMobile }">
                <h2
                    class="font-pretendard font-bold text-lg md:text-xl leading-[150%] tracking-[-0.02em] text-[#303030]">
                    지문 불러오기
                </h2>

                <BaseButton class="md:hidden" text="불러오기" type="type1" @click.stop="handleLoadPassage" />

                <p
                    class="hidden md:block font-pretendard font-light text-sm md:text-base leading-6 tracking-[-0.02em] text-[#757575]">
                    기존에 생성했던 문제의 지문을 불러옵니다.
                </p>
            </div>

            <!-- 탭 메뉴 -->
            <div class="flex gap-5 w-full">
                <button
                    class="font-pretendard text-base leading-7 tracking-[-0.02em] text-[#757575] border-b-3 border-transparent hover:text-[#0086ff] transition-colors"
                    :class="{
                        'border-[#0086ff] text-[#0086ff]': activeTab === 'recent',
                    }" @click="activeTab = 'recent'; selectedPassage = null;">
                    최근 작업 내역
                </button>
                <button
                    class="font-pretendard text-base leading-7 tracking-[-0.02em] text-[#757575] border-b-3 border-transparent hover:text-[#0086ff] transition-colors"
                    :class="{
                        'border-[#0086ff] text-[#0086ff]': activeTab === 'favorites',
                    }" @click="activeTab = 'favorites'; selectedPassage = null;">
                    즐겨찾기
                </button>
            </div>

            <!-- 검색 입력창 -->
            <div v-if="!selectedPassage" class="flex items-center w-full h-11 border border-[#ddd] rounded-lg p-2">
                <input type="text" :value="searchQuery" @input="handleSearch" placeholder="검색어를 입력하세요"
                    class="flex-1 border-none outline-none text-base" />
                <button class="bg-transparent border-none text-lg cursor-pointer">
                    <Icon icon="iconamoon:search" width="24" height="24" class="text-[#757575]" />
                </button>
            </div>

            <!-- 컨텐츠 영역 -->
            <div :class="[
                'w-full flex-1 rounded-xl bg-white md:p-3 md:p-5 border-0 md:border border-[#bdbdbd]',
                selectedPassage ? 'flex flex-col overflow-hidden' : '',
                filteredPassages.length === 0 ? 'flex items-center justify-center' : '',
                isMobile ? 'border-0' : 'border border-[#bdbdbd]'
            ]">
                <!-- 지문 미리보기 -->
                <div v-if="selectedPassage" class="flex flex-col w-full h-full overflow-hidden">
                    <div class="font-bold text-xl leading-[150%] tracking-[-0.02em] py-4 px-4">
                        {{ selectedPassage.PAS_TITLE }}
                    </div>
                    <div
                        class="w-full h-full font-normal text-base leading-7 tracking-[-0.02em] px-4 pb-4 text-left overflow-y-auto whitespace-pre-wrap">
                        <TipTapEditor :initialContent="selectedPassage.PAS_CONTENT" :isEditable="false"
                            :addClass="'leading-7 tracking-[-0.02em] '" />
                    </div>
                </div>

                <!-- 검색 결과가 없을 때 -->
                <div v-else-if="filteredPassages.length === 0 && activeTab === 'favorites'"
                    class="font-normal text-xl leading-[150%] tracking-[-0.02em] text-center">
                    즐겨찾기가 존재하지 않습니다.
                </div>
                <div v-else-if="filteredPassages.length === 0"
                    class="font-normal text-xl leading-[150%] tracking-[-0.02em] text-center">
                    '{{ searchQuery }}'에 대한 검색 결과가 존재하지 않습니다.
                </div>

                <!-- 검색 결과 리스트 -->
                <SearchList v-else :items="filteredPassages" :activeItemId="selectedPassageId" @preview="selectPassage"
                    @activeItemChange="handleActiveItemChange" />
            </div>

            <!-- 버튼 영역 -->
            <div class="hidden md:flex flex-row justify-end gap-2.5 w-full">
                <template v-if="selectedPassage">
                    <BaseButton text="이전으로" type="type3" width="140px" height="54px" @click="handleBack" />
                </template>
                <template v-else>
                    <BaseButton text="닫기" type="type3" width="140px" height="54px" @click="closeModal" />
                </template>
                <BaseButton text="불러오기" type="type1" width="182px" height="54px" @click.stop="handleLoadPassage" />
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import SearchList from "@/components/generation/SearchList.vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Icon } from "@iconify/vue";
import { usePassage } from '@/composables/usePassage';
import TipTapEditor from '@/views/generation/TipTapEditor.vue'

// 라우터와 스토어 초기화
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// usePassage composable 사용
const { fetchPassage, fetchPassageList, storageList } = usePassage();

const props = defineProps({
    isOpen: Boolean,
});

// 불러오기, 닫기 이벤트 정의
const emit = defineEmits(["close", "selectPasCode"]);

const searchQuery = ref("");
const activeTab = ref("recent");
const passages = ref([]);
const selectedPassage = ref(null);      // 미리보기 화면에 표시할 지문 데이터를 페이지 안에서 저장해서 사용
const selectedPassageId = ref(null);    // 해당 항목을 하이라이트 설정하도록 하는 변수

const isMobile = ref(false)

function update() {
    isMobile.value = window.innerWidth < 768
}

watch(
    () => props.isOpen,
    (newValue) => {
        if (newValue) {
            activeTab.value = "recent";
            loadPreviews();
        }
    }
);

onMounted(() => {
    if (props.isOpen) {
        update();
        activeTab.value = "recent";
        loadPreviews();
    }
});

const loadPreviews = async () => {
    try {
        // usePassage.js의 fetchPassageList 사용 (캐시 우선 + API 호출)
        const listData = await fetchPassageList();

        // LoadPassageModal에서 사용하는 데이터 형식으로 변환
        passages.value = listData.map((item) => ({
            PAS_CODE: item.pasCode,
            PAS_TITLE: item.title,
            PAS_CONTENT: item.content, // 리스트에서 미리보기용으로 포함
            generateType: item.generateType,
            isFavorite: item.isFavorite, // 즐겨찾기 데이터 매핑 추가
            // PAS_KEYWORD: item.keyword,
            // PAS_GIST: item.gist,
            // PAS_DATE: item.date,
        }));

        // 첫 번째 지문 선택
        if (passages.value.length > 0) {
            const firstPassage = passages.value[0];
            selectedPassageId.value = firstPassage.PAS_CODE;
            selectedPassage.value = null;
        }

        console.log('📜 LoadPassageModal 리스트 로드 완료, 개수:', passages.value.length);
    } catch (error) {
        console.error('LoadPassageModal 리스트 로드 실패:', error);
    }
};

const handleActiveItemChange = (itemId) => {
    // console.log('[LoadPassageModal] 활성화된 항목 변경:', itemId);
    selectedPassageId.value = itemId;
    selectedPassage.value = null;
}

// 불러오기 버튼 클릭 시 처리
const handleLoadPassage = async () => {
    // 선택된 ID만 부모에게 전달
    emit("selectPasCode", selectedPassageId.value);
    closeModal();
};

const handleSearch = (event) => {
    searchQuery.value = event.target.value;
};

// 미리보기 버튼을 클릭하면 지문 선택
const selectPassage = (passage) => {
    selectedPassage.value = passage;
    selectedPassageId.value = passage.PAS_CODE;
};

// "이전으로" 버튼 클릭 시 처리 - 미리보기에서 리스트로 돌아가기
const handleBack = () => {
    // 현재 선택된 ID 저장
    const tempId = selectedPassageId.value;

    // 미리보기 상태 해제
    selectedPassage.value = null;

    // ID 상태 유지 (활성화 상태 유지)
    selectedPassageId.value = tempId;
};

// 닫기 버튼 클릭 시 모달 닫기 처리
const closeModal = () => {
    emit("close");
    searchQuery.value = "";
    selectedPassage.value = null; // 선택된 지문 초기화
    selectedPassageId.value = null; // 선택된 지문 ID 초기화
    activeTab.value = "recent"; // 모달이 닫힐 때도 'recent'로 설정
};

// ✅ 검색어에 따라 목록 필터링
const filteredPassages = computed(() => {
    // 즐겨찾기 탭 상태일 때만 즐겨찾기 필터링
    let list =
        activeTab.value === "favorites"
            ? passages.value.filter((passage) => passage.isFavorite === 1)
            : passages.value;

    // 검색어 필터링 적용
    if (searchQuery.value) {
        list = list.filter((passage) =>
            passage.PAS_TITLE.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    }

    return list;
});

// ✅ 검색 결과 & 지문 미리보기 상태에 따라 `content-area` 스타일 변경
const contentAreaClass = computed(() => {
    if (selectedPassage.value) {
        return "content-area passage-mode"; // 🔥 미리보기 화면
    } else if (filteredPassages.value.length === 0) {
        return "content-area no-results-mode"; // 🔥 검색 결과 없음
    }
    return "content-area"; // 🔥 기본 목록 표시
});
</script>

<style scoped>
@media (max-width: 767px) {
    :deep(.modal-content) {
        border-radius: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
        max-height: 100% !important;
    }

    :deep(.modal-content > *) {
        border-radius: 0 !important;
    }
}
</style>
