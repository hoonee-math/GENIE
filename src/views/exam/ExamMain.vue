<template>
    <div class="min-h-screen flex flex-col">
        <!-- 상단 헤더 -->
        <header class="bg-white border-b sticky top-0 z-10">
            <div class="max-w-screen-2xl mx-auto px-6 py-3 flex justify-between items-center">
                <h1 class="text-xl font-bold text-gray-800">문제지 생성</h1>
                <div class="flex items-center gap-3">
                    <button
                        class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-50 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        지문 추가
                    </button>
                    <button
                        class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        저장하기
                    </button>
                </div>
            </div>
        </header>

        <!-- 메인 콘텐츠 -->
        <main class="flex-1 max-w-screen-2xl lg:w-[1536px] mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- 왼쪽: 지문 불러오기 패널 -->
            <aside class="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <PassageLoaderPanel />
            </aside>

            <!-- 오른쪽: 문제지 미리보기 (A4 비율 적용) -->
            <div class="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
                <ExamPreview/>
            </div>

        </main>
    </div>

    <!-- ... 모달 및 스크립트는 이전과 동일 ... -->
</template>
<script setup>
import { ref, provide } from 'vue'
import PassageLoaderPanel from '@/components/exam/PassageLoaderPanel.vue'
import ExamPreview from '@/components/exam/ExamPreview.vue'
import { useGenerateExam } from '@/composables/useGenerateExam'

// useGenerateExam composable 사용 (부모 컴포넌트에서 단일 인스턴스 생성)
const generateExamComposable = useGenerateExam()

// 하위 컴포넌트들이 같은 인스턴스를 사용할 수 있도록 provide
provide('generateExam', generateExamComposable)

const {
    examData,
    loadedPassages,
    totalQuestionCount,
    passageCount
} = generateExamComposable

</script>
<style></style>