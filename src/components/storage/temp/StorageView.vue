<template>
    <div class="storage-view-container">
        <!-- ===== 헤더 컴포넌트 ===== -->
        <StorageHeader :current-type="currentType" :title="getTypeTitle(currentType)"
            :total-count="pagination.totalCount" :current-filters="currentFilters" @change-type="changeType"
            @update-filters="updateFilters" @clear-filters="clearFilters" />

        <!-- ===== 테이블 컴포넌트 ===== -->
        <StorageTable :items="currentData" :type="currentType" :loading="isLoading" :error="error"
            :empty-message="getEmptyMessage()" @item-click="handleItemClick" @toggle-favorite="toggleFavorite"
            @download="handleDownload" @update-title="handleUpdateTitle" @delete-items="handleDeleteItems"
            @retry="handleRetry" ref="storageTable" />

        <!-- ===== 페이지네이션 컴포넌트 ===== -->
        <StoragePagination :pagination="pagination" :max-visible-pages="5" @change-page="changePage" />

        <!-- ===== 공통 모달들 ===== -->
        <!-- 파일 다운로드 모달 -->
        <FileSelectModal :isOpen="isDownloadModalOpen" :pasCode="selectedDownloadItem?.pasCode"
            @close="closeDownloadModal" @confirm="handleFileSelection" />

        <!-- 삭제 확인 모달 (휴지통용) -->
        <WarningModalComponent v-if="currentType === 'trash'" :isOpen="isDeleteModalOpen" title="선택한 자료를 삭제하시겠습니까?"
            :message="`삭제를 진행한 자료는 영구 삭제됩니다.`" cancelText="취소" confirmText="삭제" @close="closeDeleteModal"
            @confirm="confirmDelete" />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStorage } from '@/composables/useStorage'

// 컴포넌트 imports
import StorageHeader from '@/components/storage/temp/StorageHeader.vue.backup'
import StorageTable from '@/components/storage/temp/StorageTable.vue.backup'
import StoragePagination from '@/components/storage/temp/StoragePagination.vue.backup'
import FileSelectModal from '@/components/common/FileSelectModal.vue'
import WarningModalComponent from '@/components/common/WarningModalComponent.vue'

// ===== Composable 사용 =====
const {
    currentType,
    currentPage,
    currentFilters,
    currentData,
    pagination,
    isLoading,
    error,
    fetchData,
    updateFilters,
    changePage,
    changeType,
    clearFilters,
    toggleFavorite,
    handleItemClick,
    getTypeTitle
} = useStorage()

// ===== 로컬 상태 (모달 관리) =====
const isDownloadModalOpen = ref(false)
const selectedDownloadItem = ref(null)
const isDeleteModalOpen = ref(false)
const storageTable = ref(null)

// ===== 컴포넌트 메서드들 =====

/**
 * 타입별 빈 상태 메시지 반환
 */
const getEmptyMessage = () => {
    const messages = {
        recent: '최근 작업 내역이 없습니다.',
        favorites: '즐겨찾기 문서가 없습니다.',
        trash: '삭제된 문서가 없습니다.'
    }

    // 필터가 적용된 상태에서 데이터가 없으면 다른 메시지
    const hasActiveFilters = currentFilters.value.field ||
        currentFilters.value.type ||
        currentFilters.value.search

    if (hasActiveFilters) {
        return `검색 조건에 맞는 ${getTypeTitle(currentType.value).replace('함', '')}이 없습니다.`
    }

    return messages[currentType.value] || '데이터가 없습니다.'
}

/**
 * 다운로드 버튼 클릭 처리
 */
const handleDownload = (item) => {
    console.log('📥 다운로드 요청:', item.title)
    selectedDownloadItem.value = item
    isDownloadModalOpen.value = true
}

/**
 * 파일 다운로드 모달 닫기
 */
const closeDownloadModal = () => {
    isDownloadModalOpen.value = false
    selectedDownloadItem.value = null
}

/**
 * 파일 선택 후 다운로드 실행
 */
const handleFileSelection = async (fileType) => {
    if (!selectedDownloadItem.value) return

    try {
        console.log(`📄 ${fileType} 파일 다운로드 시작:`, selectedDownloadItem.value.title)

        // 다운로드 API 호출 (기존 로직 유지)
        const response = await fetch(`/api/pass/export/each/${selectedDownloadItem.value.pasCode}?type=${fileType}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })

        if (!response.ok) {
            throw new Error('파일 다운로드에 실패했습니다.')
        }

        // 파일 다운로드 처리
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${selectedDownloadItem.value.title}.${fileType}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        console.log('✅ 파일 다운로드 완료')

    } catch (error) {
        console.error('❌ 파일 다운로드 실패:', error)
        alert('파일 다운로드에 실패했습니다: ' + error.message)
    } finally {
        closeDownloadModal()
    }
}

/**
 * 제목 수정 처리
 */
const handleUpdateTitle = async ({ pasCode, title }) => {
    try {
        console.log('✏️ 제목 수정 요청:', { pasCode, title })

        // API 호출 (기존 로직 유지)
        const response = await fetch('/api/pass/update/title', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                pasCode,
                title,
                content: "" // 기존 API 요구사항
            })
        })

        if (!response.ok) {
            throw new Error('제목 수정에 실패했습니다.')
        }

        // Store 데이터 업데이트 (로컬에서 즉시 반영)
        const itemIndex = currentData.value.findIndex(item => item.pasCode === pasCode)
        if (itemIndex !== -1) {
            currentData.value[itemIndex].title = title
        }

        console.log('✅ 제목 수정 완료')

    } catch (error) {
        console.error('❌ 제목 수정 실패:', error)
        alert('제목 수정에 실패했습니다: ' + error.message)

        // 실패 시 데이터 다시 로드
        await fetchData()
    }
}

/**
 * 삭제 요청 처리 (휴지통용)
 */
const handleDeleteItems = (pasCodeList) => {
    if (pasCodeList.length === 0) return

    console.log('🗑️ 삭제 요청:', pasCodeList)
    isDeleteModalOpen.value = true
}

/**
 * 삭제 확인 모달 닫기
 */
const closeDeleteModal = () => {
    isDeleteModalOpen.value = false
}

/**
 * 삭제 확인 처리
 */
const confirmDelete = async () => {
    try {
        const selectedItems = storageTable.value?.getSelectedItems() || []
        if (selectedItems.length === 0) return

        console.log('🗑️ 영구 삭제 실행:', selectedItems)

        // API 호출 (기존 로직 유지)
        const response = await fetch('/api/pass/remove/each', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                pasCodeList: selectedItems
            })
        })

        if (!response.ok) {
            throw new Error('삭제에 실패했습니다.')
        }

        console.log('✅ 영구 삭제 완료')

        // 선택 상태 초기화
        storageTable.value?.clearSelection()

        // 데이터 다시 로드
        await fetchData()

    } catch (error) {
        console.error('❌ 삭제 실패:', error)
        alert('삭제에 실패했습니다: ' + error.message)
    } finally {
        closeDeleteModal()
    }
}

/**
 * 에러 상황에서 재시도 처리
 */
const handleRetry = async () => {
    console.log('🔄 데이터 다시 로드 시도')
    await fetchData()
}

// ===== 라이프사이클 =====

/**
 * 라우터 변경 감지 및 데이터 로드
 * URL 파라미터나 쿼리가 변경될 때마다 자동으로 데이터 reload
 */
watch([currentType, currentPage, currentFilters], async ([newType, newPage, newFilters]) => {
    console.log('🔄 라우터 변경 감지:', {
        type: newType,
        page: newPage,
        filters: newFilters
    })

    // 타입이 변경되면 선택 상태 초기화
    if (storageTable.value) {
        storageTable.value.clearSelection()
    }

    await fetchData()
}, { immediate: true })

/**
 * 컴포넌트 마운트 시 초기화
 */
onMounted(() => {
    console.log('📱 StorageView 마운트 완료')
    console.log('🎯 초기 상태:', {
        type: currentType.value,
        page: currentPage.value,
        filters: currentFilters.value
    })
})

// ===== 디버깅용 정보 (개발 모드에서만) =====
if (import.meta.env.DEV) {
    // 개발 모드에서만 전역 디버깅 객체 노출
    window.__STORAGE_DEBUG__ = {
        currentType,
        currentPage,
        currentFilters,
        currentData,
        pagination,
        isLoading,
        error,
        fetchData,
        clearFilters
    }

    console.log('🔧 개발 모드: window.__STORAGE_DEBUG__ 사용 가능')
}
</script>

<style scoped>
.storage-view-container {
    @apply flex flex-col gap-3 mx-auto p-4 sm:p-8 w-full min-h-screen;
}

/* 로딩 상태일 때 컨테이너 최소 높이 보장 */
.storage-view-container:has([data-loading="true"]) {
    @apply min-h-[600px];
}

/* 컴포넌트 간 간격 조정 */
.storage-view-container>*+* {
    @apply mt-4;
}

/* 반응형 패딩 조정 */
@media (max-width: 640px) {
    .storage-view-container {
        @apply p-3;
    }
}

/* 디버그 모드 표시 (개발 환경에서만) */
.storage-view-container::before {
    content: "🔧 Dev Mode";
    @apply fixed top-2 right-2 px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded z-50;
    display: none;
}

/* 개발 모드에서만 디버그 표시 */
@media (prefers-color-scheme: light) {
    .storage-view-container[data-dev="true"]::before {
        display: block;
    }
}
</style>