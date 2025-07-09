<!-- components/common/BaseTooltip.vue (단순화 버전) -->
<template>
    <div class="relative inline-block">
        <!-- 트리거 요소 -->
        <div 
            @mouseenter="showTooltip = true"
            @mouseleave="showTooltip = false"
            class="cursor-help"
        >
            

            <svg width="17" height="17" viewBox="0 0 17 17" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd"
                    d="M8.50033 6.02083C8.21853 6.02083 7.94828 6.13277 7.74902 6.33203C7.54977 6.53129 7.43783 6.80154 7.43783 7.08333V7.15913C7.43783 7.25306 7.40051 7.34314 7.33409 7.40956C7.26767 7.47598 7.17759 7.51329 7.08366 7.51329C6.98973 7.51329 6.89964 7.47598 6.83322 7.40956C6.76681 7.34314 6.72949 7.25306 6.72949 7.15913V7.08333C6.72949 6.61368 6.91606 6.16326 7.24816 5.83117C7.58025 5.49907 8.03067 5.3125 8.50033 5.3125H8.58249C8.92738 5.31261 9.26398 5.41831 9.547 5.61541C9.83003 5.81251 10.0459 6.09154 10.1656 6.41499C10.2854 6.73843 10.3032 7.09078 10.2167 7.42466C10.1302 7.75853 9.94353 8.05791 9.68183 8.28254L9.1357 8.75075C9.04763 8.82643 8.97692 8.92022 8.92839 9.02571C8.87986 9.1312 8.85466 9.24592 8.85449 9.36204V9.73958C8.85449 9.83351 8.81718 9.9236 8.75076 9.99002C8.68434 10.0564 8.59426 10.0938 8.50033 10.0938C8.40639 10.0938 8.31631 10.0564 8.24989 9.99002C8.18347 9.9236 8.14616 9.83351 8.14616 9.73958V9.36204C8.14616 8.92004 8.33953 8.50071 8.67458 8.21312L9.21999 7.74563C9.37209 7.61531 9.48063 7.44153 9.53099 7.24767C9.58136 7.05381 9.57113 6.84917 9.50169 6.6613C9.43225 6.47343 9.30693 6.31133 9.14259 6.19683C8.97826 6.08232 8.78279 6.0209 8.58249 6.02083H8.50033ZM8.50033 11.6875C8.64122 11.6875 8.77635 11.6315 8.87598 11.5319C8.9756 11.4323 9.03158 11.2971 9.03158 11.1562C9.03158 11.0154 8.9756 10.8802 8.87598 10.7806C8.77635 10.681 8.64122 10.625 8.50033 10.625C8.35943 10.625 8.2243 10.681 8.12468 10.7806C8.02505 10.8802 7.96908 11.0154 7.96908 11.1562C7.96908 11.2971 8.02505 11.4323 8.12468 11.5319C8.2243 11.6315 8.35943 11.6875 8.50033 11.6875Z"
                    clip-rule="evenodd" />
                <path fill-rule="evenodd"
                    d="M2.47949 8.5013C2.47949 6.90448 3.11383 5.37306 4.24295 4.24393C5.37208 3.1148 6.9035 2.48047 8.50033 2.48047C10.0972 2.48047 11.6286 3.1148 12.7577 4.24393C13.8868 5.37306 14.5212 6.90448 14.5212 8.5013C14.5212 10.0981 13.8868 11.6295 12.7577 12.7587C11.6286 13.8878 10.0972 14.5221 8.50033 14.5221C6.9035 14.5221 5.37208 13.8878 4.24295 12.7587C3.11383 11.6295 2.47949 10.0981 2.47949 8.5013ZM8.50033 3.1888C7.09136 3.1888 5.74011 3.74851 4.74382 4.7448C3.74753 5.74108 3.18783 7.09234 3.18783 8.5013C3.18783 9.91026 3.74753 11.2615 4.74382 12.2578C5.74011 13.2541 7.09136 13.8138 8.50033 13.8138C9.90929 13.8138 11.2605 13.2541 12.2568 12.2578C13.2531 11.2615 13.8128 9.91026 13.8128 8.5013C13.8128 7.09234 13.2531 5.74108 12.2568 4.7448C11.2605 3.74851 9.90929 3.1888 8.50033 3.1888Z"
                    clip-rule="evenodd" />
            </svg>
        </div>

        <!-- 말풍선 -->
        <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 transform scale-95"
            enter-to-class="opacity-100 transform scale-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 transform scale-100"
            leave-to-class="opacity-0 transform scale-95"
        >
            <div 
                v-if="showTooltip"
                :class="[
                    'absolute z-50 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg',
                    'break-keep text-center w-max whitespace-normal', // 부모 요소에서 줄바꿈 미허용한걸 풀어주기 위해 사용
                    positionClass
                ]"
                :style="{ maxWidth: maxWidth, width: 'max-content' }"
            >
                {{ content }}
                
                <!-- 말풍선 화살표 -->
                <div :class="arrowClass"></div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    content: {
        type: String,
        required: true
    },
    position: {
        type: String,
        default: 'top'
    },
    maxWidth: {
        type: String,
        default: '300px'    
    }
})

const showTooltip = ref(false)

const positionClass = computed(() => {
    switch (props.position) {
        case 'top':
            return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
        case 'bottom':
            return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
        case 'left':
            return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
        case 'right':
            return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
        default:
            return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
    }
})

const arrowClass = computed(() => {
    const base = 'absolute w-2 h-2 bg-gray-800 transform rotate-45'
    switch (props.position) {
        case 'top':
            return `${base} top-full left-1/2 transform -translate-x-1/2 -mt-1`
        case 'bottom':
            return `${base} bottom-full left-1/2 transform -translate-x-1/2 -mb-1`
        case 'left':
            return `${base} left-full top-1/2 transform -translate-y-1/2 -ml-1`
        case 'right':
            return `${base} right-full top-1/2 transform -translate-y-1/2 -mr-1`
        default:
            return `${base} top-full left-1/2 transform -translate-x-1/2 -mt-1`
    }
})
</script>