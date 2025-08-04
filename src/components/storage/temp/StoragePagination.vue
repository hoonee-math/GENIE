<template>
    <div v-if="shouldShow" class="storage-pagination">
        <!-- ===== 데스크톱 페이지네이션 ===== -->
        <div class="hidden md:flex justify-center items-center gap-4 mt-5"><!-- Desktop View -->
            <!-- 첫 페이지 -->
            <button @click="$emit('change-page', 1)" :disabled="pagination.current === 1" :title="'첫 페이지로 이동'"
                class="pagination-btn pagination-nav-btn" :class="{ 'disabled': pagination.current === 1 }">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
                </svg>
                <span class="sr-only">첫 페이지</span>
            </button>

            <!-- 이전 페이지 -->
            <button @click="$emit('change-page', pagination.current - 1)" :disabled="pagination.current === 1"
                :title="'이전 페이지로 이동'" class="pagination-btn pagination-nav-btn"
                :class="{ 'disabled': pagination.current === 1 }">
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
                        class="pagination-btn pagination-number-btn" :class="{
                            'active': pagination.current === page,
                            'current': pagination.current === page
                        }" :title="`${page}페이지로 이동`">
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
                class="pagination-btn pagination-nav-btn"
                :class="{ 'disabled': pagination.current === pagination.total }">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6" />
                </svg>
                <span class="sr-only">다음 페이지</span>
            </button>

            <!-- 마지막 페이지 -->
            <button @click="$emit('change-page', pagination.total)" :disabled="pagination.current === pagination.total"
                :title="'마지막 페이지로 이동'" class="pagination-btn pagination-nav-btn"
                :class="{ 'disabled': pagination.current === pagination.total }">
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
                    class="mobile-pagination-btn" :class="{ 'disabled': pagination.current === 1 }">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    <span>이전</span>
                </button>

                <!-- 페이지 점프 (5페이지 이상일 때만) -->
                <div v-if="pagination.total > 4" class="flex items-center gap-2">
                    <!-- 첫 페이지 (현재가 3페이지 이상일 때) -->
                    <button v-if="pagination.current > 2" @click="$emit('change-page', 1)" class="mobile-page-btn">
                        1
                    </button>

                    <!-- 생략 표시 -->
                    <span v-if="pagination.current > 3" class="text-gray-400 text-sm">…</span>

                    <!-- 현재 페이지 -->
                    <span class="mobile-page-btn active">
                        {{ pagination.current }}
                    </span>

                    <!-- 생략 표시 -->
                    <span v-if="pagination.current < pagination.total - 2" class="text-gray-400 text-sm">…</span>

                    <!-- 마지막 페이지 (현재가 마지막-2 페이지 이하일 때) -->
                    <button v-if="pagination.current < pagination.total - 1"
                        @click="$emit('change-page', pagination.total)" class="mobile-page-btn">
                        {{ pagination.total }}
                    </button>
                </div>

                <!-- 다음 페이지 -->
                <button @click="$emit('change-page', pagination.current + 1)"
                    :disabled="pagination.current === pagination.total" class="mobile-pagination-btn"
                    :class="{ 'disabled': pagination.current === pagination.total }">
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
                    class="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#0086ff] bg-white">
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
                class="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#0086ff] bg-white">
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
.storage-pagination {
    @apply select-none;
}

/* ===== 데스크톱 페이지네이션 스타일 ===== */
.pagination-btn {
    @apply min-w-[36px] h-9 flex items-center justify-center rounded-md transition-all duration-200 font-medium;
}

.pagination-nav-btn {
    @apply px-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800;
}

.pagination-nav-btn.disabled {
    @apply text-gray-300 cursor-not-allowed;
}

.pagination-nav-btn.disabled:hover {
    @apply bg-transparent text-gray-300;
}

.pagination-number-btn {
    @apply px-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900;
}

.pagination-number-btn.active {
    @apply bg-[#0086ff] text-white font-bold;
}

.pagination-number-btn.active:hover {
    @apply bg-[#0073e6] text-white;
}

/* ===== 모바일 페이지네이션 스타일 ===== */
.mobile-pagination-btn {
    @apply flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors;
}

.mobile-pagination-btn.disabled {
    @apply text-gray-400 cursor-not-allowed;
}

.mobile-pagination-btn.disabled:hover {
    @apply bg-white;
}

.mobile-page-btn {
    @apply min-w-[32px] h-8 flex items-center justify-center text-sm rounded-md transition-colors;
}

.mobile-page-btn:not(.active) {
    @apply text-gray-700 bg-white border border-gray-300 hover:bg-gray-50;
}

.mobile-page-btn.active {
    @apply text-white bg-[#0086ff] font-bold;
}

/* ===== 호버 효과 ===== */
.pagination-btn:hover:not(.disabled) {
    @apply transform translate-y-[-1px] shadow-sm;
}

.pagination-btn:active:not(.disabled) {
    @apply transform translate-y-0;
}

/* ===== 포커스 효과 ===== */
.pagination-btn:focus {
    @apply outline-none ring-2 ring-blue-200;
}

select:focus {
    @apply outline-none ring-2 ring-blue-200;
}

/* ===== 스크린 리더용 텍스트 ===== */
.sr-only {
    @apply absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0;
    clip: rect(0, 0, 0, 0);
}

/* ===== 애니메이션 ===== */
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

/* ===== 반응형 조정 ===== */
@media (max-width: 480px) {
    .mobile-pagination-btn {
        @apply px-3 py-1.5 text-xs;
    }

    .mobile-page-btn {
        @apply min-w-[28px] h-7 text-xs;
    }
}

/* ===== 다크모드 대응 (추후 확장용) ===== */
@media (prefers-color-scheme: dark) {
    .pagination-btn:not(.active) {
        @apply text-gray-300 hover:text-white;
    }

    .pagination-nav-btn:hover {
        @apply bg-gray-800;
    }

    .pagination-number-btn:hover {
        @apply bg-gray-800;
    }
}
</style>