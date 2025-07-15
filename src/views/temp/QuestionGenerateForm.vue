<template>
    <div class="flex flex-col gap-8 p-0 md:p-8 box-border w-full">
        
        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
            <div class="flex flex-col items-center">
                <svg class="animate-spin h-12 w-12 text-brand mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-gray-600">지문 데이터를 불러오는 중...</p>
            </div>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="errorMessage" class="flex justify-center items-center min-h-[400px]">
            <div class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md w-full">
                <div class="flex">
                    <svg class="w-6 h-6 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                    </svg>
                    <div>
                        <h3 class="font-semibold">오류 발생</h3>
                        <p>{{ errorMessage }}</p>
                        <button @click="loadPassageData" class="mt-2 text-sm underline hover:no-underline">
                            다시 시도
                        </button>
                    </div>
                </div>
            </div>
        </div>


        <PassageAndQuestionLayout >
            <template #title>
                <!-- 기존 InsertPassage.vue 의 작업 이름이 들어갈 위치 -->
                {{ passageTitle }}
            </template>

            <template #left>
                <!-- 기존 InsertPassage.vue 의 사용자 입력/자료질 지문 탭 이 들어갈 위치 -->

                <!-- 탭 전환시에 기존 UserInsertPassage/StoresInsertPassage 대신에 TipTap 에디터를 이용해서 값을 입력해줄 위치 
                - 사용자 입력 탭이 활성화 된 경우에는 바로 입력 가능하도록 설정
                - 자료실 지문 탭이 활성화 시킨 경우 바로 모달창이 뜨도록 설정, 데이터를 호출하지 않고 모달을 닫으면 다시 사용자 입력 탭으로 되돌리기.
                - GeneratedPassageView.vue 에서 추가 예정인 [문항 이어서 생성하기] 버튼을 클릭하면 캐시에 저장된 해당 데이터를 바로 자료실 지문 탭에 출력 -->

                <!-- TipTap 에디터 -->
                <div class="box-border flex flex-row justify-center items-center p-8 gap-2 bg-white border border-[#757575] rounded-xl mt-4">
                    <editor-content 
                    :editor="editor" 
                    class="w-full h-[398px] min-h-[398px] font-normal text-base leading-7 tracking-[-0.02em] text-[#303030] outline-none overflow-y-auto text-left"
                    />
                </div>
            </template>

            <template #right>
                <!-- 지문 불러오기를 통해서 가져온 지문에 대한 지문 분석 데이터 출력 (Pinia Store에서 자동으로 데이터 가져옴) -->
                <PassageSummaryLayout />
            </template>
        </PassageAndQuestionLayout>

        <!-- 초기화 버튼과 문항 유형 선택하기 버튼 추가, Button 은 BaseButton 컴포넌트 이용방식으로 사용해보기 
        - 초기화 버튼 클릭시 위에 입력한 데이터 초기화 
        - 문항 유형 선택하기 클릭시 기존에 모달로 사용했던 GenerateQuestionModal을 PassageAndQuestionLayout 아래에 출력되도록 설정. 이 때 초기화 버튼과 문항 유형 선택하기 버튼이 사라지고 나타난다. 이 때 PassageAndQuestionLayout의 #right 도 사라지고 #right 지문이 PassageAndQuestionLayout 전체를 차지하게 된다.
        -->
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PassageAndQuestionLayout from './PassageAndQuestionLayout.vue';
import PassageEditor from './PassageEditor.vue';

// 로딩 및 에러 상태
const isLoading = ref(true)
const errorMessage = ref('')

// TipTapEditor 관련 변수
const savedContent = ref('')
const currentLength = ref(0)
const numberLength = ref(3000)

const questionTitle = ref('Untitled');
</script>
