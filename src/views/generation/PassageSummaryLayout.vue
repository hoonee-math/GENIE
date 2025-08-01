<template>
    <div class="flex flex-col items-start p-0 h-full max-h-full overflow-hidden">
        <div class="flex flex-col items-start p-0 gap-4 w-full h-full max-h-[900px] min-h-[600px]">
            <div>
                <span class="font-bold text-2xl md:text-xl leading-[150%] tracking-[-0.02em] text-[#303030]">
                    지문 분석
                </span>

                <!-- Tooltip 적용 -->
                <BaseTooltip :content="tooltipContent" position="top" class="ml-2" />
            </div>
            <!-- 탭 네비게이션 (복합 지문일 때만 표시) -->
            <div v-if="showTabs" class="flex border-b border-gray-200 w-full">
                <button v-for="(tab, index) in corePointTabs" :key="index" @click="activeTabIndex = index" :class="[
                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                    activeTabIndex === index
                        ? 'border-brand text-brand'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                ]">
                    {{ tab.label }}
                </button>
            </div>

            <div
                class="box-border flex flex-col flex-1 items-start px-4 py-4 gap-4 w-full bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden min-h-0">
                <div v-if="structure" class="flex flex-row items-center w-full gap-4">
                    <p class="font-bold text-sm md:text-base text-nowrap leading-[150%] tracking-[-0.02em] text-[#303030]">
                        지문 종류
                    </p>
                    <p
                        class="font-normal text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030] break-words flex-1">
                        <slot name="type_passage">{{ structure }}</slot>
                    </p>
                </div>
                <div v-if="!structure" class="flex flex-col items-start w-full gap-4">
                    <p class="font-bold text-sm md:text-base text-nowrap leading-[150%] tracking-[-0.02em] text-[#303030]">
                        지문 종류
                    </p>
                    <!-- 단일 지문, 복합 지문, 독서론 을 선택할 수 있는 라디오 버튼, 해당 선택 값을 부모 객체에 전달 -->
                    <slot name="select_generateType" />
                </div>
                <div class="flex flex-row items-center w-full gap-4">
                    <p class="font-bold text-sm md:text-base text-nowrap leading-[150%] tracking-[-0.02em] text-[#303030]">
                        지문 분야
                    </p>
                    <p
                        class="font-normal text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030] break-words flex-1">
                        <slot name="type_passage">{{ pasType }}</slot>
                    </p>
                </div>
                <div class="flex flex-row items-start w-full gap-4">
                    <p class="font-bold text-sm md:text-base text-nowrap leading-[150%] tracking-[-0.02em] text-[#303030] shrink-0">
                        지문 제재
                    </p>
                    <div class="flex-1 min-w-0">
                        <p
                            class="font-normal text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030] break-words whitespace-pre-wrap overflow-hidden">
                            <slot name="keyword">{{ keyword }}</slot>
                        </p>
                    </div>
                </div>

                <div class="flex flex-col items-start gap-4 w-full flex-1 min-h-0 overflow-hidden">
                    <p class="font-bold text-sm md:text-base text-nowrap leading-[150%] tracking-[-0.02em] text-[#303030] shrink-0">
                        핵심 논점
                    </p>
                    <div
                        class="w-full font-normal text-sm md:text-base leading-[200%] tracking-[-0.02em] text-[#303030] flex-1 overflow-y-auto min-h-0 scrollbar-hide">
                        <slot name="generated_core_point">{{ gist }}</slot>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePassage } from '@/composables/usePassage'
import BaseTooltip from '@/components/common/BaseTooltip.vue'

// usePassage composable 사용
const { corePointTabs } = usePassage()

// 현재 활성 탭
const activeTabIndex = ref(0)
const tooltipContent = ref("'지문 생성'또는 '자료실 지문' 중 지니큐 서비스로 생성한 지문을 불러오시면 해당 지문에 대한 분석 내용을 확인하실 수 있습니다.")

// 탭 표시 여부 (복합 지문일 때만)
const showTabs = computed(() => corePointTabs.value.length > 1)

// 현재 선택된 탭의 데이터
const currentTabData = computed(() => {
    if (corePointTabs.value.length === 0) return { pasType: '', keyword: '', gist: '' }
    return corePointTabs.value[activeTabIndex.value] || { pasType: '', keyword: '', gist: '' }
})

// 각 탭별 데이터 (탭이 바뀔 때마다 다른 값 표시)
const pasType = computed(() => currentTabData.value.pasType)
const keyword = computed(() => currentTabData.value.keyword)
const gist = computed(() => currentTabData.value.gist)
// corePointTabs 과 pasType 을 이용해 structure(단일 지문, 복합 지문, 독서론) 계산 structure = generateType 같은 의미로 쓰임
const structure = computed(() => {
    console.log('📥 [DEBUG] PassageSummaryLayout: corePointTabs.value', corePointTabs.value)
    if (corePointTabs.value.length === 1 && corePointTabs.value[0].pasType === '독서론') return '독서론'
    if (corePointTabs.value.length === 1) return '단일 지문'
    if (corePointTabs.value.length > 1) return '복합 지문'
    return null
})

// 탭이 변경될 때 activeTabIndex 초기화
watch(corePointTabs, (newTabs) => {
    if (newTabs.length > 0 && activeTabIndex.value >= newTabs.length) {
        activeTabIndex.value = 0
    }
}, { immediate: true })
</script>

<style scoped>
.scrollbar-hide {
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;
    /* IE 10+ */
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
    /* Chrome, Safari */
}
</style>