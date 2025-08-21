<template>
    <div v-if="shouldShow" class="storage-pagination select-none">
        <!-- ===== 데스크톱 페이지네이션 ===== -->
        <div class="hidden md:flex justify-center items-center gap-4 mt-5"><!-- Desktop View -->
            <!-- 첫 페이지 -->
            <button @click="$emit('change-page', 1)" :disabled="pagination.current === 1" :title="'첫 페이지로 이동'"
                class="min-w-[36px] h-9 flex items-center justify-center rounded-md transition-all duration-200 font-medium px-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:transform hover:translate-y-[-1px] hover:shadow-sm active:transform active:translate-y-0 disabled:text-gray-300 disabled:cursor-not-allowed disabled:bg-transparent disabled:hover:bg-transparent disabled:hover:text-gray-300 disabled:transform-none disabled:shadow-none">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
                </svg>
                <span class="sr-only">첫 페이지</span>
            </button>

            <!-- 이전 페이지 -->
            <button @click="$emit('change-page', pagination.current - 1)" :disabled="pagination.current === 1"
                :title="'이전 페이지로 이동'" class="min-w-[36px] h-9 flex items-center justify-center rounded-md transition-all duration-200 font-medium px-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:transform hover:translate-y-[-1px] hover:shadow-sm active:transform active:translate-y-0 disabled:text-gray-300 disabled:cursor-not-allowed disabled:bg-transparent disabled:hover:bg-transparent disabled:hover:text-gray-300 disabled:transform-none disabled:shadow-none">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
                <span class="sr-only">이전 페이지</span>
            </button>

            <!-- 페이지 번호들 -->
            <div class="flex items-center gap-1">
                <template v-for="page in visiblePages" :key="page">
                    <!-- 일반 페이지 번호 -->
                    <button v-if="typeof page === 'number'" @click="$emit('change-page', page)"
                        class="min-w-[36px] h-9 flex items-center justify-center rounded-md transition-all duration-200 font-medium px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 hover:transform hover:translate-y-[-1px] hover:shadow-sm active:transform active:translate-y-0"
                        :class="pagination.current === page 
                            ? 'bg-[#0086ff] text-white font-bold hover:bg-[#0073e6] hover:text-white' 
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'" 
                        :title="`${page}페이지로 이동`">
                        {{ page }}
                    </button>

                    <!-- 생략 표시 (...) -->
                    <span v-else class="px-2 py-2 text-sm text-gray-400 select-none">
                        {{ page }}
                    </span>
                </template>
            </div>

            <!-- 다음 페이지 -->
            <button @click="$emit('change-page', pagination.current + 1)"
                :disabled="pagination.current === pagination.total" :title="'다음 페이지로 이동'"
                class="min-w-[36px] h-9 flex items-center justify-center rounded-md transition-all duration-200 font-medium px-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:transform hover:translate-y-[-1px] hover:shadow-sm active:transform active:translate-y-0 disabled:text-gray-300 disabled:cursor-not-allowed disabled:bg-transparent disabled:hover:bg-transparent disabled:hover:text-gray-300 disabled:transform-none disabled:shadow-none">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6" />
                </svg>
                <span class="sr-only">다음 페이지</span>
            </button>

            <!-- 마지막 페이지 -->
            <button @click="$emit('change-page', pagination.total)" :disabled="pagination.current === pagination.total"
                :title="'마지막 페이지로 이동'" class="min-w-[36px] h-9 flex items-center justify-center rounded-md transition-all duration-200 font-medium px-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:transform hover:translate-y-[-1px] hover:shadow-sm active:transform active:translate-y-0 disabled:text-gray-300 disabled:cursor-not-allowed disabled:bg-transparent disabled:hover:bg-transparent disabled:hover:text-gray-300 disabled:transform-none disabled:shadow-none">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
                </svg>
                <span class="sr-only">마지막 페이지</span>
            </button>
        </div>

        <!-- ===== 모바일 페이지네이션 ===== -->
        <div class="md:hidden flex flex-col items-center gap-4 mt-5"><!-- Mobile View -->
            <!-- 페이지 정보 -->
            <div class="text-sm text-gray-600 text-center">
                <span class="font-medium text-[#0086ff]">{{ pagination.current }}</span>
                <span class="mx-1">/</span>
                <span>{{ pagination.total }}</span>
                <span class="ml-2 text-xs text-gray-500">
                    (총 {{ pagination.totalCount }}개)
                </span>
            </div>

            <!-- 모바일 페이지 네비게이션 -->
            <div class="flex items-center justify-center gap-3">
                <!-- 이전 페이지 -->
                <button @click="$emit('change-page', pagination.current - 1)" :disabled="pagination.current === 1"
                    class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:transform hover:translate-y-[-1px] active:transform active:translate-y-0 disabled:text-gray-400 disabled:cursor-not-allowed disabled:bg-white disabled:hover:bg-white disabled:transform-none">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    <span>이전</span>
                </button>

                <!-- 페이지 점프 (5페이지 이상일 때만) -->
                <div v-if="pagination.total > 4" class="flex items-center gap-2">
                    <!-- 첫 페이지 (현재가 3페이지 이상일 때) -->
                    <button v-if="pagination.current > 2" @click="$emit('change-page', 1)" class="min-w-[32px] h-8 flex items-center justify-center text-sm rounded-md transition-all duration-200 hover:transform hover:translate-y-[-1px] active:transform active:translate-y-0 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50">
                        1
                    </button>

                    <!-- 생략 표시 -->
                    <span v-if="pagination.current > 3" class="text-gray-400 text-sm">…</span>

                    <!-- 현재 페이지 -->
                    <span class="min-w-[32px] h-8 flex items-center justify-center text-sm rounded-md text-white bg-[#0086ff] font-bold">
                        {{ pagination.current }}
                    </span>

                    <!-- 생략 표시 -->
                    <span v-if="pagination.current < pagination.total - 2" class="text-gray-400 text-sm">…</span>

                    <!-- 마지막 페이지 (현재가 마지막-2 페이지 이하일 때) -->
                    <button v-if="pagination.current < pagination.total - 1"
                        @click="$emit('change-page', pagination.total)" class="min-w-[32px] h-8 flex items-center justify-center text-sm rounded-md transition-all duration-200 hover:transform hover:translate-y-[-1px] active:transform active:translate-y-0 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50">
                        {{ pagination.total }}
                    </button>
                </div>

                <!-- 다음 페이지 -->
                <button @click="$emit('change-page', pagination.current + 1)"
                    :disabled="pagination.current === pagination.total" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:transform hover:translate-y-[-1px] active:transform active:translate-y-0 disabled:text-gray-400 disabled:cursor-not-allowed disabled:bg-white disabled:hover:bg-white disabled:transform-none">
                    <span>다음</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>

            <!-- 빠른 페이지 이동 (10페이지 이상일 때만) -->
            <div v-if="pagination.total >= 10" class="flex items-center gap-2 text-sm">
                <span class="text-gray-600">빠른 이동:</span>
                <select :value="pagination.current" @change="$emit('change-page', parseInt($event.target.value))"
                    class="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#0086ff] focus:ring-2 focus:ring-blue-200 bg-white">
                    <option v-for="page in Array.from({ length: pagination.total }, (_, i) => i + 1)" :key="page"
                        :value="page">
                        {{ page }}페이지
                    </option>
                </select>
            </div>
        </div>

        <!-- ===== 페이지 크기 선택 (추후 확장용 - 현재는 숨김) ===== -->
        <div v-if="showPageSizeSelector" class="hidden justify-center items-center gap-4 mt-3">
            <span class="text-sm text-gray-600">페이지당:</span>
            <select :value="pageSize" @change="$emit('change-page-size', parseInt($event.target.value))"
                class="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#0086ff] focus:ring-2 focus:ring-blue-200 bg-white">
                <option value="10">10개</option>
                <option value="15">15개</option>
                <option value="20">20개</option>
                <option value="50">50개</option>
            </select>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

// ===== Props =====
const props = defineProps({
    pagination: {
        type: Object,
        required: true,
        default: () => ({
            current: 1,      // 현재 페이지
            total: 0,        // 총 페이지 수
            totalCount: 0    // 총 아이템 수
        })
    },
    // 추후 확장용
    pageSize: {
        type: Number,
        default: 15
    },
    showPageSizeSelector: {
        type: Boolean,
        default: false
    },
    maxVisiblePages: {
        type: Number,
        default: 5
    }
})

// ===== Emits =====
const emit = defineEmits([
    'change-page',      // 페이지 변경
    'change-page-size'  // 페이지 크기 변경 (추후 확장용)
])

// ===== Computed =====
const shouldShow = computed(() => {
    return props.pagination.total > 1 && props.pagination.totalCount > 0
})

// 표시할 페이지 번호들 계산 (생략 표시 포함)
const visiblePages = computed(() => {
    const { current, total } = props.pagination
    const maxVisible = props.maxVisiblePages

    if (total <= maxVisible) {
        // 총 페이지가 최대 표시 개수보다 적으면 모두 표시
        return Array.from({ length: total }, (_, i) => i + 1)
    }

    const pages = []

    // 항상 첫 페이지 표시
    pages.push(1)

    // 현재 페이지 주변 범위 계산
    const startPage = Math.max(2, current - 1)
    const endPage = Math.min(total - 1, current + 1)

    // 첫 페이지와 시작 범위 사이에 간격이 있으면 생략 표시
    if (startPage > 2) {
        pages.push('...')
    }

    // 현재 페이지 주변 페이지들 추가
    for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== total) { // 첫 페이지와 마지막 페이지 중복 제거
            pages.push(i)
        }
    }

    // 끝 범위와 마지막 페이지 사이에 간격이 있으면 생략 표시
    if (endPage < total - 1) {
        pages.push('...')
    }

    // 항상 마지막 페이지 표시 (총 페이지가 1보다 클 때)
    if (total > 1) {
        pages.push(total)
    }

    return pages
})

// 페이지 정보 텍스트 (디버깅용)
const pageInfoText = computed(() => {
    const { current, total, totalCount } = props.pagination
    return `${current} / ${total} (총 ${totalCount}개)`
})
</script>

<style scoped>
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.storage-pagination {
    animation: fadeIn 0.3s ease-out;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    white-space: nowrap;
    border: 0;
    clip: rect(0, 0, 0, 0);
}
</style>