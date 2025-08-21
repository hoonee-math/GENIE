<template>
    <div class="flex flex-col mx-auto p-4 sm:p-8 w-full min-h-screen storage-view-container">
        <!-- ===== 헤더 컴포넌트 ===== -->
        <StorageHeader :current-type="currentType" :title="getTypeTitle(currentType)"
            :total-count="pagination.totalCount" :current-filters="currentFilters" 
            :is-selection-mode="isSelectionMode"
            @change-type="changeType" @update-filters="updateFilters" @clear-filters="clearFilters" 
            @toggle-selection-mode="toggleSelectionMode" @action-button-click="handleActionButtonClick" />

        <!-- ===== 테이블 컴포넌트 ===== -->
        <StorageTable :items="currentData" :type="currentType" :loading="isLoading" :error="error"
            :empty-message="getEmptyMessage()" :is-selection-mode="isSelectionMode"
            @item-click="handleItemClick" 
            @toggle-favorite="toggleFavorite"
            @download="handleDownload" 
            @update-title="handleUpdateTitle"
            @delete-items="handleDeleteItems"
            @selection-change="handleSelectionChange" 
            @retry="handleRetry" ref="storageTable" />

        <!-- ===== 페이지네이션 컴포넌트 ===== -->
        <StoragePagination :pagination="pagination" :max-visible-pages="5" @change-page="changePage" />

        <!-- ===== 공통 모달들 ===== -->
        <!-- 파일 다운로드 모달 -->
        <FileSelectModal :isOpen="isDownloadModalOpen" :pasCode="selectedDownloadItem?.pasCode"
            @close="closeDownloadModal" @confirm="handleFileSelection" />

        <!-- 삭제 확인 모달 (휴지통으로 이동) -->
        <WarningModalComponent :isOpen="isDeleteModalOpen" 
            title="선택한 자료를 삭제하시겠습니까?"
            message="선택한 자료가 휴지통으로 이동됩니다." 
            cancelText="취소" 
            confirmText="삭제" 
            @close="closeDeleteModal" @confirm="confirmDelete" />

        <!-- 복원 확인 모달 -->
        <WarningModalComponent :isOpen="isRestoreModalOpen" 
            title="선택한 자료를 복원하시겠습니까?"
            message="선택한 자료가 최근 문서함으로 복원됩니다." 
            cancelText="취소" 
            confirmText="복원" 
            @close="closeRestoreModal" @confirm="confirmRestore" />

        <!-- 영구 삭제 확인 모달 -->
        <WarningModalComponent :isOpen="isPermanentDeleteModalOpen" 
            title="선택한 자료를 영구 삭제하시겠습니까?"
            message="영구 삭제된 자료는 복구할 수 없습니다." 
            cancelText="취소" 
            confirmText="영구 삭제" 
            @close="closePermanentDeleteModal" @confirm="confirmPermanentDelete" />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStorage } from '@/composables/useStorage'

// 컴포넌트 imports
import StorageHeader from '@/components/storage/StorageHeader.vue'
import StorageTable from '@/components/storage/StorageTable.vue'
import StoragePagination from '@/components/storage/StoragePagination.vue'
import FileSelectModal from '@/components/common/FileSelectModal.vue'
import WarningModalComponent from '@/components/common/WarningModalComponent.vue'
import { apiPut } from '@/utils/http'
import { updatePassagePartial } from '@/api/passage'

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
const isRestoreModalOpen = ref(false)
const isPermanentDeleteModalOpen = ref(false)
const storageTable = ref(null)

// ===== 선택 모드 상태 관리 =====
const isSelectionMode = ref(false)

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
 * 자료실 - 제목 수정 api - 5 - emit 으로 수정한 제목/작업명 전달 받아 api 요청 실행
 */
const handleUpdateTitle = async ({ pasCode, title }) => {
    try {
        console.log('✏️ 제목 수정 요청:', { pasCode, title })

        await updatePassagePartial(pasCode, {
                'title': title
            })

        // Store 데이터 업데이트 (로컬에서 즉시 반영)
        // 먼저 부모 항목에서 찾기
        const itemIndex = currentData.value.findIndex(item => item.pasCode === pasCode)
        if (itemIndex !== -1) {
            currentData.value[itemIndex].title = title
        } else {
            // 부모에서 찾지 못했다면 자식 항목에서 찾기
            for (let i = 0; i < currentData.value.length; i++) {
                const parentItem = currentData.value[i]
                if (parentItem.childPassages && parentItem.childPassages.length > 0) {
                    const childIndex = parentItem.childPassages.findIndex(child => child.pasCode === pasCode)
                    if (childIndex !== -1) {
                        parentItem.childPassages[childIndex].title = title
                        break
                    }
                }
            }
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

        console.log('🗑️ 휴지통으로 이동:', selectedItems)

        const response = apiPut('/api/pass/remove/each',{
                pasCodeList: selectedItems
            })

        console.log("asdasd",response.message)

        // if (!response.ok) {
        //     throw new Error('휴지통으로 이동에 실패했습니다.')
        // }

        console.log('✅ 휴지통으로 이동 완료')

        // 선택 상태 초기화 및 선택 모드 해제
        storageTable.value?.clearSelection()
        isSelectionMode.value = false

        // 데이터 다시 로드
        await fetchData()

    } catch (error) {
        console.error('❌ 휴지통 이동 실패:', error)
        alert('휴지통으로 이동에 실패했습니다: ' + error.message)
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

/**
 * 선택 모드 토글
 */
const toggleSelectionMode = () => {
    isSelectionMode.value = !isSelectionMode.value
    
    // 선택 모드 해제 시 모든 선택 해제
    if (!isSelectionMode.value && storageTable.value) {
        storageTable.value.clearSelection()
    }
}

/**
 * 선택 항목 변경 감지 (자동 모드 해제용)
 */
const handleSelectionChange = () => {
    if (isSelectionMode.value && storageTable.value) {
        const selectedItems = storageTable.value.getSelectedItems()
        // 아무것도 선택되지 않으면 선택 모드 해제
        if (selectedItems.length === 0) {
            isSelectionMode.value = false
        }
    }
}

/**
 * 통합 액션 버튼 클릭 처리
 */
const handleActionButtonClick = (action) => {
    const selectedItems = storageTable.value?.getSelectedItems() || []
    
    // 아무것도 선택되지 않으면 선택 모드 해제
    if (selectedItems.length === 0) {
        isSelectionMode.value = false
        return
    }
    
    // 선택된 항목이 있으면 해당 액션의 모달 열기
    switch (action) {
        case 'delete':
            isDeleteModalOpen.value = true
            break
        case 'restore':
            isRestoreModalOpen.value = true
            break
        case 'permanentDelete':
            isPermanentDeleteModalOpen.value = true
            break
    }
}

/**
 * 복원 모달 닫기
 */
const closeRestoreModal = () => {
    isRestoreModalOpen.value = false
}

/**
 * 영구 삭제 모달 닫기
 */
const closePermanentDeleteModal = () => {
    isPermanentDeleteModalOpen.value = false
}

/**
 * 영구 삭제 확인 처리
 */
const confirmPermanentDelete = async () => {
    try {
        const selectedItems = storageTable.value?.getSelectedItems() || []
        if (selectedItems.length === 0) return

        console.log('🗑️ 영구 삭제 실행:', selectedItems)

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
            throw new Error('영구 삭제에 실패했습니다.')
        }

        console.log('✅ 영구 삭제 완료')

        // 선택 상태 초기화 및 선택 모드 해제
        storageTable.value?.clearSelection()
        isSelectionMode.value = false

        // 데이터 다시 로드
        await fetchData()

    } catch (error) {
        console.error('❌ 영구 삭제 실패:', error)
        alert('영구 삭제에 실패했습니다: ' + error.message)
    } finally {
        closePermanentDeleteModal()
    }
}

/**
 * 복원 확인 처리
 */
const confirmRestore = async () => {
    try {
        const selectedItems = storageTable.value?.getSelectedItems() || []
        if (selectedItems.length === 0) return

        console.log('🔄 복원 실행:', selectedItems)

        // TODO: 복원 API 호출 구현
        const response = await fetch('/api/pass/restore', {
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
            throw new Error('복원에 실패했습니다.')
        }

        console.log('✅ 복원 완료')

        // 선택 상태 초기화 및 선택 모드 해제
        storageTable.value?.clearSelection()
        isSelectionMode.value = false

        // 데이터 다시 로드
        await fetchData()

    } catch (error) {
        console.error('❌ 복원 실패:', error)
        alert('복원에 실패했습니다: ' + error.message)
    } finally {
        closeRestoreModal()
    }
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

    // 타입이 변경되면 선택 상태 및 선택 모드 초기화
    if (storageTable.value) {
        storageTable.value.clearSelection()
    }
    isSelectionMode.value = false

    await fetchData(newType, newPage, newFilters)
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
/* 디버그 모드 표시 (개발 환경에서만) */
.storage-view-container::before {
    content: "🔧 Dev Mode";
    position: fixed;
    top: 8px;
    right: 8px;
    padding: 4px 8px;
    font-size: 12px;
    background-color: #fef3c7;
    color: #92400e;
    border-radius: 4px;
    z-index: 50;
    display: none;
}

/* 개발 모드에서만 디버그 표시 */
@media (prefers-color-scheme: light) {
    .storage-view-container[data-dev="true"]::before {
        display: block;
    }
}
</style>