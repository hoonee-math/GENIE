<template>
    <!-- isCalledFromGeneratedQuestionView 값으로 하는 일
     1. GeneratedPassageView에서 pinia store를 업데이트하는 fetch 요청에 문항을 포함할지 결정함
     2. PassageEditor 에서 사용하는 parentComponent 값을 GeneratedQuestionView로 인식하게함
     3. PassageEditor 에서 TipTap 에디터 영역을 수정가능하게 만들어줌 -->
    <GeneratedPassageView :isCalledFromGeneratedQuestionView="true">
        <template #questions>
            <div v-for="question in questions">
                <PassageAndQuestionLayout>
                    <template #left>
                        <!-- question.queQuery 생성된 문제문 -->
                        <div class="flex">
                            <div class="font-semibold text-sm md:text-2xl mr-5">
                                Q. {{ question.queQuery }}
                            </div>
                            <!-- 수정 버튼을 누르면 question.queQuery 값과 아래 question.queOption 값을 수정할 수 있게 변경. 각각 TipTap Editor로 따로 구현하거나 더 나은방법 고려해보기. -->
                            <button class="flex flex-row justify-center items-center text-sm md:text-xl pl-2 py-3 w-[86px] h-[35px] left-[1485px] top-[50px] bg-[#CCCCCC] rounded-lg">
                                수정
                                <Icon icon="mingcute:pencil-fill" width="20" height="20" class="mx-1" :class=" false ? 'text-[#0086FF]' : 'text-[#303030]'" />
                            </button>
                        </div>
                        <!-- question.queOption 을 TipTap editor를 이용해 출력해주기. 기본값 editable=false, question.queQuery 옆의 수정 버튼을 눌러 question.queOption의 editable 갑도 true로 변경-->
                        <div>
                            <!-- 현재 question.queOption는 배열 형식인데 String 으로 수정 예정, 임시로 배열을 String으로 바꿔서 TipTap 에디터에 넣어주기. -->
                            {{ question.queOption }} 
                        </div>
                    </template>
                    <template #right>
                        
                        <div class="box-border flex flex-col flex-1 items-start px-4 py-4 gap-4 w-full bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-y-auto scrollbar-hide">
                            <div class="flex flex-row items-center w-full gap-4">
                                <p class="font-bold text-sm md:text-2xl leading-[150%] tracking-[-0.02em] text-[#303030]">
                                    정답
                                </p>
                                <p class="font-normal text-sm md:text-xl leading-[150%] tracking-[-0.02em] text-[#303030] break-words flex-1">
                                    {{ 'ⓐ' }}
                                </p>
                                <button class="flex flex-row justify-center items-center text-sm md:text-xl pl-2 py-3 w-[86px] h-[35px] left-[1485px] top-[50px] bg-[#CCCCCC] rounded-lg">
                                    수정
                                    <Icon icon="mingcute:pencil-fill" width="20" height="20" class="mx-1" :class=" false ? 'text-[#0086FF]' : 'text-[#303030]'" />
                                </button>
                            </div>
                            <div class="flex flex-col items-start gap-4 w-full flex-1">
                                <p class="font-bold text-sm md:text-2xl leading-[150%] tracking-[-0.02em] text-[#303030] min-w-[80px] shrink-0">
                                    해설
                                </p>
                                <div class="w-full font-normal text-sm md:text-xl leading-[200%] tracking-[-0.02em] text-[#303030] flex-1 overflow-auto">
                                    {{ question }}
                                </div>
                            </div>
                            
                        </div>
                    </template>
                </PassageAndQuestionLayout>
            </div>
        </template>
    </GeneratedPassageView>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import GeneratedPassageView from './GeneratedPassageView.vue'
import PassageAndQuestionLayout from './PassageAndQuestionLayout.vue'
import { useQuestion } from '@/composables/useQuestion'
import { usePassage } from '@/composables/usePassage';
import EditButton from '@/components/common/EditButton.vue'

// Router 및 Composables
const router = useRouter()
const { fetchPassage } = usePassage()
const { passage, generateQuestionWithNewPassage } = useQuestion()

const isLoading = ref(false)

const passageQuestion = computed(() => {
    return passage.value.questions || '없음'
})

const questions = computed(() => {
    return passage.value.questions || []
})


</script>