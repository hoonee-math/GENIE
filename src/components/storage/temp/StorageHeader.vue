<template>
    <!-- Desktop View -->
    <div class="hidden md:block flex flex-col gap-3 mx-auto p-4 sm:p-8 w-full"><!-- Desktop View -->
        <!-- ===== 타이틀 & 카운트 ===== -->
        <div class="flex items-start gap-3 mb-2">
            <p class="text-xl sm:text-2xl font-bold text-black">
                {{ title }}
            </p>
        </div>

        <!-- ===== 필터 & 검색 영역 ===== -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <!-- 카운트 정보 -->
            <div class="flex items-center gap-1">
                <span class="text-base text-black">전체</span>
                <p class="text-base font-semibold text-[#0086ff]">
                    ({{ totalCount }}개)
                </p>
                <span v-if="hasActiveFilters" class="text-base text-[#757575]">
                    필터 적용됨
                </span>
            </div>

            <!-- 필터 & 검색 컨트롤 -->
            <div class="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center w-full sm:w-auto">
                <!-- 분야 필터 -->
                <div class="flex items-center gap-2 w-full sm:w-auto">
                    <select v-model="localFilters.field" @change="handleFilterChange"
                        class="w-full sm:w-[140px] h-9 px-3 pr-8 text-sm text-[#757575] border border-[#757575] rounded-md focus:outline-none focus:border-[#0086ff] bg-white appearance-none bg-no-repeat bg-[length:16px] bg-[center_right_8px] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%23757575%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]">
                        <option value="">전체 분야</option>
                        <option value="인문">인문</option>
                        <option value="사회">사회</option>
                        <option value="예술">예술</option>
                        <option value="과학">과학</option>
                        <option value="기술">기술</option>
                    </select>
                </div>

                <!-- 유형 필터 -->
                <!-- <div class="flex items-center gap-2 w-full sm:w-auto">
                    <select v-model="localFilters.type" @change="handleFilterChange"
                        class="w-full sm:w-[140px] h-9 px-3 pr-8 text-sm text-[#757575] border border-[#757575] rounded-md focus:outline-none focus:border-[#0086ff] bg-white appearance-none bg-no-repeat bg-[length:16px] bg-[center_right_8px] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%23757575%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]">
                        <option value="">전체 유형</option>
                        <option value="지문">지문</option>
                        <option value="문항">문항</option>
                    </select>
                </div> -->

                <!-- 검색 박스 -->
                <div class="relative w-full sm:w-[140px]">
                    <input type="text" placeholder="작업명 검색" v-model="localFilters.search" @input="debounceSearch"
                        class="w-full h-9 pl-8 pr-3 text-sm text-[#757575] border border-[#757575] rounded-md focus:outline-none focus:border-[#0086ff] bg-white" />
                    <div class="absolute left-2.5 top-1/2 -translate-y-1/2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#757575" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </div>
                </div>

                <!-- 필터 초기화 버튼 -->
                <button v-if="hasActiveFilters" @click="$emit('clear-filters')"
                    class="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors bg-white">
                    <span>초기화</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-2 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>

    </div>

    <!-- Mobile View -->
    <div class="md:hidden w-full h-full flex flex-col bg-gray-50"><!-- Mobile View -->
        <!-- Header -->
        <header
            class="sticky top-0 z-999 bg-white/80 backdrop-blur-md justify-center shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-4 py-3.5 flex items-center">
            <div class="flex items-center gap-2">
                <div class="flex justify-center items-center w-full">
                    <router-link to="/"
                        class="text-base text-center font-bold bg-[#222] bg-clip-text text-transparent">{{
                        title }}</router-link>
                </div>
            </div>
        </header>

        <!-- ===== 모바일 필터 토글 (추후 확장용) ===== -->
        <div class="bg-white border-b border-gray-200">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                    <button @click="isMobileFilterOpen = !isMobileFilterOpen"
                        class="flex items-center gap-1 px-3 py-1.5 text-sm">
                        <span>필터</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-200"
                            :class="{ 'rotate-180': isMobileFilterOpen }" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div v-if="!isMobileFilterOpen && hasActiveFilters" class="flex items-center gap-1 text-sm">
                        <template v-if="localFilters.search">
                            <span class="text-blue-600">"{{ localFilters.search }}"</span>
                        </template>
                        <template v-if="localFilters.field">
                            <span v-if="localFilters.search" class="text-gray-400">·</span>
                            <span class="text-blue-600">{{ localFilters.field }}</span>
                        </template>
                        <!-- <template v-if="localFilters.type">
                            <span v-if="localFilters.search || localFilters.field" class="text-gray-400">·</span>
                            <span class="text-blue-600">{{ localFilters.type }}</span>
                        </template> -->
                    </div>
                </div>
                <div class="text-sm text-gray-500">
                    총 {{ totalCount }}개
                </div>
            </div>

            <!-- 모바일 필터 패널 -->
            <div v-if="isMobileFilterOpen" class="flex flex-col gap-4 mb-4 rounded-lg">
                <!-- 검색 -->
                <div class="flex flex-row items-center gap-4">
                    <span class="text-sm font-medium text-gray-700 w-12">작업명</span>
                    <div class="relative w-full">
                        <div class="absolute left-3 top-1/2 -translate-y-1/2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input type="text" placeholder="작업명 검색" v-model="localFilters.search" @input="debounceSearch"
                            class="w-full h-11 pl-10 pr-4 text-base text-[#757575] border border-gray-200 rounded-md focus:outline-none focus:border-[#0086ff] bg-gray-50" />
                    </div>
                </div>

                <!-- 분야 필터 -->
                <div class="flex flex-row items-center gap-4">
                    <span class="text-sm font-medium text-gray-700 w-12">분야</span>
                    <div class="overflow-x-auto w-full scrollbar-hide">
                        <div class="flex gap-2 min-w-max">
                            <button @click="selectField('')"
                                class="px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                                :class="localFilters.field === '' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-100'">
                                전체
                            </button>
                            <button v-for="field in fieldOptions" :key="field" @click="selectField(field)"
                                class="px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                                :class="localFilters.field === field ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'">
                                {{ field }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 유형 필터, 더이상 필요없어진 기능, 관련 코드 삭제 예정 -->
                <!-- <div class="flex flex-row items-center gap-4">
                    <span class="text-sm font-medium text-gray-700 w-12">유형</span>
                    <div class="overflow-x-auto w-full scrollbar-hide">
                        <div class="flex gap-2 min-w-max">
                            <button @click="selectType('')"
                                class="px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                                :class="localFilters.type === '' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-100'">
                                전체
                            </button>
                            <button v-for="type in typeOptions" :key="type" @click="selectType(type)"
                                class="px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                                :class="localFilters.type === type ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-100'">
                                {{ type }}
                            </button>
                        </div>
                    </div>
                </div> -->
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { debounce } from 'lodash'

// ===== Props =====
const props = defineProps({
    currentType: {
        type: String,
        required: true,
        validator: value => ['recent', 'favorites', 'trash'].includes(value)
    },
    title: {
        type: String,
        required: true
    },
    totalCount: {
        type: Number,
        default: 0
    },
    currentFilters: {
        type: Object,
        required: true,
        default: () => ({
            field: '',
            type: '',
            search: '',
            sort: 'date',
            order: 'desc'
        })
    }
})

// ===== Emits =====
const emit = defineEmits([
    'change-type',      // 타입 변경 (recent, favorites, trash)
    'update-filters',   // 필터 업데이트
    'clear-filters'     // 필터 초기화
])

// ===== 로컬 상태 =====
const localFilters = ref({
    field: props.currentFilters.field,
    type: props.currentFilters.type,
    search: props.currentFilters.search
})

const isMobileFilterOpen = ref(false)

// ===== 필터 옵션들 =====
const fieldOptions = ['인문', '사회', '예술', '과학', '기술']
const typeOptions = ['지문', '문항']

// ===== Computed =====
const hasActiveFilters = computed(() => {
    return localFilters.value.field ||
        localFilters.value.type ||
        localFilters.value.search
})

// ===== Props 변경 시 로컬 상태 동기화 =====
watch(() => props.currentFilters, (newFilters) => {
    localFilters.value = {
        field: newFilters.field,
        type: newFilters.type,
        search: newFilters.search
    }
}, { deep: true })

// ===== 이벤트 핸들러 =====
const handleFilterChange = () => {
    emit('update-filters', {
        field: localFilters.value.field,
        type: localFilters.value.type,
        search: localFilters.value.search
    })
}

const debounceSearch = debounce(() => {
    emit('update-filters', {
        field: localFilters.value.field,
        type: localFilters.value.type,
        search: localFilters.value.search
    })
}, 500)

// 모바일 필터 선택 헬퍼 함수들
const selectField = (field) => {
    localFilters.value.field = field
    handleFilterChange()
}

const selectType = (type) => {
    localFilters.value.type = type
    handleFilterChange()
}
</script>

<style scoped>

/* 모바일 스크롤바 숨김 */
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

/* 셀렉트 박스 커스텀 스타일 */
select {
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23757575' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center right 8px;
    background-size: 16px;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}

/* 포커스 효과 */
select:focus,
input:focus {
    @apply ring-2 ring-blue-200;
}

/* 버튼 호버 효과 */
button {
    @apply transition-all duration-200;
}

button:hover:not(:disabled) {
    @apply transform translate-y-[-1px];
}

button:active:not(:disabled) {
    @apply transform translate-y-0;
}
</style>