<template>
    <div>
        <div>
            <label for="test-name" class="block text-base font-bold text-gray-800 mb-2">
                문제지 이름 <span class="text-red-500">*</span>
            </label>
            <input type="text" id="test-name" v-model="testName" placeholder="작업이름을 입력해 주세요."
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
        </div>

        <div v-if="loadedPassages.length === 0"
            class="mt-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center py-16 hover:border-blue-400 hover:bg-blue-50/20 transition-all">

            <div key="empty" class="text-lg text-gray-500">
                <Icon icon="heroicons:document-plus" class="w-12 h-12 mx-auto mb-4 text-brand" />

                <p class="mt-3 text-black font-bold">새로운 문제지 만들기</p>
                <p class="mt-3">만들어 둔 지문을 불러와</p>
                <p>쉽고 빠르게 문제지를 생성해 보세요.</p>
            </div>

            <button @click="openPassageModal"
                class="mt-4 bg-brand text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition flex items-center gap-2 focus-ring">
                <Icon icon="heroicons:plus" class="h-5 w-5" />
                지문 불러오기
            </button>
        </div>

        <!-- 에러 메시지 -->
        <Transition name="fade">
            <div v-if="error" class="mt-4 p-3 rounded-lg error-message text-red-700 text-sm">
                <div class="flex items-center">
                    <Icon icon="heroicons:exclamation-triangle" class="w-5 h-5 mr-2" />
                    {{ error }}
                    <button @click="clearError" class="ml-auto text-red-500 hover:text-red-700">
                        <Icon icon="heroicons:x-mark" class="w-4 h-4" />
                    </button>
                </div>
            </div>
        </Transition>

        <!-- 로딩 상태 -->
        <Transition name="fade">
            <div v-if="isLoading" class="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-brand text-sm">
                <div class="flex items-center">
                    <div class="w-5 h-5 mr-2 loading">
                        <Icon icon="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
                    </div>
                    지문을 불러오는 중...
                </div>
            </div>
        </Transition>

        <!-- 성공 메시지 -->
        <Transition name="fade">
            <div v-if="showSuccess" class="mt-4 p-3 rounded-lg success-message text-green-700 text-sm">
                <div class="flex items-center">
                    <Icon icon="heroicons:check-circle" class="w-5 h-5 mr-2" />
                    {{ successMessage }}
                    <button @click="showSuccess = false" class="ml-auto text-green-500 hover:text-green-700">
                        <Icon icon="heroicons:x-mark" class="w-4 h-4" />
                    </button>
                </div>
            </div>
        </Transition>


        <!-- 통계 정보 -->
        <Transition name="slideUp">
            <div v-if="loadedPassages.length > 0" class="mt-6 grid grid-cols-2 gap-4 text-center">
                <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600">{{ passageCount }}</div>
                    <div class="text-xs text-blue-500">지문</div>
                </div>
                <div class="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg">
                    <div class="text-2xl font-bold text-green-600">{{ totalQuestionCount }}</div>
                    <div class="text-xs text-green-500">문제</div>
                </div>
            </div>
        </Transition>

        <!-- 로드된 지문 리스트 영역 -->
        <TransitionGroup name="passage" tag="div" class="mt-8 space-y-6" id="worksheet-container">
            <PassageBlock v-for="(passage, index) in loadedPassages" :key="passage.id" :passage="passage" :index="index"
                @toggle="handleTogglePassage(passage.id)" @addQuestion="handleAddQuestion(passage.id)"
                @deleteQuestion="handleDeleteQuestion(passage.id, $event)"
                @updateQuestion="handleUpdateQuestion(passage.id, $event.id, $event)"
                @remove="handleRemovePassage(passage.id)" @copy="handleCopyQuestion" />
        </TransitionGroup>

        <!-- Load Passage Modal -->
        <LoadPassageModal :isOpen="showPassageModal" @close="closePassageModal" @selectPasCode="handlePassageLoad" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import LoadPassageModal from '@/components/generation/LoadPassageModal.vue'
import PassageBlock from './PassageBlock.vue'
import { useGenerateExam, useDragAndDrop } from '@/composables/useGenerateExam'
import Sortable from 'sortablejs'

// Props와 Emits
const props = defineProps({
    // 필요한 props 정의
})

const emit = defineEmits(['passageLoaded', 'examDataChanged'])

// 성공 메시지 상태
const successMessage = ref('')
const showSuccess = ref(false)

// 성공 메시지 표시 함수
const displaySuccess = (message) => {
    successMessage.value = message
    showSuccess.value = true
    setTimeout(() => {
        showSuccess.value = false
    }, 3000)
}

// Composables 사용
const {
    examData,
    loadedPassages,
    isLoading,
    error,
    totalQuestionCount,
    passageCount,
    loadPassage,
    removePassage,
    reorderPassages,
    togglePassage,
    addQuestion,
    deleteQuestion,
    reorderQuestions,
    getPassageTypeClass,
    clearError
} = useGenerateExam()

const { startDrag, endDrag, canDrop } = useDragAndDrop()

// 반응형 상태
const showPassageModal = ref(false)
const passageSortable = ref(null)
const questionSortables = ref([])

// 문제지 이름을 examData와 동기화
const testName = computed({
    get: () => examData.value.title,
    set: (value) => {
        examData.value.title = value
        emit('examDataChanged', examData.value)
    }
})

// 지문 불러오기 모달 관련
const openPassageModal = () => {
    showPassageModal.value = true
}

const closePassageModal = () => {
    showPassageModal.value = false
}

const handlePassageLoad = async (pasCode) => {
    console.log('선택된 지문 코드:', pasCode)

    try {
        const success = await loadPassage(pasCode)
        if (success) {
            const loadedPassage = loadedPassages.value[loadedPassages.value.length - 1]
            emit('passageLoaded', loadedPassage)
            emit('examDataChanged', examData.value)

            // 성공 메시지 표시
            displaySuccess(`'${loadedPassage.title}' 지문이 성공적으로 추가되었습니다.`)

            // 드래그 앤 드롭 기능 재초기화
            await nextTick()
            initializeSortable()
        }
    } catch (error) {
        console.error('지문 로드 실패:', error)
    }
}

// 지문 관련 함수들 (기존 로직을 useGenerateExam composable에서 가져옴)
const handleTogglePassage = (passageId) => {
    togglePassage(passageId)
    emit('examDataChanged', examData.value)
}

const handleAddQuestion = async (passageId) => {
    addQuestion(passageId)
    emit('examDataChanged', examData.value)

    displaySuccess('새로운 문제가 추가되었습니다.')

    // 새 문제 추가 후 드래그 앤 드롭 기능 재초기화
    await nextTick()
    initializeSortable()
}

const handleDeleteQuestion = (passageId, questionId) => {
    deleteQuestion(passageId, questionId)
    emit('examDataChanged', examData.value)
}

const handleUpdateQuestion = (passageId, questionId, updates) => {
    updateQuestion(passageId, questionId, updates)
    emit('examDataChanged', examData.value)
}

const handleRemovePassage = (passageId) => {
    removePassage(passageId)
    emit('examDataChanged', examData.value)
}

const handleCopyQuestion = (question) => {
    displaySuccess(`문제 '찄{question.text.substring(0, 20)}...'가 복사되었습니다.`)
}

// 드래그 앤 드롭 초기화
const initializeSortable = () => {
    // 기존 인스턴스 정리
    if (passageSortable.value) {
        passageSortable.value.destroy()
    }
    questionSortables.value.forEach(sortable => {
        if (sortable) sortable.destroy()
    })
    questionSortables.value = []

    // 지문 드래그 앤 드롭 설정
    const worksheetContainer = document.getElementById('worksheet-container')
    if (worksheetContainer) {
        passageSortable.value = Sortable.create(worksheetContainer, {
            animation: 150,
            handle: '.passage-drag-handle',
            draggable: '.passage-block',
            ghostClass: 'ghost-class',
            onEnd: (evt) => {
                reorderPassages(evt.oldIndex, evt.newIndex)
                emit('examDataChanged', examData.value)
            }
        })
    }

    // 문제 드래그 앤 드롭 설정
    const questionLists = document.querySelectorAll('.questions-list')
    questionLists.forEach((list, index) => {
        const passageId = loadedPassages.value[index]?.id
        if (passageId) {
            const sortable = Sortable.create(list, {
                animation: 150,
                handle: '.question-drag-handle',
                draggable: '.question-item',
                filter: 'button',
                ghostClass: 'ghost-class',
                onEnd: (evt) => {
                    reorderQuestions(passageId, evt.oldIndex, evt.newIndex)
                    emit('examDataChanged', examData.value)
                }
            })
            questionSortables.value.push(sortable)
        }
    })
}

// 컴포넌트 마운트 시 초기화
onMounted(() => {
    // 에러 초기화
    clearError()

    // DOM 업데이트 후 드래그 앤 드롭 초기화
    nextTick(() => {
        initializeSortable()
    })
})
</script>

<style scoped>
/* 지문 접기/펴기 애니메이션 */
/* ===== 전역 유틸리티 ===== */

/* 스크롤 개선 */
.scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
}

.scrollbar-thin::-webkit-scrollbar {
    width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

/* 선택 비활성화 */
.user-select-none {
    user-select: none;
}

/* 포커스 링 개선 */
.focus-ring {
    transition: box-shadow 0.2s;
}

.focus-ring:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #3b82f6, 0 0 0 4px rgba(59, 130, 246, 0.3);
}

/* ===== 드래그 앤 드롭 ===== */

.ghost-class {
    opacity: 0.4;
    background: linear-gradient(135deg, #e0f2fe, #b3e5fc);
    transform: rotate(2deg) scale(1.02);
    border: 2px dashed #0086ff;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 134, 255, 0.3);
    backdrop-filter: blur(4px);
}

/* ===== 반응형 디자인 ===== */

/* 모바일 최적화 */
@media (max-width: 768px) {
    .passage-block {
        margin: 0 -4px;
    }

    .question-item {
        padding: 12px 8px;
    }

    .action-btn {
        opacity: 1 !important;
        /* 모바일에서는 항상 표시 */
    }
}

/* 다크 모드 대비 */
@media (prefers-color-scheme: dark) {
    .passage-block {
        border-color: #374151;
    }

    .ghost-class {
        background: linear-gradient(135deg, #1e293b, #334155);
        border-color: #60a5fa;
    }
}

/* ===== 인터렉티브 요소 ===== */

/* 버튼 공통 스타일 */
button {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 6px;
}

button:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.05);
}

button:active:not(:disabled) {
    transform: translateY(0);
    filter: brightness(0.95);
}

button:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
}

/* 입력 필드 공통 스타일 */
input,
textarea {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

input:focus,
textarea:focus {
    transform: scale(1.01);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* ===== 애니메이션 키프레임 ===== */

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-4px);
    }
}

/* 유틸리티 클래스 */
.loading {
    animation: pulse 1.5s ease-in-out infinite;
}

.animate-spin {
    animation: spin 1s linear infinite;
}

.animate-bounce {
    animation: bounce 0.6s ease-in-out;
}

/* ===== 애니메이션 ===== */

/* 지문 리스트 애니메이션 */
.passage-enter-active {
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.passage-leave-active {
    transition: all 0.4s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

.passage-enter-from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
}

.passage-leave-to {
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
}

.passage-move {
    transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Fade 애니메이션 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Slide Up 애니메이션 */
.slideUp-enter-active {
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slideUp-leave-active {
    transition: all 0.3s ease;
}

.slideUp-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.slideUp-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

/* ===== 컴포넌트 스타일 ===== */

/* 메시지 스타일 */
.error-message,
.success-message {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-message {
    background: linear-gradient(135deg, #fef2f2, #fee2e2);
    border-left: 4px solid #ef4444;
}

.success-message {
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    border-left: 4px solid #22c55e;
}
</style>