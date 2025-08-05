<template>
    <div class="flex-1 bg-white">
        <!-- ===== 로딩 상태 ===== -->
        <div v-if="loading" class="flex justify-center items-center w-full h-[430px] bg-white rounded-xl">
            <div class="flex flex-col items-center gap-3">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0086ff]"></div>
                <span class="text-base text-[#757575]">데이터를 불러오는 중...</span>
            </div>
        </div>

        <!-- ===== 에러 상태 ===== -->
        <div v-else-if="error" class="flex justify-center items-center w-full h-[430px] bg-white rounded-xl">
            <div class="flex flex-col items-center gap-3">
                <Icon icon="hugeicons:alert-circle" width="45" height="45" style="color: #f00" />
                <span class="text-base text-red-500">{{ error }}</span>
                <button @click="$emit('retry')"
                    class="px-4 py-2 text-sm bg-[#0086ff] text-white rounded-md hover:bg-[#0073e6] transition-all duration-200 hover:transform hover:translate-y-[-1px] active:transform active:translate-y-0">
                    다시 시도
                </button>
            </div>
        </div>

        <!-- ===== 데이터 없음 ===== -->
        <div v-else-if="items.length === 0"
            class="flex justify-center items-center w-full h-[430px] bg-white rounded-xl">
            <div class="flex flex-col items-center gap-3">
                <span class="text-base text-[#757575]">{{ emptyMessage }}</span>
                <router-link v-if="type !== 'trash'" to="/passage">
                    <button
                        class="px-6 py-2 bg-[#0086ff] text-white rounded-md hover:bg-[#0073e6] transition-all duration-200 hover:transform hover:translate-y-[-1px] active:transform active:translate-y-0">
                        지문 생성하기
                    </button>
                </router-link>
            </div>
        </div>

        <!-- ===== 실제 데이터 테이블 ===== -->
        <div v-else class="w-full bg-white rounded-xl shadow-sm overflow-hidden"><!-- Table view -->
            <!-- ===== 데스크톱 테이블 ===== -->
            <div class="hidden md:block w-full overflow-x-auto"><!-- Desktop View -->
                <table id="storageTable" class="w-full table-auto whitespace-nowrap text-left min-w-[800px]">
                    <thead class="bg-white text-sm text-slate-700 border-b border-blue-100">
                        <tr>
                            <!-- 선택 체크박스 (선택 모드일 때만) -->
                            <th v-if="isSelectionMode"
                                class="px-4 py-3 hover:bg-blue-50 transition-all duration-300 text-base sm:text-lg text-center"
                                :class="isSelectionMode ? 'w-[7%] min-w-[60px] max-w-[80px]' : 'w-0 min-w-0 max-w-0 overflow-hidden'">
                                선택
                            </th>

                            <!-- 작업명 -->
                            <th class="px-4 py-3 hover:bg-blue-50 transition-all duration-300 text-base sm:text-lg"
                                :class="isSelectionMode ? 'w-[18%] min-w-[180px] max-w-[380px]' : 'w-[20%] min-w-[200px] max-w-[400px]'">
                                작업명
                            </th>

                            <!-- 분야 -->
                            <th
                                class="px-4 py-3 w-[12%] min-w-[120px] max-w-[200px] hover:bg-blue-50 transition-colors text-base sm:text-lg">
                                분야
                            </th>

                            <!-- 제재 -->
                            <th
                                class="px-4 py-3 w-[12%] min-w-[120px] max-w-[200px] hover:bg-blue-50 transition-colors text-base sm:text-lg">
                                제재
                            </th>

                            <!-- 유형 -->
                            <th
                                class="px-4 py-3 w-[9%] min-w-[80px] max-w-[120px] hover:bg-blue-50 transition-colors text-base sm:text-lg text-center">
                                유형
                            </th>

                            <!-- 최종 작업일 -->
                            <th
                                class="px-4 py-3 w-[11%] min-w-[100px] max-w-[150px] hover:bg-blue-50 transition-colors text-base sm:text-lg text-center">
                                최종 작업일
                            </th>

                            <!-- 다운로드 -->
                            <th
                                class="px-4 py-3 w-[10%] min-w-[90px] max-w-[120px] hover:bg-blue-50 transition-colors text-base sm:text-lg text-center">
                                다운로드
                            </th>

                            <!-- 즐겨찾기 -->
                            <th
                                class="px-4 py-3 w-[9%] min-w-[80px] max-w-[120px] hover:bg-blue-50 transition-colors text-base sm:text-lg text-center">
                                즐겨찾기
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y text-[14px] sm:text-[16px]">
                        <template v-for="(item, index) in items" :key="item.pasCode">
                            <!-- 부모 행 -->
                            <tr class="group hover:bg-[#eeeeee] cursor-pointer"
                                :class="{ 'bg-[#0086ff1c]': selectedItems.has(item.pasCode) }"
                                @click="handleRowClick(item, $event)"
                                @contextmenu="handleContextMenu(item, index, $event)">
                                <!-- 선택 체크박스 (선택 모드일 때만) -->
                                <td v-if="isSelectionMode" class="px-4 py-2 text-center transition-all duration-300"
                                    @click.stop>
                                    <label class="relative inline-block cursor-pointer">
                                        <input type="checkbox" class="absolute opacity-0 cursor-pointer appearance-none"
                                            :checked="selectedItems.has(item.pasCode)"
                                            @change="toggleSelection(item.pasCode)" />
                                        <span class="relative inline-block w-5 h-5 bg-white border border-[#303030]">
                                            <span v-if="selectedItems.has(item.pasCode)"
                                                class="absolute left-[6px] top-[2px] w-[5px] h-[10px] border-r-2 border-b-2 border-[#303030] transform rotate-45"></span>
                                        </span>
                                    </label>
                                </td>

                                <!-- 작업명 -->
                                <td class="px-4 py-2 text-[#424242] transition-all duration-300">
                                    <div v-if="editingIndex === index" @click.stop>
                                        <input type="text" v-model="editingTitle" @blur="finishEditing"
                                            @keyup.enter="finishEditing" @keyup.esc="cancelEditing" ref="editInput"
                                            class="w-full p-2.5 border border-black rounded outline-none focus:ring-2 focus:ring-blue-200" />
                                    </div>
                                    <div v-else class="flex items-center gap-2">
                                        <!-- 확장 표시기 (childPassages가 있을 때만) -->
                                        <div v-if="item.childPassages && item.childPassages.length > 0"
                                            class="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                                            <svg class="w-3 h-3 transition-transform duration-200"
                                                :class="{ 'rotate-90': expandedRows.has(item.pasCode) }" fill="none"
                                                stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                        <div class="text-[#303030] truncate cursor-pointer hover:text-brand transition-colors" 
                                             @click.stop="handleTitleClick(item)">
                                            {{ item.title }}
                                            <span v-if="item.childPassages && item.childPassages.length > 0"
                                                class="text-sm text-gray-500 ml-1">
                                                ({{ item.childPassages.length }}개)
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                <!-- 분야 -->
                                <td class="px-4 py-2 text-[#424242]">
                                    {{ getPrimaryDescription(item)?.pasType || '-' }}
                                </td>

                                <!-- 제재 -->
                                <td class="px-4 py-2 text-[#424242]">
                                    {{ getPrimaryDescription(item)?.keyword || '-' }}
                                </td>

                                <!-- 유형 -->
                                <td class="px-4 py-2 text-center">
                                    <span :class="{
                                        'bg-blue-100 text-blue-700': item.isGenerated === 1,
                                        'bg-purple-100 text-purple-700': item.isGenerated === 0,
                                    }" class="px-2 py-0.5 rounded text-sm">
                                        {{ getTypeLabel(item.isGenerated) }}
                                    </span>
                                </td>

                                <!-- 최종 작업일 -->
                                <td class="px-4 py-2 text-[#424242] text-center">
                                    {{ formatDate(item.date) }}
                                </td>

                                <!-- 다운로드 -->
                                <td class="px-4 py-2 text-center" @click.stop>
                                    <div
                                        class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                        <button @click="$emit('download', item)" title="다운로드"
                                            class="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>

                                <!-- 즐겨찾기 -->
                                <td class="px-4 py-2 text-center">
                                    <button @click.stop="$emit('toggle-favorite', item)"
                                        class="p-1 transition-all duration-200 hover:transform hover:translate-y-[-1px] active:transform active:translate-y-0">
                                        <svg width="24" height="24" viewBox="0 0 24 24"
                                            :fill="item.isFavorite ? '#FF9F40' : 'none'"
                                            :stroke="item.isFavorite ? '#FF9F40' : '#d1d5db'" stroke-width="2">
                                            <polygon
                                                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26">
                                            </polygon>
                                        </svg>
                                    </button>
                                </td>
                            </tr>

                            <!-- 자식 행들 (확장된 경우에만 표시) -->
                            <template v-if="expandedRows.has(item.pasCode) && item.childPassages">
                                <tr v-for="(childItem, childIndex) in item.childPassages"
                                    :key="`${item.pasCode}_child_${childIndex}`"
                                    class="bg-gray-50 hover:bg-gray-100 border-l-4 border-blue-200">
                                    <!-- 선택 체크박스 (선택 모드일 때만) -->
                                    <td v-if="isSelectionMode" class="px-4 py-2 text-center transition-all duration-300"
                                        @click.stop>
                                        <label class="relative inline-block cursor-pointer">
                                            <input type="checkbox"
                                                class="absolute opacity-0 cursor-pointer appearance-none"
                                                :checked="selectedItems.has(childItem.pasCode)"
                                                @change="toggleSelection(childItem.pasCode)" />
                                            <span
                                                class="relative inline-block w-5 h-5 bg-white border border-[#303030]">
                                                <span v-if="selectedItems.has(childItem.pasCode)"
                                                    class="absolute left-[6px] top-[2px] w-[5px] h-[10px] border-r-2 border-b-2 border-[#303030] transform rotate-45"></span>
                                            </span>
                                        </label>
                                    </td>

                                    <!-- 자식 작업명 (들여쓰기) -->
                                    <td class="px-4 py-2 text-[#424242] transition-all duration-300">
                                        <div class="flex items-center gap-2 pl-6">
                                        <div class="text-[#303030] truncate cursor-pointer hover:text-brand transition-colors" 
                                             @click.stop="handleTitleClick(item)">
                                                <span class="mr-2 text-[#919191]">-</span>{{ childItem.title }}
                                            </div>
                                        </div>
                                    </td>

                                    <!-- 자식 분야 -->
                                    <td class="px-4 py-2 text-[#424242]">
                                        {{ getPrimaryDescription(childItem)?.pasType || '-' }}
                                    </td>

                                    <!-- 자식 제재 -->
                                    <td class="px-4 py-2 text-[#424242]">
                                        {{ getPrimaryDescription(childItem)?.keyword || '-' }}
                                    </td>

                                    <!-- 자식 유형 -->
                                    <td class="px-4 py-2 text-center">
                                        <span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm">
                                            {{ childItem.type || '지문+문항' }}
                                        </span>
                                    </td>

                                    <!-- 자식 최종 작업일 -->
                                    <td class="px-4 py-2 text-[#424242] text-center">
                                        {{ formatDate(childItem.date) }}
                                    </td>

                                    <!-- 자식 다운로드 -->
                                    <td class="px-4 py-2 text-center" @click.stop>
                                        <div
                                            class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                            <button @click="$emit('download', childItem)" title="다운로드"
                                                class="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                    stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>

                                    <!-- 자식 즐겨찾기 -->
                                    <td class="px-4 py-2 text-center">
                                        <button @click.stop="$emit('toggle-favorite', childItem)"
                                            class="p-1 transition-all duration-200 hover:transform hover:translate-y-[-1px] active:transform active:translate-y-0">
                                            <svg width="24" height="24" viewBox="0 0 24 24"
                                                :fill="childItem.isFavorite ? '#FF9F40' : 'none'"
                                                :stroke="childItem.isFavorite ? '#FF9F40' : '#d1d5db'" stroke-width="2">
                                                <polygon
                                                    points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26">
                                                </polygon>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            </template>
                        </template>
                    </tbody>
                </table>
            </div>

            <!-- ===== 모바일 리스트 ===== -->
            <div class="md:hidden"><!-- Mobile View -->
                <div v-for="(item, index) in items" :key="item.pasCode"
                    class="border-b border-gray-100 p-4 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
                    :class="{ 'bg-blue-50': selectedItems.has(item.pasCode) }" @click="handleRowClick(item, $event)">
                    <div class="flex justify-between items-start mb-2">
                        <!-- 제목 -->
                        <h3 class="font-medium text-gray-900 truncate flex-1 mr-2">
                            {{ item.title }}
                        </h3>

                        <!-- 우측 액션 버튼들 -->
                        <div class="flex items-center gap-2">
                            <!-- 체크박스 (선택 모드일 때만) -->
                            <label v-if="isSelectionMode" class="cursor-pointer" @click.stop>
                                <input type="checkbox" :checked="selectedItems.has(item.pasCode)"
                                    @change="toggleSelection(item.pasCode)"
                                    class="w-4 h-4 text-blue-600 rounded appearance-none" />
                            </label>

                            <!-- 즐겨찾기 -->
                            <button @click.stop="$emit('toggle-favorite', item)"
                                class="p-1 transition-all duration-200 hover:transform hover:translate-y-[-1px] active:transform active:translate-y-0">
                                <svg width="20" height="20" viewBox="0 0 24 24"
                                    :fill="item.isFavorite ? '#FF9F40' : 'none'"
                                    :stroke="item.isFavorite ? '#FF9F40' : '#d1d5db'" stroke-width="2">
                                    <polygon
                                        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26">
                                    </polygon>
                                </svg>
                            </button>

                            <!-- 다운로드 -->
                            <button @click.stop="$emit('download', item)"
                                class="p-1 text-gray-600 transition-all duration-200 hover:transform hover:translate-y-[-1px] active:transform active:translate-y-0">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- 메타 정보 -->
                    <div class="flex justify-between items-center text-sm text-gray-600">
                        <div class="flex items-center gap-2">
                            <span>{{ getPrimaryDescription(item)?.pasType || '-' }}</span>
                            <span class="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span :class="{
                                'bg-blue-100 text-blue-700': item.isGenerated === 1,
                                'bg-purple-100 text-purple-700': item.isGenerated === 0,
                            }" class="px-2 py-0.5 rounded text-xs">
                                {{ getTypeLabel(item.isGenerated) }}
                            </span>
                        </div>
                        <span>{{ formatDate(item.date) }}</span>
                    </div>

                    <!-- 제재 정보 (있을 때만) -->
                    <div v-if="getPrimaryDescription(item)?.keyword" class="mt-1 text-sm text-gray-500">
                        제재: {{ getPrimaryDescription(item).keyword }}
                    </div>
                </div>
            </div>
        </div>

        <!-- ===== 컨텍스트 메뉴 (데스크톱만) ===== -->
        <div v-if="showContextMenu" class="fixed bg-white border border-[#ccc] rounded shadow-lg z-50 min-w-[120px]"
            :style="{
                top: contextMenuPosition.y + 'px',
                left: contextMenuPosition.x + 'px',
            }">
            <div class="px-4 py-2.5 text-sm cursor-pointer hover:bg-[#f5f5f5] transition-all duration-200 hover:transform hover:translate-y-[-1px] active:transform active:translate-y-0"
                @click="startEditing">
                이름 변경
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

// ===== Props =====
const props = defineProps({
    items: {
        type: Array,
        default: () => []
    },
    type: {
        type: String,
        required: true,
        validator: value => ['recent', 'favorites', 'trash'].includes(value)
    },
    loading: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: null
    },
    emptyMessage: {
        type: String,
        default: '데이터가 없습니다.'
    },
    isSelectionMode: {
        type: Boolean,
        default: false
    }
})

// ===== Emits =====
const emit = defineEmits([
    'item-click',        // 아이템 클릭
    'toggle-favorite',   // 즐겨찾기 토글
    'download',          // 다운로드
    'update-title',      // 제목 수정
    'delete-items',      // 선택 아이템 삭제
    'selection-change',  // 선택 변경
    'retry'              // 재시도
])

// ===== 로컬 상태 =====
const selectedItems = ref(new Set())
const editingIndex = ref(-1)
const editingTitle = ref('')
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuIndex = ref(-1)
const editInput = ref(null)
const expandedRows = ref(new Set()) // 확장된 행들을 추적

// ===== Computed =====
const hasSelectedItems = computed(() => selectedItems.value.size > 0)

// ===== 이벤트 핸들러 =====
const handleRowClick = (item, event) => {
    // 편집 중이면 클릭 무시
    if (editingIndex.value !== -1) return

    // childPassages가 있으면 확장/축소 토글
    if (item.childPassages && item.childPassages.length > 0) {
        toggleRowExpansion(item.pasCode)
    } else {
        // childPassages가 없으면 기존처럼 상세 페이지로 이동
        emit('item-click', item)
    }
}

const toggleRowExpansion = (pasCode) => {
    if (expandedRows.value.has(pasCode)) {
        expandedRows.value.delete(pasCode)
    } else {
        expandedRows.value.add(pasCode)
    }
}

const handleTitleClick = (item) => {
    // 작업명 클릭 시 항상 상세 페이지로 이동
    emit('item-click', item)
}

const handleContextMenu = (item, index, event) => {
    event.preventDefault()

    showContextMenu.value = false
    contextMenuPosition.value = {
        x: event.clientX,
        y: event.clientY
    }
    contextMenuIndex.value = index
    showContextMenu.value = true
}

const toggleSelection = (pasCode) => {
    if (selectedItems.value.has(pasCode)) {
        selectedItems.value.delete(pasCode)
    } else {
        selectedItems.value.add(pasCode)
    }

    // 선택 변경 이벤트 발생
    emit('selection-change')
}

const startEditing = () => {
    if (contextMenuIndex.value === -1) return

    const item = props.items[contextMenuIndex.value]
    editingIndex.value = contextMenuIndex.value
    editingTitle.value = item.title
    showContextMenu.value = false

    nextTick(() => {
        if (editInput.value) {
            editInput.value.focus()
        }
    })
}

const finishEditing = () => {
    if (editingIndex.value === -1) return

    const item = props.items[editingIndex.value]
    if (editingTitle.value.trim() && editingTitle.value !== item.title) {
        emit('update-title', {
            pasCode: item.pasCode,
            title: editingTitle.value.trim()
        })
    }

    cancelEditing()
}

const cancelEditing = () => {
    editingIndex.value = -1
    editingTitle.value = ''
}


const closeContextMenu = (event) => {
    if (showContextMenu.value && !event.target.closest('.context-menu')) {
        showContextMenu.value = false
    }
}

// ===== 유틸리티 함수들 =====
const getPrimaryDescription = (item) => {
    // console.log("================", item)
    return item.descriptions?.[0] || null
}

const getTypeLabel = (isGenerated) => {
    return isGenerated === 1 ? '지문' : '문항'
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit'
    })
}


// ===== 라이프사이클 =====
onMounted(() => {
    document.addEventListener("click", closeContextMenu)
})

onUnmounted(() => {
    document.removeEventListener("click", closeContextMenu)
})

// ===== 외부 노출 메서드 (부모에서 호출 가능) =====
const getSelectedItems = () => {
    return Array.from(selectedItems.value)
}

const clearSelection = () => {
    selectedItems.value.clear()
}

defineExpose({
    getSelectedItems,
    clearSelection,
    hasSelectedItems
})
</script>

<style scoped>
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

tr.bg {
    background-color: rgba(0, 134, 255, 0.1);
}
</style>